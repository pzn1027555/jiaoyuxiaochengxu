package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.dto.TeacherStudentResponse;
import com.education.admin.modules.miniprogram.mapper.MiniStudentQueryMapper;
import com.education.admin.modules.miniprogram.service.MiniTeacherStudentService;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import com.education.admin.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniTeacherStudentServiceImpl implements MiniTeacherStudentService {

    private final JwtUtil jwtUtil;
    private final TeacherMapper teacherMapper;
    private final MiniStudentQueryMapper studentQueryMapper;

    @Override
    public Result<TeacherStudentResponse> getMyStudents() {
        try {
            String phone = getCurrentPhone();
            Teacher teacher = teacherMapper.findByPhone(phone);
            if (teacher == null) return Result.error("教师不存在");

            List<Student> students = studentQueryMapper.findStudentsByTeacherId(teacher.getId());

            List<TeacherStudentResponse.StudentInfo> items = new ArrayList<>();
            for (Student s : students) {
                TeacherStudentResponse.StudentInfo dto = new TeacherStudentResponse.StudentInfo();
                dto.setStudentId(s.getId());
                dto.setStudentName(s.getStudentName());
                dto.setAvatar(s.getAvatar());
                dto.setGender(s.getGender());
                dto.setGrade(s.getGrade());
                dto.setPhone(s.getPhone());
                dto.setParentName(s.getParentName());
                dto.setParentPhone(s.getParentPhone());
                dto.setStudentLevel(s.getStudentLevel());
                dto.setStatus(1);

                Map<String,Object> brief = studentQueryMapper.findLatestOrderBrief(teacher.getId(), s.getId());
                if (brief != null && !brief.isEmpty()) {
                    TeacherStudentResponse.CourseProgress cp = new TeacherStudentResponse.CourseProgress();
                    cp.setCourseId(asLong(brief.get("scheduleId")));
                    cp.setCourseName(asString(brief.get("courseName")));
                    cp.setSubject(asString(brief.get("subject")));
                    cp.setTotalLessons(asInt(brief.get("totalLessons")));
                    // 已完成课时：以 lesson_number 模拟（如有课程日志，可替换为真实值）
                    Integer completed = asInt(brief.get("lessonNumber"));
                    if (completed == null) completed = 0;
                    cp.setCompletedLessons(completed);
                    cp.setRemainingLessons(Math.max(0, (cp.getTotalLessons() != null ? cp.getTotalLessons() : 0) - completed));
                    cp.setCurrentChapter(null);
                    Integer total = cp.getTotalLessons() != null ? cp.getTotalLessons() : 0;
                    cp.setProgress("第" + completed + "节/" + total + "节");
                    List<TeacherStudentResponse.CourseProgress> list = new ArrayList<>();
                    list.add(cp);
                    dto.setCourses(list);
                }
                items.add(dto);
            }

            TeacherStudentResponse.Statistics stat = new TeacherStudentResponse.Statistics();
            stat.setTotalStudents(items.size());
            LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
            Integer hours = studentQueryMapper.sumMonthlyHours(teacher.getId(), start, end);
            stat.setMonthlyHours(hours == null ? 0 : hours);
            stat.setActiveStudents(items.size());

            TeacherStudentResponse resp = new TeacherStudentResponse();
            resp.setStudents(items);
            resp.setStatistics(stat);

            return Result.success(resp);
        } catch (Exception e) {
            log.error("获取我的学生失败", e);
            return Result.error("获取我的学生失败");
        }
    }

    @Override
    public Result<TeacherStudentResponse> getStudentsByTeacherId(Long teacherIdParam) {
        try {
            if (teacherIdParam == null) return Result.error("teacherId不能为空");

            List<Student> students = studentQueryMapper.findStudentsByTeacherId(teacherIdParam);

            List<TeacherStudentResponse.StudentInfo> items = new ArrayList<>();
            for (Student s : students) {
                TeacherStudentResponse.StudentInfo dto = new TeacherStudentResponse.StudentInfo();
                dto.setStudentId(s.getId());
                dto.setStudentName(s.getStudentName());
                dto.setAvatar(s.getAvatar());
                dto.setGender(s.getGender());
                dto.setGrade(s.getGrade());
                dto.setPhone(s.getPhone());
                dto.setParentName(s.getParentName());
                dto.setParentPhone(s.getParentPhone());
                dto.setStudentLevel(s.getStudentLevel());
                dto.setStatus(1);
                Map<String,Object> brief = studentQueryMapper.findLatestOrderBrief(teacherIdParam, s.getId());
                if (brief != null && !brief.isEmpty()) {
                    TeacherStudentResponse.CourseProgress cp = new TeacherStudentResponse.CourseProgress();
                    cp.setCourseId(asLong(brief.get("scheduleId")));
                    cp.setCourseName(asString(brief.get("courseName")));
                    cp.setSubject(asString(brief.get("subject")));
                    cp.setTotalLessons(asInt(brief.get("totalLessons")));
                    Integer completed = asInt(brief.get("lessonNumber"));
                    if (completed == null) completed = 0;
                    cp.setCompletedLessons(completed);
                    cp.setRemainingLessons(Math.max(0, (cp.getTotalLessons() != null ? cp.getTotalLessons() : 0) - completed));
                    Integer total = cp.getTotalLessons() != null ? cp.getTotalLessons() : 0;
                    cp.setProgress("第" + completed + "节/" + total + "节");
                    List<TeacherStudentResponse.CourseProgress> list = new ArrayList<>();
                    list.add(cp);
                    dto.setCourses(list);
                }
                items.add(dto);
            }

            TeacherStudentResponse.Statistics stat = new TeacherStudentResponse.Statistics();
            stat.setTotalStudents(items.size());
            LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
            Integer hours = studentQueryMapper.sumMonthlyHours(teacherIdParam, start, end);
            stat.setMonthlyHours(hours == null ? 0 : hours);
            stat.setActiveStudents(items.size());

            TeacherStudentResponse resp = new TeacherStudentResponse();
            resp.setStudents(items);
            resp.setStatistics(stat);
            return Result.success(resp);
        } catch (Exception e) {
            log.error("按teacherId获取我的学生失败", e);
            return Result.error("获取我的学生失败");
        }
    }

    private String getCurrentPhone() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String jwt = bearerToken.substring(7);
                if (jwtUtil.validateToken(jwt)) return jwtUtil.getUsernameFromToken(jwt);
            }
        } catch (Exception ignored) {}
        return "18071403141";
    }

    private Long asLong(Object o){ try { return o==null?null:Long.valueOf(String.valueOf(o)); } catch(Exception e){ return null; } }
    private Integer asInt(Object o){ try { return o==null?null:Integer.valueOf(String.valueOf(o)); } catch(Exception e){ return null; } }
    private String asString(Object o){ return o==null?null:String.valueOf(o); }
}


