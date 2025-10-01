package com.education.admin.modules.teacher.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.teacher.entity.TeacherCertification;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.modules.teacher.mapper.TeacherCertificationMapper;
import com.education.admin.modules.teacher.service.TeacherCertificationService;
import com.education.admin.modules.teacher.dto.TeacherCertificationRequest;
import com.education.admin.modules.teacher.dto.TeacherCertificationResponse;
import com.education.admin.modules.teacher.dto.TeacherCertificationAuditRequest;
import com.education.admin.modules.teacher.dto.InterviewNotificationRequest;
import com.education.admin.modules.teacher.dto.TeacherGradeRequest;
import com.education.admin.modules.teacher.service.TeacherNotificationService;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;
import com.education.admin.modules.system.service.TeacherLevelConfigService;

/**
 * 教师认证服务实现类
 *
 * @author education
 * @since 2025-08-16
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherCertificationServiceImpl implements TeacherCertificationService {

    private final TeacherCertificationMapper certificationMapper;
    private final TeacherMapper teacherMapper;
    private final TeacherNotificationService notificationService;
    private final TeacherLevelConfigService levelConfigService;

    /**
     * 认证状态映射
     */
    private static final Map<Integer, String> STATUS_MAP = new HashMap<>();
    
    static {
        STATUS_MAP.put(0, "待审核");
        STATUS_MAP.put(1, "审核通过");
        STATUS_MAP.put(2, "审核拒绝");
        STATUS_MAP.put(3, "待面试");
        STATUS_MAP.put(4, "面试通过");
        STATUS_MAP.put(5, "面试不通过");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> submitCertification(Long teacherId, TeacherCertificationRequest request) {
        try {
            // 检查是否已有认证记录
            TeacherCertification existing = certificationMapper.selectLatestByTeacherId(teacherId);
            
            // 只有审核通过(1)或面试通过(4)的认证才不能重新提交
            if (existing != null && (existing.getCertificationStatus() == 1 || existing.getCertificationStatus() == 4)) {
                return Result.error("您的认证已通过，无需重复提交");
            }

            if (existing != null) {
                // 更新现有记录
                BeanUtils.copyProperties(request, existing);
                existing.setCertificationStatus(0); // 重新设为待审核
                existing.setSubmitTime(LocalDateTime.now());
                existing.setUpdateTime(LocalDateTime.now());
                // 清空之前的审核信息
                existing.setAuditTime(null);
                existing.setAuditUserId(null);
                existing.setAuditUserName(null);
                existing.setAuditReason(null);
                existing.setInterviewTime(null);
                existing.setInterviewResult(null);

                int result = certificationMapper.updateCertificationById(existing);
                if (result <= 0) {
                    return Result.error("更新认证失败");
                }
                log.info("教师{}重新提交认证申请成功", teacherId);
            } else {
                // 创建新认证记录
                TeacherCertification certification = new TeacherCertification();
                BeanUtils.copyProperties(request, certification);
                certification.setTeacherId(teacherId);
                certification.setCertificationStatus(0); // 待审核
                certification.setSubmitTime(LocalDateTime.now());
                certification.setCreateTime(LocalDateTime.now());
                certification.setUpdateTime(LocalDateTime.now());

                int result = certificationMapper.insertCertification(certification);
                if (result <= 0) {
                    return Result.error("提交认证失败");
                }
                log.info("教师{}首次提交认证申请成功", teacherId);
            }

            return Result.success();

        } catch (Exception e) {
            log.error("提交教师认证失败", e);
            return Result.error("提交认证失败：" + e.getMessage());
        }
    }

    @Override
    public Result<TeacherCertificationResponse> getCertificationStatus(Long teacherId) {
        try {
            TeacherCertification certification = certificationMapper.selectLatestByTeacherId(teacherId);
            if (certification == null) {
                return Result.success(null);
            }

            TeacherCertificationResponse response = new TeacherCertificationResponse();
            BeanUtils.copyProperties(certification, response);
            // 合同状态与URL映射（来自 teacher_info）
            try {
                Teacher teacher = teacherMapper.findById(teacherId);
                if (teacher != null) {
                    response.setContractStatus(teacher.getContractStatus());
                    response.setContractUrl(teacher.getContractUrl());
                    response.setTeacherLevel(teacher.getTeacherLevel());
                    // 映射课时费：按等级配置覆盖
                    BigDecimal mapped = levelConfigService.getHourlyRateByLevel(teacher.getTeacherLevel());
                    response.setHourlyRate(mapped != null ? mapped : teacher.getHourlyRate());
                }
            } catch (Exception ignored) {}
            
            // 设置状态文本
            response.setCertificationStatusText(STATUS_MAP.get(certification.getCertificationStatus()));
            response.setGenderText(certification.getGender() == 1 ? "男" : "女");

            return Result.success(response);

        } catch (Exception e) {
            log.error("获取认证状态失败", e);
            return Result.error("获取认证状态失败");
        }
    }

    @Override
    public Result<PageInfo<TeacherCertificationResponse>> getCertificationList(
            Integer page, Integer size, String teacherName, String realName, Integer certificationStatus) {
        try {
            PageHelper.startPage(page, size);
            PageInfo<TeacherCertificationResponse> pageInfo = new PageInfo<>(
                    certificationMapper.selectCertificationPage(teacherName, realName, certificationStatus));

            // 设置状态文本和性别文本
            pageInfo.getList().forEach(record -> {
                record.setCertificationStatusText(STATUS_MAP.get(record.getCertificationStatus()));
                if (record.getGender() != null) {
                    record.setGenderText(record.getGender() == 1 ? "男" : "女");
                }
            });

            return Result.success(pageInfo);

        } catch (Exception e) {
            log.error("获取认证列表失败", e);
            return Result.error("获取认证列表失败");
        }
    }

    @Override
    public Result<TeacherCertificationResponse> getCertificationDetail(Long id) {
        try {
            TeacherCertificationResponse response = certificationMapper.selectCertificationDetailById(id);
            if (response == null) {
                return Result.error("认证记录不存在");
            }

            // 设置状态文本和性别文本
            response.setCertificationStatusText(STATUS_MAP.get(response.getCertificationStatus()));
            if (response.getGender() != null) {
                response.setGenderText(response.getGender() == 1 ? "男" : "女");
            }

            return Result.success(response);

        } catch (Exception e) {
            log.error("获取认证详情失败", e);
            return Result.error("获取认证详情失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> auditCertification(TeacherCertificationAuditRequest request, String auditUserName) {
        try {
            TeacherCertification certification = certificationMapper.selectCertificationById(request.getId());
            if (certification == null) {
                return Result.error("认证记录不存在");
            }

            if (certification.getCertificationStatus() != 0) {
                return Result.error("该认证已经审核过了");
            }

            // 更新审核信息
            certification.setCertificationStatus(request.getCertificationStatus());
            certification.setAuditReason(request.getAuditReason());
            certification.setAuditUserName(auditUserName);
            certification.setAuditTime(LocalDateTime.now());
            certification.setUpdateTime(LocalDateTime.now());

            // 如果是安排面试，设置面试时间并发送面试通知
            if (request.getCertificationStatus() == 3 && request.getInterviewTime() != null) {
                certification.setInterviewTime(request.getInterviewTime());
            }

            int updated = certificationMapper.updateCertificationById(certification);
            if (updated <= 0) {
                return Result.error("审核失败");
            }

            // 发送审核通知
            notificationService.sendAuditNotification(
                    request.getId(), 
                    request.getCertificationStatus(), 
                    request.getAuditReason()
            );

            // 如果是安排面试，自动发送面试通知
            if (request.getCertificationStatus() == 3 && request.getInterviewTime() != null) {
                String interviewContent = String.format("您的教师认证审核已通过，面试时间安排在：%s。请准时参加面试。", 
                        request.getInterviewTime().toString());
                
                InterviewNotificationRequest interviewRequest = new InterviewNotificationRequest();
                interviewRequest.setCertificationId(request.getId());
                interviewRequest.setInterviewTime(request.getInterviewTime());
                interviewRequest.setContent(interviewContent);
                
                // 发送面试通知（忽略失败，不影响主流程）
                try {
                    notificationService.sendInterviewNotification(interviewRequest);
                    log.info("自动发送面试通知成功，认证ID：{}", request.getId());
                } catch (Exception e) {
                    log.warn("自动发送面试通知失败，认证ID：{}，错误：{}", request.getId(), e.getMessage());
                }
            }

            log.info("认证ID:{}审核完成，状态：{}，审核人：{}", 
                    request.getId(), request.getCertificationStatus(), auditUserName);
            return Result.success();

        } catch (Exception e) {
            log.error("审核认证失败", e);
            return Result.error("审核失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateInterviewResult(Long id, String interviewResult, Integer status) {
        try {
            TeacherCertification certification = certificationMapper.selectCertificationById(id);
            if (certification == null) {
                return Result.error("认证记录不存在");
            }

            if (certification.getCertificationStatus() != 3) {
                return Result.error("该认证未处于待面试状态");
            }

            // 更新面试结果
            certification.setInterviewResult(interviewResult);
            certification.setCertificationStatus(status); // 4-面试通过，5-面试不通过
            certification.setUpdateTime(LocalDateTime.now());

            int updated = certificationMapper.updateCertificationById(certification);
            if (updated <= 0) {
                return Result.error("更新面试结果失败");
            }

            log.info("更新认证ID:{}面试结果，状态：{}", id, status);
            return Result.success();

        } catch (Exception e) {
            log.error("更新面试结果失败", e);
            return Result.error("更新面试结果失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> sendInterviewNotification(InterviewNotificationRequest request) {
        try {
            // 发送面试通知
            Result<Void> result = notificationService.sendInterviewNotification(request);
            if (!result.isSuccess()) {
                return result;
            }

            log.info("面试通知发送成功，认证ID：{}", request.getCertificationId());
            return Result.success();

        } catch (Exception e) {
            log.error("发送面试通知失败", e);
            return Result.error("发送面试通知失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> gradeTeacher(TeacherGradeRequest request, String gradeUserName) {
        try {
            TeacherCertification certification = certificationMapper.selectCertificationById(request.getId());
            if (certification == null) {
                return Result.error("认证记录不存在");
            }

            if (certification.getCertificationStatus() != 3 && certification.getCertificationStatus() != 4) {
                return Result.error("该认证未处于待面试或面试通过状态，不能进行评级");
            }

            // 更新认证表中的评级信息
            certification.setTeacherLevel(request.getTeacherLevel());
            certification.setGradeTime(LocalDateTime.now());
            certification.setGradeUserName(gradeUserName);
            certification.setGradeReason(request.getGradeReason());
            certification.setCertificationStatus(4); // 评级完成后设置为面试通过状态
            certification.setUpdateTime(LocalDateTime.now());

            int updated = certificationMapper.updateCertificationById(certification);
            if (updated <= 0) {
                return Result.error("教师评级失败");
            }

            // 发送评级通知
            notificationService.sendGradeNotification(
                    request.getId(), 
                    request.getTeacherLevel(), 
                    request.getGradeReason()
            );

            log.info("教师评级完成，认证ID：{}，等级：{}，评级人：{}", 
                    request.getId(), request.getTeacherLevel(), gradeUserName);
            return Result.success();

        } catch (Exception e) {
            log.error("教师评级失败", e);
            return Result.error("教师评级失败：" + e.getMessage());
        }
    }

    @Override
    public Result<Object> getCertificationStatistics() {
        try {
            // 依据 init.sql 的 teacher_certification 表字段做聚合统计
            // 由于当前未有专门的统计Mapper，这里直接通过已有 Mapper 做简化统计：
            // - 各状态数量
            // - 今日提交数量
            // - 本月提交数量
            // - 面试安排数量
            // 说明：为避免大量新增 SQL，这里用分页查询基础上在内存统计；若数据量大，建议新增统计 SQL。

            java.util.List<com.education.admin.modules.teacher.dto.TeacherCertificationResponse> all =
                    certificationMapper.selectCertificationPage(null, null, null);

            int total = 0;
            int pending = 0;          // 0 待审核
            int approved = 0;         // 1 审核通过
            int rejected = 0;         // 2 审核拒绝
            int interviewPending = 0; // 3 待面试
            int interviewPass = 0;    // 4 面试通过
            int interviewFail = 0;    // 5 面试不通过
            int interviewScheduled = 0; // 有面试时间的

            int todaySubmitted = 0;
            int monthSubmitted = 0;

            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.YearMonth ym = java.time.YearMonth.now();

            for (var r : all) {
                total++;
                Integer st = r.getCertificationStatus();
                if (st != null) {
                    switch (st) {
                        case 0: pending++; break;
                        case 1: approved++; break;
                        case 2: rejected++; break;
                        case 3: interviewPending++; break;
                        case 4: interviewPass++; break;
                        case 5: interviewFail++; break;
                        default: break;
                    }
                }

                if (r.getInterviewTime() != null) {
                    interviewScheduled++;
                }

                if (r.getSubmitTime() != null) {
                    java.time.LocalDate d = r.getSubmitTime().toLocalDate();
                    if (today.equals(d)) todaySubmitted++;
                    if (ym.equals(java.time.YearMonth.from(d))) monthSubmitted++;
                }
            }

            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("total", total);
            data.put("pending", pending);
            data.put("approved", approved);
            data.put("rejected", rejected);
            data.put("interviewPending", interviewPending);
            data.put("interviewPass", interviewPass);
            data.put("interviewFail", interviewFail);
            data.put("interviewScheduled", interviewScheduled);
            data.put("todaySubmitted", todaySubmitted);
            data.put("monthSubmitted", monthSubmitted);

            return Result.success(data);
        } catch (Exception e) {
            log.error("获取教师认证统计失败", e);
            return Result.error("统计失败：" + e.getMessage());
        }
    }
}