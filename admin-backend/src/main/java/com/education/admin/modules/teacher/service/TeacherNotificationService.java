package com.education.admin.modules.teacher.service;

import com.education.admin.common.Result;
import com.education.admin.modules.teacher.dto.TeacherNotificationResponse;
import com.education.admin.modules.teacher.dto.InterviewNotificationRequest;

import java.util.List;

/**
 * 教师通知服务接口
 *
 * @author education
 * @since 2025-08-16
 */
public interface TeacherNotificationService {
    
    /**
     * 发送面试通知
     */
    Result<Void> sendInterviewNotification(InterviewNotificationRequest request);
    
    /**
     * 发送评级通知
     */
    Result<Void> sendGradeNotification(Long certificationId, String teacherLevel, String gradeReason);
    
    /**
     * 发送审核通知
     */
    Result<Void> sendAuditNotification(Long certificationId, Integer certificationStatus, String auditReason);
    
    /**
     * 获取教师通知列表
     */
    Result<List<TeacherNotificationResponse>> getNotificationList(Long teacherId);
    
    /**
     * 获取未读通知数量
     */
    Result<Integer> getUnreadCount(Long teacherId);
    
    /**
     * 标记通知为已读
     */
    Result<Void> markAsRead(Long notificationId, Long teacherId);
    
    /**
     * 标记所有通知为已读
     */
    Result<Void> markAllAsRead(Long teacherId);
}
