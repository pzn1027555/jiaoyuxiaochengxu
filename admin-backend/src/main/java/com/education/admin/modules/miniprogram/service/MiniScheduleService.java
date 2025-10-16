package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import java.util.Map;

public interface MiniScheduleService {
    Result<Object> getDaySchedule(String date, Long teacherId); // yyyy-MM-dd, teacherId可选
    Result<Object> create(Map<String, Object> payload);
    // 创建学习计划（按课时与重复规则生成多条课程）
    Result<Object> createPlan(Map<String, Object> payload);
    Result<Object> updateTime(Long id, String startTime, String endTime);
    Result<Object> update(Long id, Map<String, Object> payload);
    Result<Object> delete(Long id);

    Result<Object> detail(Long id);

    // 反馈：获取与提交
    Result<Object> getFeedback(Long scheduleId);
    Result<Object> submitFeedback(Long scheduleId, String content, String feedbackType);

    Result<Object> getMonthSchedule(String month, Long teacherId); // teacherId可选
}


