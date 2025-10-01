package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

public interface MiniStudentScheduleService {
    Result<java.util.Map<String,Object>> getDay(java.time.LocalDate date, Long studentId);
    Result<java.util.Map<String,Object>> getReview(Long scheduleId);
    Result<Object> submitReview(Long scheduleId, String content, Integer starRating);
}


