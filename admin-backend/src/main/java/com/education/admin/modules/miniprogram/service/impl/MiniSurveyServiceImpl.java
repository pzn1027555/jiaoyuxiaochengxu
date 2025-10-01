package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.StudentSurvey;
import com.education.admin.modules.miniprogram.entity.StudentSurveyDetail;
import com.education.admin.modules.miniprogram.entity.TeacherSchedule;
import com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent;
import com.education.admin.modules.miniprogram.mapper.StudentSurveyMapper;
import com.education.admin.modules.miniprogram.mapper.StudentSurveyDetailMapper;
import com.education.admin.modules.miniprogram.service.MiniSurveyService;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.modules.parent.entity.ParentWallet;
import com.education.admin.modules.parent.entity.ParentWalletTxn;
import com.education.admin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniSurveyServiceImpl implements MiniSurveyService {

    private final StudentSurveyMapper surveyMapper;
    private final com.education.admin.modules.miniprogram.mapper.StudentSurveyDetailMapper surveyDetailMapper;
    private final TeacherMapper teacherMapper;
    private final com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper teacherScheduleMapper;
    private final com.education.admin.modules.miniprogram.mapper.TeacherScheduleStudentMapper teacherScheduleStudentMapper;
    private final JwtUtil jwtUtil;
    private final com.education.admin.modules.student.mapper.StudentMapper studentMapper;
    private final com.education.admin.modules.parent.mapper.ParentMapper parentMapper;
    private final com.education.admin.modules.parent.mapper.ParentWalletMapper parentWalletMapper;
    private final com.education.admin.modules.parent.mapper.ParentWalletTxnMapper parentWalletTxnMapper;
    private final com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper parentStudentRelationMapper;

    @Override
    public Result<Object> getByStudent(Long studentId, Long teacherIdParam) {
        try{
            Long teacherId = teacherIdParam != null ? teacherIdParam : getCurrentTeacherId();
            if (teacherId == null) return Result.unauthorized("请先登录教师账号");
            if (studentId == null) return Result.error("学生ID不能为空");
            // 获取最新的记录（因为移除了唯一键约束，可能有多条记录）
            StudentSurvey exist = surveyMapper.findLatestByTeacherAndStudent(teacherId, studentId);
            Map<String,Object> resp = new HashMap<>();
            if (exist != null){
                resp.put("id", exist.getId());
                resp.put("teacherId", exist.getTeacherId());
                resp.put("studentId", exist.getStudentId());
                // 通过 detail_id 获取问卷明细数据
                Map<String,Object> data = new HashMap<>();
                Object files = new java.util.ArrayList<>();
                if (exist.getDetailId() != null) {
                    com.education.admin.modules.miniprogram.entity.StudentSurveyDetail detail = surveyDetailMapper.findById(exist.getDetailId());
                    if (detail != null) {
                        data = safeParse(detail.getDataJson());
                        files = safeParse(detail.getFilesJson());
                if (data == null) data = new HashMap<>();
                if (files == null) files = new java.util.ArrayList<>();
                    }
                }
                resp.put("data", data);
                resp.put("files", files);
            } else {
                resp.put("id", null);
                resp.put("teacherId", teacherId);
                resp.put("studentId", studentId);
                resp.put("data", new HashMap<>());
                resp.put("files", new java.util.ArrayList<>());
            }
            return Result.success(resp);
        }catch(Exception e){
            log.error("查询问卷失败", e);
            return Result.error("查询问卷失败");
        }
    }

    @Override
    public Result<Object> save(Map<String, Object> payload) {
        try{
            Long teacherId = asLong(payload.get("teacherId"));
            if (teacherId == null) teacherId = getCurrentTeacherId();
            Long studentId = asLong(payload.get("studentId"));
            if (studentId == null) studentId = resolveCurrentStudentId(); // 从当前用户获取学生ID
            Object data = payload.get("data");
            Object files = payload.get("files");
            Integer status = payload.get("status")==null? null : Integer.valueOf(String.valueOf(payload.get("status")));
            String rejectReason = payload.get("rejectReason")==null? null : String.valueOf(payload.get("rejectReason"));
            Long courseId = asLong(payload.get("courseId"));
            String courseTitle = payload.get("courseTitle")==null? null : String.valueOf(payload.get("courseTitle"));
            
            // 处理预约时间相关数据
            LocalDate bookingDate = null;
            LocalTime bookingStartTime = null;
            String bookingDuration = null;
            BigDecimal bookingPrice = null;
            String bookingType = null;
            
            // 从data中提取预约信息
            if (data instanceof Map) {
                Map<String, Object> dataMap = (Map<String, Object>) data;
                if (dataMap.get("selectedDate") != null) {
                    try {
                        bookingDate = LocalDate.parse(String.valueOf(dataMap.get("selectedDate")));
                    } catch (Exception e) {
                        log.warn("解析预约日期失败: {}", dataMap.get("selectedDate"));
                    }
                }
                if (dataMap.get("selectedTime") != null) {
                    try {
                        bookingStartTime = LocalTime.parse(String.valueOf(dataMap.get("selectedTime")));
                    } catch (Exception e) {
                        log.warn("解析预约时间失败: {}", dataMap.get("selectedTime"));
                    }
                }
                bookingDuration = dataMap.get("duration") != null ? String.valueOf(dataMap.get("duration")) : null;
                bookingType = dataMap.get("bookingType") != null ? String.valueOf(dataMap.get("bookingType")) : "trial";
                if (dataMap.get("trialPrice") != null) {
                    try {
                        bookingPrice = new BigDecimal(String.valueOf(dataMap.get("trialPrice")));
                    } catch (Exception e) {
                        log.warn("解析预约价格失败: {}", dataMap.get("trialPrice"));
                    }
                }
            }
            
            if (teacherId == null) return Result.unauthorized("请先登录教师账号");
            if (studentId == null) return Result.error("学生ID不能为空");

            // 对于旧的save接口，查找最新记录进行更新
            StudentSurvey exist = surveyMapper.findLatestByTeacherAndStudent(teacherId, studentId);
            String dataJson = null; // 已移除，问卷明细独立保存
            String filesJson = files == null ? null : com.fasterxml.jackson.databind.json.JsonMapper.builder().build().writeValueAsString(files);
            if (exist == null){
                StudentSurvey s = new StudentSurvey();
                s.setTeacherId(teacherId);
                s.setStudentId(studentId);
                s.setFilesJson(filesJson);
                s.setStatus(status);
                s.setRejectReason(rejectReason);
                s.setCourseId(courseId);
                s.setCourseTitle(courseTitle);
                s.setBookingDate(bookingDate);
                s.setBookingStartTime(bookingStartTime);
                s.setBookingDuration(bookingDuration);
                s.setBookingPrice(bookingPrice);
                s.setBookingType(bookingType);
                // formal 直接可展示；trial 需支付后置为可展示
                s.setPaid("formal".equalsIgnoreCase(bookingType) ? 1 : 0);
                surveyMapper.insert(s);
                return Result.success("创建成功", Map.of("id", s.getId()));
            } else {
                exist.setFilesJson(filesJson);
                exist.setStatus(status);
                exist.setRejectReason(rejectReason);
                exist.setCourseId(courseId);
                exist.setCourseTitle(courseTitle);
                exist.setBookingDate(bookingDate);
                exist.setBookingStartTime(bookingStartTime);
                exist.setBookingDuration(bookingDuration);
                exist.setBookingPrice(bookingPrice);
                exist.setBookingType(bookingType);
                if ("formal".equalsIgnoreCase(bookingType)) exist.setPaid(1);
                surveyMapper.update(exist);
                return Result.success("更新成功", Map.of("id", exist.getId()));
            }
        }catch(Exception e){
            log.error("保存问卷失败", e);
            return Result.error("保存问卷失败");
        }
    }

    @Override
    public Result<Object> createBooking(Map<String, Object> payload) {
        try{
            Long teacherId = asLong(payload.get("teacherId"));
            if (teacherId == null) teacherId = getCurrentTeacherId();
            Long studentId = asLong(payload.get("studentId"));
            if (studentId == null) studentId = resolveCurrentStudentId();
            if (teacherId == null) return Result.unauthorized("教师ID不能为空");
            if (studentId == null) return Result.error("学生ID不能为空");

            // 始终创建新预约记录
            StudentSurvey exist = new StudentSurvey();
            exist.setTeacherId(teacherId);
            exist.setStudentId(studentId);
            Object data = payload.get("data");
            java.time.LocalDate bd = null; java.time.LocalTime bst = null; String bdur = null; java.math.BigDecimal bprice = null; String btype = null; String ct = null;
            if (data instanceof Map){
                Map<String,Object> dm = (Map<String,Object>) data;
                try{ if (dm.get("selectedDate")!=null) bd = java.time.LocalDate.parse(String.valueOf(dm.get("selectedDate"))); }catch(Exception ignore){}
                try{ if (dm.get("selectedTime")!=null) bst = java.time.LocalTime.parse(String.valueOf(dm.get("selectedTime"))); }catch(Exception ignore){}
                bdur = dm.get("duration")!=null? String.valueOf(dm.get("duration")) : null;
                btype = dm.get("bookingType")!=null? String.valueOf(dm.get("bookingType")) : "trial";
                if (dm.get("trialPrice")!=null){ try{ bprice = new java.math.BigDecimal(String.valueOf(dm.get("trialPrice"))); }catch(Exception ignore){} }
            }
            if (payload.get("courseTitle")!=null){ ct = String.valueOf(payload.get("courseTitle")); }

            exist.setBookingDate(bd);
            exist.setBookingStartTime(bst);
            exist.setBookingDuration(bdur);
            exist.setBookingPrice(bprice);
            exist.setBookingType(btype);
            exist.setCourseTitle(ct);
            // 设置默认值并插入新记录
            exist.setPaid("formal".equalsIgnoreCase(btype) ? 1 : 0);
            exist.setStatus(0); // 默认待处理状态
            surveyMapper.insert(exist);
            return Result.success(Map.of("id", exist.getId()));
        }catch(Exception e){
            log.error("创建预约失败", e); return Result.error("创建预约失败");
        }
    }

    @Override
    public Result<Object> createSurveyDetail(Map<String, Object> payload) {
        try{
            Long teacherId = asLong(payload.get("teacherId"));
            if (teacherId == null) teacherId = getCurrentTeacherId();
            Long studentId = asLong(payload.get("studentId"));
            if (studentId == null) studentId = resolveCurrentStudentId();
            if (teacherId == null) return Result.unauthorized("请先登录教师账号");
            if (studentId == null) return Result.error("学生ID不能为空");

            // 新建问卷明细表记录（独立保存表单项和附件），返回 detailId，并把 student_survey.detail_id 关联起来
            Long detailId = insertSurveyDetail(payload.get("data"), payload.get("files"), teacherId, studentId);
            // 对于问卷明细创建，查找最新的记录进行关联
            StudentSurvey exist = surveyMapper.findLatestByTeacherAndStudent(teacherId, studentId);
            if (exist == null){ 
                // 如果没有预约记录，创建一个基础记录
                exist = new StudentSurvey(); 
                exist.setTeacherId(teacherId); 
                exist.setStudentId(studentId);
                exist.setDetailId(detailId);
                exist.setStatus(0);
                exist.setPaid(0);
                surveyMapper.insert(exist);
            } else {
                // 更新现有记录的问卷明细ID
                exist.setDetailId(detailId);
                surveyMapper.update(exist);
            }
            return Result.success(Map.of("detailId", detailId));
        }catch(Exception e){
            log.error("创建问卷失败", e); return Result.error("创建问卷失败");
        }
    }

    @Override
    public Result<Object> getBookingCount(Long teacherId, Long studentId, String bookingType) {
        try {
            if (teacherId == null) return Result.error("教师ID不能为空");
            if (studentId == null) return Result.error("学生ID不能为空");
            
            int count = surveyMapper.countByTeacherAndStudent(teacherId, studentId, bookingType);
            return Result.success(Map.of("count", count));
        } catch (Exception e) {
            log.error("查询预约次数失败", e);
            return Result.error("查询预约次数失败");
        }
    }

    @Override
    public Result<Object> createBookingWithDetail(Map<String, Object> payload) {
        try {
            Long teacherId = asLong(payload.get("teacherId"));
            if (teacherId == null) teacherId = getCurrentTeacherId();
            Long studentId = asLong(payload.get("studentId"));
            if (studentId == null) studentId = resolveCurrentStudentId();
            if (teacherId == null) return Result.unauthorized("教师ID不能为空");
            if (studentId == null) return Result.error("学生ID不能为空");

            // 先创建问卷明细
            Long detailId = insertSurveyDetail(payload.get("surveyData"), payload.get("files"), teacherId, studentId);
            
            // 再创建预约记录
            StudentSurvey survey = new StudentSurvey();
            survey.setTeacherId(teacherId);
            survey.setStudentId(studentId);
            survey.setDetailId(detailId);

            // 解析预约数据
            Object bookingDataObj = payload.get("bookingData");
            if (bookingDataObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String,Object> bookingData = (Map<String,Object>) bookingDataObj;
                
                String bd = asString(bookingData.get("selectedDate"));
                String bst = asString(bookingData.get("selectedTime"));
                String bdur = asString(bookingData.get("duration"));
                String btype = "trial"; // 默认试听课
                java.math.BigDecimal bprice = asBigDecimal(bookingData.get("trialPrice"));
                String ct = asString(bookingData.get("courseTitle"));

                try { if (bd != null) survey.setBookingDate(java.time.LocalDate.parse(bd)); } catch(Exception ignore) {}
                try { if (bst != null) survey.setBookingStartTime(java.time.LocalTime.parse(bst)); } catch(Exception ignore) {}
                survey.setBookingDuration(bdur);
                survey.setBookingPrice(bprice);
                survey.setBookingType(btype);
                survey.setCourseTitle(ct);
            }

            // 设置默认值
            survey.setPaid(0); // 试听课默认未支付
            survey.setStatus(0); // 默认待处理状态

            surveyMapper.insert(survey);

            return Result.success(Map.of("surveyId", survey.getId(), "detailId", detailId));
        } catch (Exception e) {
            log.error("创建预约和问卷失败", e);
            return Result.error("创建预约和问卷失败");
        }
    }

    @Override
    public Result<Object> checkStudentSurveyDetail(Long studentId) {
        try {
            // 查询学生是否有问卷明细记录
            StudentSurveyDetail latestDetail = surveyDetailMapper.findLatestByStudentId(studentId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("hasDetail", latestDetail != null);
            if (latestDetail != null) {
                result.put("detailId", latestDetail.getId());
                result.put("createTime", latestDetail.getCreateTime());
            }
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("检查学生问卷明细失败", e);
            return Result.error("检查失败");
        }
    }

    // 占位：持久化问卷明细，返回自增ID（后续实现mapper与表结构）
    private Long insertSurveyDetail(Object data, Object files, Long teacherId, Long studentId){
        try{
            com.education.admin.modules.miniprogram.entity.StudentSurveyDetail d = new com.education.admin.modules.miniprogram.entity.StudentSurveyDetail();
            // teacherId/studentId 在保存 student_survey 时已绑定，这里仅存表单/附件
            String dataJson = data==null? null : com.fasterxml.jackson.databind.json.JsonMapper.builder().build().writeValueAsString(data);
            String filesJson = files==null? null : com.fasterxml.jackson.databind.json.JsonMapper.builder().build().writeValueAsString(files);
            d.setTeacherId(teacherId);
            d.setStudentId(studentId);
            d.setDataJson(dataJson);
            d.setFilesJson(filesJson);
            surveyDetailMapper.insert(d);
            return d.getId();
        }catch(Exception e){ return null; }
    }

    @Override
    public Result<Object> listForBooking(Long teacherIdParam, String phoneParam) {
        try{
            Long teacherId =
                teacherIdParam != null ? teacherIdParam :
                resolveTeacherIdFromPhoneOrJwt(phoneParam);
            if (teacherId == null) return Result.unauthorized("请先登录教师账号");
            java.util.List<java.util.Map<String,Object>> raw = surveyMapper.findByTeacher(teacherId);
            java.util.List<java.util.Map<String,Object>> list = new java.util.ArrayList<>();
            for (java.util.Map<String,Object> m : raw){
                // 仅 trial 且未支付的记录不返回（兼容 paid 为 Boolean/Number/String 三种类型）
                try{
                    String bookingType = m.get("bookingType") == null ? null : String.valueOf(m.get("bookingType"));
                    Integer paid = null;
                    Object paidObj = m.get("paid");
                    if (paidObj instanceof java.lang.Number) {
                        paid = ((java.lang.Number) paidObj).intValue();
                    } else if (paidObj instanceof java.lang.Boolean) {
                        paid = ((java.lang.Boolean) paidObj) ? 1 : 0;
                    } else if (paidObj != null) {
                        try { paid = Integer.valueOf(String.valueOf(paidObj)); } catch (Exception ignore) {}
                    }
                    if ("trial".equalsIgnoreCase(bookingType) && (paid == null || paid == 0)){
                        continue;
                    }
                }catch(Exception ignored){}

                java.util.Map<String,Object> item = new java.util.HashMap<>();
                item.put("id", m.get("id"));
                item.put("studentId", m.get("studentId"));
                item.put("name", m.get("name"));
                String avatar = m.get("avatar")==null? "/images/workspace/default-avatar.png" : String.valueOf(m.get("avatar"));
                item.put("avatar", avatar);
                item.put("courseName", m.get("courseTitle"));

                String timeDesc = m.get("timeDesc") == null ? "" : String.valueOf(m.get("timeDesc"));
                item.put("timeDesc", timeDesc);

                item.put("bookingDate", m.get("bookingDate"));
                item.put("bookingStartTime", m.get("bookingStartTime"));
                item.put("bookingDuration", m.get("bookingDuration"));
                item.put("bookingPrice", m.get("bookingPrice"));
                item.put("bookingType", m.get("bookingType"));
                item.put("createTime", m.get("createTime"));
                Integer status = null; try{ status = m.get("status")==null? null : Integer.valueOf(String.valueOf(m.get("status"))); }catch(Exception ignore){}
                item.put("status", status==null? "pending" : (status==1?"approved":(status==2?"rejected":"pending")));
                list.add(item);
            }
            return Result.success(list);
        }catch(Exception e){
            return Result.error("加载预约列表失败");
        }
    }

    @Override
    public Result<Object> updateStatus(Long id, Integer status, String rejectReason) {
        try{
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) return Result.unauthorized("请先登录教师账号");
            StudentSurvey exist = surveyMapper.findById(id);
            if (exist == null || !teacherId.equals(exist.getTeacherId())){
                return Result.notFound("记录不存在或无权操作");
            }
            
            if (status != null){ exist.setStatus(status); }
            if (rejectReason != null){ exist.setRejectReason(rejectReason); }
            surveyMapper.update(exist);
            
            // 如果是同意预约（status=1），生成teacher_schedule数据
            if (status != null && status == 1) {
                createTrialSchedule(exist);
            }
            // 如果是拒绝预约（status=2），执行退款逻辑
            else if (status != null && status == 2) {
                processRefund(exist);
            }
            
            return Result.success("更新成功", null);
        }catch(Exception e){
            log.error("更新状态失败", e);
            return Result.error("更新状态失败");
        }
    }
    
    /**
     * 创建试听课程安排
     */
    private void createTrialSchedule(StudentSurvey survey) {
        try {
            TeacherSchedule schedule = new TeacherSchedule();
            schedule.setTeacherId(survey.getTeacherId());
            schedule.setTitle("试听课");
            schedule.setClassType("trial"); // 试听课类型
            schedule.setTotalLessons(1);
            
            // 计算开始和结束时间
            LocalDate bookingDate = survey.getBookingDate() != null ? survey.getBookingDate() : LocalDate.now().plusDays(1);
            LocalTime bookingTime = survey.getBookingStartTime() != null ? survey.getBookingStartTime() : LocalTime.of(14, 0);
            LocalDateTime startTime = LocalDateTime.of(bookingDate, bookingTime);
            
            // 根据预约的duration确定课程时长
            int durationMinutes = 40; // 默认40分钟
            String duration = survey.getBookingDuration();
            if ("2hour".equals(duration)) {
                durationMinutes = 120; // 2小时
            } else if ("trial".equals(duration)) {
                durationMinutes = 40; // 试听课40分钟
            }
            
            LocalDateTime endTime = startTime.plusMinutes(durationMinutes);
            
            schedule.setStartTime(startTime);
            schedule.setEndTime(endTime);
            schedule.setDurationMinutes(durationMinutes);
            schedule.setStudentCount(1);
            schedule.setStatus(1); // 正常状态
            schedule.setTeachMode("offline"); // 默认线下
            schedule.setRemark("试听课预约 - 学生ID: " + survey.getStudentId());
            
            // 设置课程价格（如果有）
            if (survey.getBookingPrice() != null) {
                schedule.setLessonPrice(survey.getBookingPrice());
            }
            
            teacherScheduleMapper.insert(schedule);
            
            // 创建学生-课程关联记录
            TeacherScheduleStudent scheduleStudent = new TeacherScheduleStudent();
            scheduleStudent.setScheduleId(schedule.getId());
            scheduleStudent.setStudentId(survey.getStudentId());
            teacherScheduleStudentMapper.insertEnrollment(scheduleStudent);
            
            log.info("Created trial schedule for survey_id: {}, schedule_id: {}, with student: {}", 
                     survey.getId(), schedule.getId(), survey.getStudentId());
            
        } catch (Exception e) {
            log.error("创建试听课程安排失败, survey_id: " + survey.getId(), e);
            // 不抛出异常，避免影响主流程
        }
    }
    
    /**
     * 处理拒绝预约的退款逻辑
     */
    private void processRefund(StudentSurvey survey) {
        try {
            // 只有已支付的预约才需要退款
            if (survey.getPaid() == null || survey.getPaid() != 1) {
                log.info("Survey {} is not paid, skip refund", survey.getId());
                return;
            }
            
            // 获取预约金额
            BigDecimal refundAmount = survey.getBookingPrice();
            if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Survey {} has no valid booking price for refund", survey.getId());
                return;
            }
            
            // 查找学生ID
            Long studentId = survey.getStudentId();
            if (studentId == null) {
                log.warn("Survey {} has no student ID", survey.getId());
                return;
            }
            
            // 查找学生绑定的家长
            List<Long> parentIds = parentStudentRelationMapper.findParentIdsByStudentId(studentId);
            if (parentIds == null || parentIds.isEmpty()) {
                log.warn("Student {} has no associated parents", studentId);
                return;
            }
            
            // 选择第一个家长进行退款（也可以根据业务规则选择主要家长）
            Long parentId = parentIds.get(0);
            
            // 确保家长钱包存在
            ParentWallet wallet = parentWalletMapper.findByParentId(parentId);
            if (wallet == null) {
                // 创建钱包
                wallet = new ParentWallet();
                wallet.setParentId(parentId);
                wallet.setBalance(BigDecimal.ZERO);
                parentWalletMapper.insert(wallet);
                log.info("Created wallet for parent {}", parentId);
            }
            
            // 执行退款：增加家长钱包余额
            parentWalletMapper.addBalance(parentId, refundAmount);
            
            // 记录退款流水
            ParentWalletTxn txn = new ParentWalletTxn();
            txn.setParentId(parentId);
            txn.setType("refund");
            txn.setTitle("试听课预约被拒绝退款");
            txn.setAmount(refundAmount);
            txn.setExtra("{\"survey_id\":" + survey.getId() + ",\"student_id\":" + studentId + ",\"teacher_id\":" + survey.getTeacherId() + "}");
            parentWalletTxnMapper.insert(txn);
            
            log.info("Processed refund for survey_id: {}, parent_id: {}, amount: {}", 
                     survey.getId(), parentId, refundAmount);
                     
        } catch (Exception e) {
            log.error("处理退款失败, survey_id: " + survey.getId(), e);
            // 不抛出异常，避免影响主流程，但应该记录错误以便后续处理
        }
    }

    private Map<String,Object> safeParse(String json){
        try{
            if (json == null || json.isBlank()) return null;
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, java.util.Map.class);
        }catch(Exception e){
            return null;
        }
    }

    private Long getCurrentTeacherId() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String bearerToken = request.getHeader("Authorization");
            String phone = null;
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) phone = jwtUtil.getUsernameFromToken(jwt);
            }
            if (phone == null) phone = "18071403141";
            Teacher teacher = teacherMapper.findByPhone(phone);
            return teacher != null ? teacher.getId() : null;
        } catch (Exception e) {
            Teacher teacher = teacherMapper.findByPhone("18071403141");
            return teacher != null ? teacher.getId() : null;
        }
    }

    private Long resolveTeacherIdFromPhoneOrJwt(String phoneParam){
        try{
            String phone = phoneParam;
            if (phone == null || phone.isBlank()){
                HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
                // 优先从自定义请求头拿
                String headerPhone = request.getHeader("X-User-Phone");
                if (headerPhone != null && !headerPhone.isBlank()) phone = headerPhone;
                // 再尝试JWT
                if ((phone == null || phone.isBlank())){
                    String bearerToken = request.getHeader("Authorization");
                    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                        String jwt = bearerToken.substring(7);
                        if (jwtUtil.validateToken(jwt)) phone = jwtUtil.getUsernameFromToken(jwt);
                    }
                }
            }
            if (phone == null || phone.isBlank()) return getCurrentTeacherId();
            Teacher teacher = teacherMapper.findByPhone(phone);
            return teacher != null ? teacher.getId() : null;
        }catch(Exception e){
            return getCurrentTeacherId();
        }
    }

    private Long resolveCurrentStudentId() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            if (phone != null) {
                com.education.admin.modules.student.entity.Student student = studentMapper.findByPhone(phone);
                return student != null ? student.getId() : null;
            }
            return null;
        } catch (Exception e) {
            log.warn("获取当前学生ID失败", e);
            return null;
        }
    }

    private Long asLong(Object o){ try { return o==null?null:Long.valueOf(String.valueOf(o)); } catch(Exception e){ return null; } }
    
    private String asString(Object o) { 
        return o == null ? null : String.valueOf(o); 
    }
    
    private java.math.BigDecimal asBigDecimal(Object o) { 
        try { 
            return o == null ? null : new java.math.BigDecimal(String.valueOf(o)); 
        } catch(Exception e) { 
            return null; 
        } 
    }
}


