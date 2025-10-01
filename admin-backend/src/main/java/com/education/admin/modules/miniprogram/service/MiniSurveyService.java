package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface MiniSurveyService {
    Result<Object> getByStudent(Long studentId, Long teacherId);
    Result<Object> save(Map<String, Object> payload); // 兼容旧：预约信息创建/更新
    Result<Object> createBooking(Map<String, Object> payload); // 新：只创建预约，不覆盖问卷
    Result<Object> createSurveyDetail(Map<String, Object> payload); // 新：创建问卷明细，返回detailId
    Result<Object> getBookingCount(Long teacherId, Long studentId, String bookingType); // 新：查询预约次数
    Result<Object> createBookingWithDetail(Map<String, Object> payload);
    Result<Object> checkStudentSurveyDetail(Long studentId); // 新：同时创建预约和问卷明细
    Result<Object> listForBooking(Long teacherId, String phone);
    Result<Object> updateStatus(Long id, Integer status, String rejectReason);
}


