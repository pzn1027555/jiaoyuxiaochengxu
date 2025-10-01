package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface MiniCourseEnrollService {
    
    /**
     * 学生报名课程（代付方式）
     * @param payload 包含courseId, scheduleId, teacherId, parentId, amount等信息
     * @return 报名结果
     */
    Result<Object> enrollCourse(Map<String, Object> payload);
    
    /**
     * 取消课程报名
     * @param scheduleId 排课ID
     * @return 取消结果
     */
    Result<Object> cancelEnrollment(Long scheduleId);
    
    /**
     * 检查学生是否已报名某课程
     * @param scheduleId 排课ID
     * @return 是否已报名
     */
    Result<Object> checkEnrollmentStatus(Long scheduleId);
}
