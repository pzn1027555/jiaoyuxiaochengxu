package com.education.admin.modules.competition.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.TeacherSchedule;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper;
import com.education.admin.modules.teacher.mapper.TeacherMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/schedule")
@RequiredArgsConstructor
public class AdminScheduleController {

    private final TeacherScheduleMapper scheduleMapper;
    private final TeacherMapper teacherMapper;

    /**
     * 管理端：为指定教师发布班课计划（按重复规则批量生成 teacher_schedule 记录）
     */
    @PostMapping("/big-class/plan")
    @Transactional
    public Result<Object> createBigClassPlan(@RequestBody Map<String, Object> body) {
        try {
            Long teacherId = asLong(body.get("teacherId"));
            if (teacherId == null) {
                return Result.error("teacherId 不能为空");
            }
            // 校验教师是否存在
            var teacher = teacherMapper.findById(teacherId);
            if (teacher == null) {
                return Result.error("教师不存在");
            }

            String title = asString(body.get("title"));
            Integer totalLessons = asInt(body.get("totalLessons"));
            if (title == null || totalLessons == null || totalLessons <= 0) {
                return Result.error("标题与课时为必填");
            }

            Long subjectId = asLong(body.get("subjectId"));
            String subjectName = asString(body.get("subjectName"));
            String startDate = asString(body.get("startDate")); // yyyy-MM-dd
            String startTime = asString(body.get("startTime")); // HH:mm
            Integer durationMinutes = orDefault(asInt(body.get("durationMinutes")), 90);
            String repeatType = orDefault(asString(body.get("repeatType")), "daily");
            String teachMode = orDefault(asString(body.get("teachMode")), "offline");
            String coverUrl = asString(body.get("coverUrl"));
            String tags = normalizeTags(body.get("tags")); // 存 JSON 字符串
            String intro = asString(body.get("intro"));
            String address = asString(body.get("address"));
            String province = asString(body.get("province"));
            String city = asString(body.get("city"));
            String district = asString(body.get("district"));
            String detailAddress = asString(body.get("detailAddress"));
            String contactPhone = asString(body.get("contactPhone"));

            LocalDate baseDate = startDate != null ? LocalDate.parse(startDate) : LocalDate.now();
            LocalTime baseTime = startTime != null ? LocalTime.parse(startTime.length()==5? startTime+":00": startTime) : LocalTime.of(9,0);

            String planCode = "CLASSPLAN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

            List<Map<String, Object>> created = new ArrayList<>();
            for (int i = 1; i <= totalLessons; i++) {
                LocalDate d = calcDateByRule(baseDate, repeatType, i);
                LocalDateTime st = LocalDateTime.of(d, baseTime);
                LocalDateTime ed = st.plusMinutes(durationMinutes);

                // 时间冲突校验（排除自身为空）
                int conflicts = scheduleMapper.countConflicts(teacherId, st, ed, null);
                if (conflicts > 0) {
                    return Result.error("第" + i + "节课程时间冲突");
                }

                TeacherSchedule ts = new TeacherSchedule();
                ts.setTeacherId(teacherId);
                ts.setSubjectId(subjectId);
                ts.setSubjectName(subjectName);
                ts.setTitle(title);
                ts.setClassType("big_class");
                ts.setTotalLessons(totalLessons);
                ts.setStartTime(st);
                ts.setEndTime(ed);
                ts.setCoverUrl(coverUrl);
                ts.setStudentCount(0);
                ts.setRemark(null);
                ts.setIntro(intro);
                ts.setCourseTags(tags);
                ts.setDurationMinutes(durationMinutes);
                ts.setTeachMode(teachMode);
                ts.setAddress(address);
                ts.setProvince(province);
                ts.setCity(city);
                ts.setDistrict(district);
                ts.setDetailAddress(detailAddress);
                ts.setContactPhone(contactPhone);
                ts.setLessonNumber(i);
                ts.setPlanId(planCode);
                ts.setConfirmationStatus("unconfirmed");
                ts.setStatus(1);

                scheduleMapper.insert(ts);

                Map<String, Object> item = new HashMap<>();
                item.put("id", ts.getId());
                item.put("lessonNumber", i);
                item.put("startTime", st.toString());
                item.put("endTime", ed.toString());
                created.add(item);
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("planCode", planCode);
            resp.put("items", created);
            return Result.success("班课计划创建成功", resp);
        } catch (Exception e) {
            log.error("创建班课计划失败", e);
            return Result.error("创建班课计划失败: " + e.getMessage());
        }
    }

    private static Integer orDefault(Integer v, Integer d){ return v == null ? d : v; }
    private static String orDefault(String v, String d){ return (v == null || v.isBlank()) ? d : v; }
    private static String asString(Object obj){ return obj == null ? null : String.valueOf(obj); }
    private static Long asLong(Object obj){
        if (obj == null) return null;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.valueOf(String.valueOf(obj)); } catch (Exception e) { return null; }
    }
    private static Integer asInt(Object obj){
        if (obj == null) return null;
        if (obj instanceof Number) return ((Number) obj).intValue();
        try { return Integer.valueOf(String.valueOf(obj)); } catch (Exception e) { return null; }
    }
    private static String normalizeTags(Object tags){
        if (tags == null) return null;
        if (tags instanceof String) {
            String s = (String) tags;
            String t = s.trim();
            if (t.startsWith("[") && t.endsWith("]")) return t; // 已是 JSON 数组
            if (t.isEmpty()) return null;
            // 逗号分隔转 JSON 数组
            String[] arr = t.split(",");
            List<String> list = new ArrayList<>();
            for (String a : arr) { String v = a.trim(); if (!v.isEmpty()) list.add(v); }
            return list.isEmpty()? null : new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(list).toString();
        }
        if (tags instanceof Collection) {
            return new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(tags).toString();
        }
        return String.valueOf(tags);
    }

    private static LocalDate calcDateByRule(LocalDate start, String repeatType, int seq){
        if (seq <= 1) return start;
        String rt = repeatType == null ? "daily" : repeatType;
        switch (rt){
            case "every3days": return start.plusDays((seq-1)*3L);
            case "every5days": return start.plusDays((seq-1)*5L);
            case "weekly": return start.plusWeeks(seq-1);
            case "monthly": return start.plusMonths(seq-1);
            default: return start.plusDays(seq-1);
        }
    }
}


