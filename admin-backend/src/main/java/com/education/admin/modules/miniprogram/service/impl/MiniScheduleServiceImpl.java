package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.TeacherSchedule;
import com.education.admin.modules.miniprogram.entity.TeacherScheduleFeedback;
import com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleFeedbackMapper;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleStudentMapper;
import com.education.admin.modules.miniprogram.service.MiniScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniScheduleServiceImpl implements MiniScheduleService {

    private final TeacherScheduleMapper scheduleMapper;
    private final TeacherScheduleFeedbackMapper feedbackMapper;
    private final TeacherScheduleStudentMapper scheduleStudentMapper;
    private final com.education.admin.modules.teacher.mapper.TeacherMapper teacherMapper;

    private String resolvePhone(){
        try{
            jakarta.servlet.http.HttpServletRequest req = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String p = req.getParameter("phone");
            if (p != null && !p.isEmpty()) return p;
            String header = req.getHeader("X-User-Phone");
            if (header != null && !header.isEmpty()) return header;
        }catch(Exception ignored){}
        return "18071403141";
    }

    private Long getCurrentTeacherId() {
        try{
            String phone = resolvePhone();
            com.education.admin.modules.teacher.entity.Teacher teacher = teacherMapper.findByPhone(phone);
            return teacher == null ? null : teacher.getId();
        }catch(Exception e){
            log.warn("无法解析教师信息: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public Result<Object> getDaySchedule(String date, Long teacherId) {
        try {
            // 如果没有传入teacherId，则使用当前登录教师的ID
            if (teacherId == null) {
                teacherId = getCurrentTeacherId();
                if (teacherId == null) {
                    return Result.error("教师未登录");
                }
            }

            LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            LocalDateTime start = localDate.atStartOfDay();
            LocalDateTime end = localDate.atTime(LocalTime.MAX);

            List<TeacherSchedule> schedules = scheduleMapper.findByTeacherAndRange(teacherId, start, end);

            List<Map<String, Object>> items = new ArrayList<>();
            for (TeacherSchedule schedule : schedules) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", schedule.getId());
                item.put("title", schedule.getTitle());
                item.put("startTime", schedule.getStartTime().toString());
                item.put("endTime", schedule.getEndTime().toString());
                item.put("lessonNumber", schedule.getLessonNumber());
                item.put("totalLessons", schedule.getTotalLessons());
                item.put("classType", schedule.getClassType());
                item.put("studentCount", schedule.getStudentCount());
                item.put("coverUrl", schedule.getCoverUrl());
                item.put("status", schedule.getStatus());
                item.put("durationMinutes", schedule.getDurationMinutes());
                item.put("teachMode", schedule.getTeachMode());
                item.put("address", schedule.getAddress());
                item.put("contactPhone", schedule.getContactPhone());
                item.put("remark", schedule.getRemark());
                item.put("intro", schedule.getIntro());

                // 获取学生信息
                List<TeacherScheduleStudent> enrollments = scheduleStudentMapper.findByScheduleId(schedule.getId());
                List<Map<String, Object>> students = new ArrayList<>();
                for (TeacherScheduleStudent enrollment : enrollments) {
                    Map<String, Object> student = new HashMap<>();
                    student.put("id", enrollment.getStudentId());
                    student.put("name", enrollment.getStudentName());
                    student.put("avatar", enrollment.getStudentAvatar());
                    students.add(student);
                }
                item.put("students", students);

                items.add(item);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("items", items);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取日程失败", e);
            return Result.error("获取日程失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Object> getMonthSchedule(String month, Long teacherId) {
        try {
            // 如果没有传入teacherId，则使用当前登录教师的ID
            if (teacherId == null) {
                teacherId = getCurrentTeacherId();
                if (teacherId == null) return Result.error("教师未登录");
            }

            LocalDate firstDay = LocalDate.parse(month + "-01", DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            LocalDateTime start = firstDay.atStartOfDay();
            LocalDateTime end = firstDay.plusMonths(1).minusDays(1).atTime(LocalTime.MAX);

            List<TeacherSchedule> schedules = scheduleMapper.findByTeacherAndRange(teacherId, start, end);
            Set<String> days = new HashSet<>();
            for (TeacherSchedule schedule : schedules) {
                days.add(schedule.getStartTime().toLocalDate().toString());
            }
            Map<String,Object> data = new HashMap<>();
            data.put("days", days);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取月课程失败", e);
            return Result.error("获取月课程失败");
        }
    }

    @Override
    @Transactional
    public Result<Object> create(Map<String, Object> payload) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            TeacherSchedule schedule = new TeacherSchedule();
            schedule.setTeacherId(teacherId);
            schedule.setTitle((String) payload.get("title"));
            schedule.setClassType((String) payload.getOrDefault("classType", "one_to_one"));
            schedule.setTotalLessons((Integer) payload.getOrDefault("totalLessons", 1));
            schedule.setDurationMinutes((Integer) payload.getOrDefault("durationMinutes", 90));

            // 解析时间
            String startTimeStr = (String) payload.get("startTime");
            String endTimeStr = (String) payload.get("endTime");
            LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
            LocalDateTime endTime = LocalDateTime.parse(endTimeStr);
            schedule.setStartTime(startTime);
            schedule.setEndTime(endTime);

            // 检查时间冲突
            int conflicts = scheduleMapper.countConflicts(teacherId, startTime, endTime, null);
            if (conflicts > 0) {
                return Result.error("该时间段已有其他课程安排");
            }

            // 设置其他字段
            schedule.setCoverUrl((String) payload.get("coverUrl"));
            schedule.setStudentCount((Integer) payload.getOrDefault("studentCount", 1));
            schedule.setRemark((String) payload.get("remark"));
            schedule.setIntro((String) payload.get("intro"));
            schedule.setCourseTags((String) payload.get("courseTags"));
            schedule.setTeachMode((String) payload.getOrDefault("teachMode", "offline"));
            schedule.setAddress((String) payload.get("address"));
            schedule.setProvince((String) payload.get("province"));
            schedule.setCity((String) payload.get("city"));
            schedule.setDistrict((String) payload.get("district"));
            schedule.setDetailAddress((String) payload.get("detailAddress"));
            schedule.setContactPhone((String) payload.get("contactPhone"));
            schedule.setLessonNumber((Integer) payload.getOrDefault("lessonNumber", 1));
            schedule.setPlanId((String) payload.get("planId"));
            schedule.setLessonPrice((BigDecimal) payload.get("lessonPrice"));
            schedule.setStatus(1);

            // 插入数据库
            int rows = scheduleMapper.insert(schedule);
            if (rows > 0) {
                Map<String, Object> result = new HashMap<>();
                result.put("id", schedule.getId());
                result.put("message", "创建成功");
                return Result.success(result);
            } else {
                return Result.error("创建失败");
            }
        } catch (Exception e) {
            log.error("创建课程失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Object> createPlan(Map<String, Object> payload) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            String title = (String) payload.get("title");
            Integer totalLessons = (Integer) payload.get("totalLessons");
            String classType = (String) payload.getOrDefault("classType", "one_to_one");
            Integer durationMinutes = (Integer) payload.getOrDefault("durationMinutes", 90);
            BigDecimal lessonPrice = (BigDecimal) payload.get("lessonPrice");

            // 解析基础时间
            String startTimeStr = (String) payload.get("startTime");
            LocalDateTime baseStartTime = LocalDateTime.parse(startTimeStr);
            LocalDateTime baseEndTime = baseStartTime.plusMinutes(durationMinutes);

            List<Map<String, Object>> createdSchedules = new ArrayList<>();

            // 创建多节课程
            for (int i = 1; i <= totalLessons; i++) {
                TeacherSchedule schedule = new TeacherSchedule();
                schedule.setTeacherId(teacherId);
                schedule.setTitle(title + " - 第" + i + "节");
                schedule.setClassType(classType);
                schedule.setTotalLessons(totalLessons);
                schedule.setDurationMinutes(durationMinutes);
                schedule.setLessonNumber(i);
                schedule.setLessonPrice(lessonPrice);

                // 根据重复规则计算时间（这里简单按天重复）
                LocalDateTime startTime = baseStartTime.plusDays(i - 1);
                LocalDateTime endTime = baseEndTime.plusDays(i - 1);
                schedule.setStartTime(startTime);
                schedule.setEndTime(endTime);

                // 检查时间冲突
                int conflicts = scheduleMapper.countConflicts(teacherId, startTime, endTime, null);
                if (conflicts > 0) {
                    return Result.error("第" + i + "节课程时间冲突");
                }

                schedule.setStatus(1);
                schedule.setPlanId(UUID.randomUUID().toString());

                int rows = scheduleMapper.insert(schedule);
                if (rows > 0) {
                    Map<String, Object> created = new HashMap<>();
                    created.put("id", schedule.getId());
                    created.put("lessonNumber", i);
                    created.put("startTime", startTime.toString());
                    created.put("endTime", endTime.toString());
                    createdSchedules.add(created);
                }
            }

            return Result.success(createdSchedules);
        } catch (Exception e) {
            log.error("创建学习计划失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Object> updateTime(Long id, String startTimeStr, String endTimeStr) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            TeacherSchedule schedule = scheduleMapper.findByIdAndTeacher(id, teacherId);
            if (schedule == null) {
                return Result.error("课程不存在或无权限");
            }

            LocalDateTime startTime = LocalDateTime.parse(startTimeStr);
            LocalDateTime endTime = LocalDateTime.parse(endTimeStr);

            // 检查时间冲突
            int conflicts = scheduleMapper.countConflicts(teacherId, startTime, endTime, id);
            if (conflicts > 0) {
                return Result.error("该时间段已有其他课程安排");
            }

            schedule.setStartTime(startTime);
            schedule.setEndTime(endTime);

            int rows = scheduleMapper.update(schedule);
            if (rows > 0) {
                return Result.success("更新时间成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新课程时间失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Object> update(Long id, Map<String, Object> payload) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            TeacherSchedule schedule = scheduleMapper.findByIdAndTeacher(id, teacherId);
            if (schedule == null) {
                return Result.error("课程不存在或无权限");
            }

            // 更新字段
            if (payload.containsKey("title")) {
                schedule.setTitle((String) payload.get("title"));
            }
            if (payload.containsKey("classType")) {
                schedule.setClassType((String) payload.get("classType"));
            }
            if (payload.containsKey("totalLessons")) {
                schedule.setTotalLessons((Integer) payload.get("totalLessons"));
            }
            if (payload.containsKey("durationMinutes")) {
                schedule.setDurationMinutes((Integer) payload.get("durationMinutes"));
            }
            if (payload.containsKey("coverUrl")) {
                schedule.setCoverUrl((String) payload.get("coverUrl"));
            }
            if (payload.containsKey("studentCount")) {
                schedule.setStudentCount((Integer) payload.get("studentCount"));
            }
            if (payload.containsKey("remark")) {
                schedule.setRemark((String) payload.get("remark"));
            }
            if (payload.containsKey("intro")) {
                schedule.setIntro((String) payload.get("intro"));
            }
            if (payload.containsKey("courseTags")) {
                schedule.setCourseTags((String) payload.get("courseTags"));
            }
            if (payload.containsKey("teachMode")) {
                schedule.setTeachMode((String) payload.get("teachMode"));
            }
            if (payload.containsKey("address")) {
                schedule.setAddress((String) payload.get("address"));
            }
            if (payload.containsKey("province")) {
                schedule.setProvince((String) payload.get("province"));
            }
            if (payload.containsKey("city")) {
                schedule.setCity((String) payload.get("city"));
            }
            if (payload.containsKey("district")) {
                schedule.setDistrict((String) payload.get("district"));
            }
            if (payload.containsKey("detailAddress")) {
                schedule.setDetailAddress((String) payload.get("detailAddress"));
            }
            if (payload.containsKey("contactPhone")) {
                schedule.setContactPhone((String) payload.get("contactPhone"));
            }
            if (payload.containsKey("lessonPrice")) {
                schedule.setLessonPrice((BigDecimal) payload.get("lessonPrice"));
            }

            int rows = scheduleMapper.update(schedule);
            if (rows > 0) {
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }
        } catch (Exception e) {
            log.error("更新课程失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Object> delete(Long id) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            int rows = scheduleMapper.deleteByIdAndTeacher(id, teacherId);
            if (rows > 0) {
                return Result.success("删除成功");
            } else {
                return Result.error("课程不存在或无权限");
            }
        } catch (Exception e) {
            log.error("删除课程失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Object> detail(Long id) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            TeacherSchedule schedule = scheduleMapper.findByIdAndTeacher(id, teacherId);
            if (schedule == null) {
                return Result.error("课程不存在或无权限");
            }

            // 获取学生信息
            List<TeacherScheduleStudent> enrollments = scheduleStudentMapper.findByScheduleId(id);
            List<Map<String, Object>> students = new ArrayList<>();
            for (TeacherScheduleStudent enrollment : enrollments) {
                Map<String, Object> student = new HashMap<>();
                student.put("id", enrollment.getStudentId());
                student.put("name", enrollment.getStudentName());
                student.put("avatar", enrollment.getStudentAvatar());
                students.add(student);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("schedule", schedule);
            result.put("students", students);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取课程详情失败", e);
            return Result.error("获取详情失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Object> getFeedback(Long scheduleId) {
        try {
            TeacherScheduleFeedback feedback = feedbackMapper.findByScheduleId(scheduleId);
            Map<String, Object> result = new HashMap<>();

            if (feedback != null) {
                result.put("hasFeedback", true);
                result.put("content", feedback.getContent());
                result.put("starRating", feedback.getStarRating());
                result.put("roleType", feedback.getRoleType());
                result.put("feedbackType", feedback.getFeedbackType());
                result.put("createTime", feedback.getCreateTime());
            } else {
                result.put("hasFeedback", false);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取反馈失败", e);
            return Result.error("获取反馈失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<Object> submitFeedback(Long scheduleId, String content, String feedbackType) {
        try {
            Long teacherId = getCurrentTeacherId();
            if (teacherId == null) {
                return Result.error("教师未登录");
            }

            TeacherSchedule schedule = scheduleMapper.findByIdAndTeacher(scheduleId, teacherId);
            if (schedule == null) {
                return Result.error("课程不存在或无权限");
            }

            TeacherScheduleFeedback feedback = feedbackMapper.findByScheduleIdAndRoleType(scheduleId, "teacher");
            if (feedback == null) {
                feedback = new TeacherScheduleFeedback();
                feedback.setScheduleId(scheduleId);
                feedback.setTeacherId(teacherId);
                feedback.setRoleType("teacher");
                feedback.setContent(content);
                // 根据入参设置类型，默认课堂反馈
                String type = (feedbackType==null||feedbackType.isEmpty())? "teacher_daily" : feedbackType;
                feedback.setFeedbackType(type);
                feedbackMapper.insert(feedback);
            } else {
                feedback.setContent(content);
                // 覆盖为入参类型（若提供）
                if (feedbackType!=null && !feedbackType.isEmpty()) {
                    feedback.setFeedbackType(feedbackType);
                } else if (feedback.getFeedbackType()==null || feedback.getFeedbackType().isEmpty()){
                    feedback.setFeedbackType("teacher_daily");
                }
                feedbackMapper.update(feedback);
            }

            return Result.success("反馈提交成功");
        } catch (Exception e) {
            log.error("提交反馈失败", e);
            return Result.error("提交反馈失败: " + e.getMessage());
        }
    }
}

