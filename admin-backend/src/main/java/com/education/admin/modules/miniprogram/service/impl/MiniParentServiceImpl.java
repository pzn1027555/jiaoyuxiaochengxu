package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.modules.miniprogram.service.MiniParentService;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper;
import com.education.admin.modules.student.entity.Student;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * 小程序家长服务实现类
 */
@Slf4j
@Service
public class MiniParentServiceImpl implements MiniParentService {

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private com.education.admin.modules.parent.mapper.ParentMapper parentMapper;

    @Autowired
    private com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper parentStudentRelationMapper;

    @Autowired
    private TeacherScheduleMapper teacherScheduleMapper;

    @Override
    public List<Map<String, Object>> getBindParents() {
        try {
            // 获取当前学生ID
            Long studentId = getCurrentStudentId();
            log.info("Getting bind parents for studentId: {}", studentId);

            // 查询绑定的家长列表
            List<Map<String, Object>> parents = parentStudentRelationMapper.getParentsByStudentId(studentId);

            // 处理数据
            for (Map<String, Object> parent : parents) {
                String relationType = (String) parent.get("relationType");
                parent.put("relationTypeText", getRelationTypeText(relationType));

                Object isp = parent.get("isPrimary");
                int isPrimaryVal = 0;
                if (isp instanceof Number) {
                    isPrimaryVal = ((Number) isp).intValue();
                } else if (isp instanceof Boolean) {
                    isPrimaryVal = ((Boolean) isp) ? 1 : 0;
                }
                parent.put("isPrimaryText", isPrimaryVal == 1 ? "主要联系人" : "");
                parent.put("isPrimary", isPrimaryVal);
            }

            log.info("Found {} bind parents for studentId: {}", parents.size(), studentId);
            return parents;
        } catch (Exception e) {
            log.error("Error getting bind parents", e);
            throw new RuntimeException("获取绑定家长列表失败", e);
        }
    }

    /**
     * 获取当前学生ID
     */
    private Long getCurrentStudentId() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String phone = request.getHeader("X-User-Phone");
                log.info("Getting student ID for phone: {}", phone);
                
                if (phone != null && !phone.isEmpty()) {
                    Student student = studentMapper.findByPhone(phone);
                    if (student != null) {
                        Long studentId = student.getId();
                        log.info("Found studentId: {} for phone: {}", studentId, phone);
                        return studentId;
                    }
                }
            }
            throw new RuntimeException("无法获取学生信息");
        } catch (Exception e) {
            log.error("Error getting current student ID", e);
            throw new RuntimeException("获取学生信息失败", e);
        }
    }

    /**
     * 获取关系类型文本
     */
    private String getRelationTypeText(String relationType) {
        if (relationType == null) return "家长";
        switch (relationType) {
            case "parent": return "父母";
            case "guardian": return "监护人";
            case "relative": return "亲属";
            default: return "家长";
        }
    }

    /** 家长端：获取当前家长绑定的学生列表 */
    public java.util.List<java.util.Map<String,Object>> getStudentsOfCurrentParent(){
        try{
            org.springframework.web.context.request.ServletRequestAttributes attributes = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attributes == null) throw new RuntimeException("请求上下文为空");
            jakarta.servlet.http.HttpServletRequest request = attributes.getRequest();
            String phone = request.getHeader("X-User-Phone");
            com.education.admin.modules.parent.entity.Parent p = (phone==null||phone.isEmpty()) ? null : parentMapper.findByPhone(phone);
            if (p == null) throw new RuntimeException("家长信息不存在");
            return parentStudentRelationMapper.getStudentsByParentId(p.getId());
        }catch(Exception e){
            throw new RuntimeException("获取子女列表失败", e);
        }
    }

    @Override
    public Map<String, Object> getParentStudyStats(String period, String phone) {
        try {
            // 获取家长手机号（从请求头兜底）
            String p = phone;
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if ((p == null || p.isEmpty()) && attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                p = request.getHeader("X-User-Phone");
            }

            // 1) 找到家长 -> 学生ID列表
            com.education.admin.modules.parent.entity.Parent parent = parentMapper.findByPhone(p);
            if (parent == null) throw new RuntimeException("家长不存在");
            java.util.List<Long> studentIds = parentStudentRelationMapper.findStudentIdsByParentId(parent.getId());
            if (studentIds == null || studentIds.isEmpty()) studentIds = java.util.Collections.emptyList();

            // 2) 计算今日/本周/本月课时（每条 teacher_schedule 记录算1）
            java.time.LocalDateTime startToday = java.time.LocalDate.now().atStartOfDay();
            java.time.LocalDateTime endToday = startToday.plusDays(1).minusNanos(1);
            java.time.LocalDate weekStart = java.time.LocalDate.now().with(java.time.DayOfWeek.MONDAY);
            java.time.LocalDateTime startWeek = weekStart.atStartOfDay();
            java.time.LocalDateTime endWeek = startWeek.plusDays(7).minusNanos(1);
            java.time.LocalDate monthStart = java.time.LocalDate.now().withDayOfMonth(1);
            java.time.LocalDateTime startMonth = monthStart.atStartOfDay();
            java.time.LocalDateTime endMonth = startMonth.plusMonths(1).minusNanos(1);

            int today = 0, week = 0, month = 0;
            for (Long sid : studentIds) {
                today += teacherScheduleMapper.countLessonsByStudentInRange(sid, startToday, endToday);
                week += teacherScheduleMapper.countLessonsByStudentInRange(sid, startWeek, endWeek);
                month += teacherScheduleMapper.countLessonsByStudentInRange(sid, startMonth, endMonth);
            }

            Map<String, Object> data = new java.util.HashMap<>();
            Map<String, Object> duration = new java.util.HashMap<>();
            duration.put("today", today);
            duration.put("week", week);
            duration.put("month", month);
            data.put("duration", duration);

            // 3) 图表：period=day|week|month
            java.util.List<String> labels = new java.util.ArrayList<>();
            java.util.List<Integer> values = new java.util.ArrayList<>();
            String pkey = (period == null || period.isEmpty()) ? "day" : period;
            if ("week".equalsIgnoreCase(pkey)) {
                // 最近8周，以周起始（周一）聚合
                java.time.LocalDate baseMonday = java.time.LocalDate.now().with(java.time.DayOfWeek.MONDAY);
                for (int i = 7; i >= 0; i--) {
                    java.time.LocalDate startWeekD = baseMonday.minusWeeks(i);
                    java.time.LocalDateTime s = startWeekD.atStartOfDay();
                    java.time.LocalDateTime e = s.plusDays(7).minusNanos(1);
                    int cnt = 0;
                    for (Long sid : studentIds) {
                        cnt += teacherScheduleMapper.countLessonsByStudentInRange(sid, s, e);
                    }
                    labels.add(startWeekD.getMonthValue() + "/" + startWeekD.getDayOfMonth());
                    values.add(cnt);
                }
            } else if ("month".equalsIgnoreCase(pkey)) {
                // 最近6个月，每月聚合
                java.time.LocalDate firstOfMonth = java.time.LocalDate.now().withDayOfMonth(1);
                for (int i = 5; i >= 0; i--) {
                    java.time.LocalDate m = firstOfMonth.minusMonths(i);
                    java.time.LocalDateTime s = m.atStartOfDay();
                    java.time.LocalDateTime e = s.plusMonths(1).minusNanos(1);
                    int cnt = 0;
                    for (Long sid : studentIds) {
                        cnt += teacherScheduleMapper.countLessonsByStudentInRange(sid, s, e);
                    }
                    labels.add(m.getYear() + "-" + String.format("%02d", m.getMonthValue()));
                    values.add(cnt);
                }
            } else {
                // day：最近7天
                java.time.LocalDate start = java.time.LocalDate.now().minusDays(6);
                for (int i = 0; i < 7; i++) {
                    java.time.LocalDate d = start.plusDays(i);
                    java.time.LocalDateTime s = d.atStartOfDay();
                    java.time.LocalDateTime e = s.plusDays(1).minusNanos(1);
                    int cnt = 0;
                    for (Long sid : studentIds) {
                        cnt += teacherScheduleMapper.countLessonsByStudentInRange(sid, s, e);
                    }
                    labels.add(String.valueOf(d.getDayOfMonth()));
                    values.add(cnt);
                }
            }
            Map<String, Object> chart = new java.util.HashMap<>();
            chart.put("labels", labels);
            chart.put("values", values);
            data.put("chart", chart);

            return data;
        } catch (Exception e) {
            throw new RuntimeException("获取学习统计失败", e);
        }
    }
}
