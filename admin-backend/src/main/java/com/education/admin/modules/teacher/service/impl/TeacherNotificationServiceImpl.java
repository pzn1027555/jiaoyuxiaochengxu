package com.education.admin.modules.teacher.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.teacher.entity.TeacherNotification;
import com.education.admin.modules.teacher.entity.TeacherCertification;
import com.education.admin.modules.teacher.mapper.TeacherNotificationMapper;
import com.education.admin.modules.teacher.mapper.TeacherCertificationMapper;
import com.education.admin.modules.teacher.service.TeacherNotificationService;
import com.education.admin.modules.teacher.dto.TeacherNotificationResponse;
import com.education.admin.modules.teacher.dto.InterviewNotificationRequest;
import com.education.admin.modules.badge.service.UserBadgeNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 教师通知服务实现类
 *
 * @author education
 * @since 2025-08-16
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherNotificationServiceImpl implements TeacherNotificationService {

    private final TeacherNotificationMapper notificationMapper;
    private final TeacherCertificationMapper certificationMapper;
    private final UserBadgeNotificationService badgeService;

    /**
     * 通知类型映射
     */
    private static final Map<String, String> TYPE_MAP = new HashMap<>();
    
    /**
     * 教师等级映射
     */
    private static final Map<String, String> LEVEL_MAP = new HashMap<>();
    
    static {
        TYPE_MAP.put("interview", "面试通知");
        TYPE_MAP.put("grade", "评级通知");
        TYPE_MAP.put("audit", "审核通知");
        
        LEVEL_MAP.put("junior", "初级教师");
        LEVEL_MAP.put("intermediate", "中级教师");
        LEVEL_MAP.put("senior", "高级教师");
        LEVEL_MAP.put("expert", "专家教师");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> sendInterviewNotification(InterviewNotificationRequest request) {
        try {
            // 获取认证信息
            TeacherCertification certification = certificationMapper.selectCertificationById(request.getCertificationId());
            if (certification == null) {
                return Result.error("认证记录不存在");
            }

            // 创建通知
            TeacherNotification notification = new TeacherNotification();
            notification.setTeacherId(certification.getTeacherId());
            notification.setType(TeacherNotification.TYPE_INTERVIEW);
            notification.setTitle("面试安排通知");
            notification.setContent(request.getContent());
            notification.setCertificationId(request.getCertificationId());
            notification.setInterviewTime(request.getInterviewTime());
            notification.setIsRead(0);
            notification.setCreateTime(LocalDateTime.now());
            notification.setUpdateTime(LocalDateTime.now());

            int result = notificationMapper.insertNotification(notification);
            if (result <= 0) {
                return Result.error("发送面试通知失败");
            }

            // 显示教师认证红点
            try {
                badgeService.showBadge(certification.getTeacherId(), "teacher", "certification", 0);
                log.info("教师认证红点已显示，教师ID：{}", certification.getTeacherId());
            } catch (Exception e) {
                log.warn("显示教师认证红点失败，教师ID：{}，错误：{}", certification.getTeacherId(), e.getMessage());
                // 不影响主流程，继续执行
            }

            log.info("面试通知发送成功，教师ID：{}，认证ID：{}", certification.getTeacherId(), request.getCertificationId());
            return Result.success();

        } catch (Exception e) {
            log.error("发送面试通知失败", e);
            return Result.error("发送面试通知失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> sendGradeNotification(Long certificationId, String teacherLevel, String gradeReason) {
        try {
            // 获取认证信息
            TeacherCertification certification = certificationMapper.selectCertificationById(certificationId);
            if (certification == null) {
                return Result.error("认证记录不存在");
            }

            // 创建通知内容
            String levelText = LEVEL_MAP.getOrDefault(teacherLevel, teacherLevel);
            String content = String.format("恭喜您！您的教师认证已通过，评定等级为：%s", levelText);
            if (gradeReason != null && !gradeReason.trim().isEmpty()) {
                content += "\n评级说明：" + gradeReason;
            }

            // 创建通知
            TeacherNotification notification = new TeacherNotification();
            notification.setTeacherId(certification.getTeacherId());
            notification.setType(TeacherNotification.TYPE_GRADE);
            notification.setTitle("教师等级评定通知");
            notification.setContent(content);
            notification.setCertificationId(certificationId);
            notification.setTeacherLevel(teacherLevel);
            notification.setIsRead(0);
            notification.setCreateTime(LocalDateTime.now());
            notification.setUpdateTime(LocalDateTime.now());

            int result = notificationMapper.insertNotification(notification);
            if (result <= 0) {
                return Result.error("发送评级通知失败");
            }

            // 显示教师认证红点
            try {
                badgeService.showBadge(certification.getTeacherId(), "teacher", "certification", 0);
                log.info("教师认证红点已显示，教师ID：{}", certification.getTeacherId());
            } catch (Exception e) {
                log.warn("显示教师认证红点失败，教师ID：{}，错误：{}", certification.getTeacherId(), e.getMessage());
                // 不影响主流程，继续执行
            }

            log.info("评级通知发送成功，教师ID：{}，认证ID：{}，等级：{}", 
                    certification.getTeacherId(), certificationId, teacherLevel);
            return Result.success();

        } catch (Exception e) {
            log.error("发送评级通知失败", e);
            return Result.error("发送评级通知失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> sendAuditNotification(Long certificationId, Integer certificationStatus, String auditReason) {
        try {
            // 获取认证信息
            TeacherCertification certification = certificationMapper.selectCertificationById(certificationId);
            if (certification == null) {
                return Result.error("认证记录不存在");
            }

            // 根据审核状态创建通知内容
            String title;
            String content;
            
            switch (certificationStatus) {
                case 1:
                    title = "认证审核通过";
                    content = "恭喜您！您的教师认证材料审核已通过。";
                    break;
                case 2:
                    title = "认证审核未通过";
                    content = "很抱歉，您的教师认证材料审核未通过。";
                    break;
                case 3:
                    title = "安排面试通知";
                    content = "您的教师认证材料审核通过，我们将安排面试。";
                    break;
                default:
                    title = "认证审核通知";
                    content = "您的教师认证状态已更新。";
                    break;
            }
            
            if (auditReason != null && !auditReason.trim().isEmpty()) {
                content += "\n审核意见：" + auditReason;
            }

            // 创建通知
            TeacherNotification notification = new TeacherNotification();
            notification.setTeacherId(certification.getTeacherId());
            notification.setType(TeacherNotification.TYPE_AUDIT);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setCertificationId(certificationId);
            notification.setIsRead(0);
            notification.setCreateTime(LocalDateTime.now());
            notification.setUpdateTime(LocalDateTime.now());

            int result = notificationMapper.insertNotification(notification);
            if (result <= 0) {
                return Result.error("发送审核通知失败");
            }

            // 显示教师认证红点
            try {
                badgeService.showBadge(certification.getTeacherId(), "teacher", "certification", 0);
                log.info("教师认证红点已显示，教师ID：{}", certification.getTeacherId());
            } catch (Exception e) {
                log.warn("显示教师认证红点失败，教师ID：{}，错误：{}", certification.getTeacherId(), e.getMessage());
                // 不影响主流程，继续执行
            }

            log.info("审核通知发送成功，教师ID：{}，认证ID：{}，状态：{}", 
                    certification.getTeacherId(), certificationId, certificationStatus);
            return Result.success();

        } catch (Exception e) {
            log.error("发送审核通知失败", e);
            return Result.error("发送审核通知失败：" + e.getMessage());
        }
    }

    @Override
    public Result<List<TeacherNotificationResponse>> getNotificationList(Long teacherId) {
        try {
            List<TeacherNotification> notifications = notificationMapper.selectByTeacherId(teacherId);
            
            List<TeacherNotificationResponse> responseList = notifications.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            return Result.success(responseList);

        } catch (Exception e) {
            log.error("获取通知列表失败", e);
            return Result.error("获取通知列表失败");
        }
    }

    @Override
    public Result<Integer> getUnreadCount(Long teacherId) {
        try {
            int count = notificationMapper.countUnreadByTeacherId(teacherId);
            return Result.success(count);

        } catch (Exception e) {
            log.error("获取未读通知数量失败", e);
            return Result.error("获取未读通知数量失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> markAsRead(Long notificationId, Long teacherId) {
        try {
            int result = notificationMapper.markAsRead(notificationId, teacherId);
            if (result <= 0) {
                return Result.error("标记已读失败");
            }

            return Result.success();

        } catch (Exception e) {
            log.error("标记通知已读失败", e);
            return Result.error("标记已读失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> markAllAsRead(Long teacherId) {
        try {
            int result = notificationMapper.markAllAsRead(teacherId);
            log.info("批量标记已读成功，教师ID：{}，标记数量：{}", teacherId, result);
            return Result.success();

        } catch (Exception e) {
            log.error("批量标记通知已读失败", e);
            return Result.error("批量标记已读失败");
        }
    }

    /**
     * 转换为响应DTO
     */
    private TeacherNotificationResponse convertToResponse(TeacherNotification notification) {
        TeacherNotificationResponse response = new TeacherNotificationResponse();
        BeanUtils.copyProperties(notification, response);
        
        // 设置类型文本
        response.setTypeText(TYPE_MAP.getOrDefault(notification.getType(), notification.getType()));
        
        // 设置等级文本
        if (notification.getTeacherLevel() != null) {
            response.setTeacherLevelText(LEVEL_MAP.getOrDefault(notification.getTeacherLevel(), notification.getTeacherLevel()));
        }
        
        return response;
    }
}
