package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.TeacherSchedule;
import com.education.admin.modules.miniprogram.entity.TeacherScheduleFeedback;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleFeedbackMapper;
import com.education.admin.modules.miniprogram.service.MiniStudentScheduleService;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.student.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniStudentScheduleServiceImpl implements MiniStudentScheduleService {

    private final StudentMapper studentMapper;
    private final TeacherScheduleMapper scheduleMapper;
    private final TeacherScheduleFeedbackMapper feedbackMapper;

    private String getPhone(){
        try{
            HttpServletRequest req=((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String p=req.getParameter("phone"); if(p!=null && !p.isEmpty()) return p;
            String h=req.getHeader("X-User-Phone"); if(h!=null && !h.isEmpty()) return h;
        }catch(Exception ignored){}
        return "18071403141";
    }

    private Long getStudentId(){
        Student s = studentMapper.findByPhone(getPhone());
        return s==null? null : s.getId();
    }

    private Long resolveRequestedStudentId(Long explicitStudentId){
        if (explicitStudentId != null) {
            Student s = studentMapper.findById(explicitStudentId);
            return s == null ? null : explicitStudentId;
        }
        Long sessionStudentId = getStudentId();
        Long requestStudentId = null;
        try{
            HttpServletRequest req = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String sid = req.getParameter("studentId");
            if (sid != null && !sid.isEmpty()) {
                requestStudentId = Long.valueOf(sid);
            }
        }catch(Exception ignored){}

        if (requestStudentId != null) {
            Student s = studentMapper.findById(requestStudentId);
            return s == null ? null : requestStudentId;
        }
        return sessionStudentId;
    }

    @Override
    public Result<Map<String, Object>> getDay(LocalDate date, Long studentId) {
        try{
            Long sid = resolveRequestedStudentId(studentId);
            if (sid == null) {
                return Result.error("学生不存在");
            }
            LocalDateTime start=date.atStartOfDay();
            LocalDateTime end=date.atTime(LocalTime.MAX);
            List<TeacherSchedule> list = scheduleMapper.findByStudentAndRange(sid, start, end);
            List<Map<String,Object>> items=new ArrayList<>();
            for(TeacherSchedule ts: list){
                Map<String,Object> m=new HashMap<>();
                m.put("id", ts.getId());
                m.put("title", ts.getTitle());
                m.put("startTime", String.valueOf(ts.getStartTime()));
                m.put("endTime", String.valueOf(ts.getEndTime()));
                m.put("lessonNumber", ts.getLessonNumber());
                m.put("totalLessons", ts.getTotalLessons());
                m.put("classType", ts.getClassType());
                m.put("coverUrl", ts.getCoverUrl());
                m.put("teacherName", ts.getTeacherName());
                m.put("intro", ts.getIntro());
                m.put("remark", ts.getRemark());
                items.add(m);
            }
            Map<String,Object> resp=new HashMap<>();
            resp.put("items", items);
            return Result.success(resp);
        }catch(Exception e){
            log.error("学生日程查询失败", e);
            return Result.error("查询失败");
        }
    }

    @Override
    public Result<Map<String, Object>> getReview(Long scheduleId) {
        try{
            TeacherScheduleFeedback fb = feedbackMapper.findByScheduleId(scheduleId);
            Map<String,Object> m=new HashMap<>();
            boolean has = fb != null && "student".equals(fb.getRoleType()) && fb.getStarRating() != null;
            m.put("hasReview", has);
            if (has && fb != null){
                m.put("content", fb.getContent());
                m.put("starRating", fb.getStarRating());
            }
            return Result.success(m);
        }catch(Exception e){
            return Result.error("获取评价失败");
        }
    }

    @Override
    public Result<Object> submitReview(Long scheduleId, String content, Integer starRating) {
        try{
            Long sid = getStudentId(); if (sid==null) return Result.error("学生不存在");
            if (starRating == null || starRating < 1 || starRating > 5) return Result.error("请选择星级");
            // 仅查学生评价记录，避免覆盖教师反馈
            TeacherScheduleFeedback fb = feedbackMapper.findByScheduleIdAndRoleType(scheduleId, "student");
            if (fb == null){
                // 取教师ID用于非空插入
                TeacherSchedule ts = scheduleMapper.findByIdForStudent(scheduleId, sid);
                if (ts == null) return Result.error("课程不存在或无权限");
                fb = new TeacherScheduleFeedback();
                fb.setScheduleId(scheduleId);
                fb.setTeacherId(ts.getTeacherId());
                fb.setStudentId(sid);
                fb.setRoleType("student");
                fb.setStarRating(starRating);
                fb.setContent(content);
                feedbackMapper.insert(fb);
            } else {
                fb.setStudentId(sid);
                fb.setRoleType("student");
                fb.setStarRating(starRating);
                fb.setContent(content);
                feedbackMapper.update(fb);
            }
            return Result.success("OK");
        }catch(Exception e){
            log.error("提交评价失败", e);
            return Result.error("提交失败");
        }
    }
}


