package com.education.admin.modules.miniprogram.service;

import java.util.List;

/**
 * 学生/家长通知服务接口
 */
public interface StudentNotificationService {
    
    /**
     * 发送通知并触发红点
     * @param userId 用户ID（学生ID或家长ID）
     * @param userType 用户类型（student/parent）
     * @param notificationType 通知类型（order/system/activity）
     * @param title 标题
     * @param content 内容
     * @param relatedId 关联ID（可为null）
     */
    void sendNotification(Long userId, String userType, String notificationType, 
                         String title, String content, Long relatedId);
    
    /**
     * 给学生和其绑定的家长发送通知
     * @param studentId 学生ID
     * @param notificationType 通知类型
     * @param studentTitle 给学生的标题
     * @param studentContent 给学生的内容
     * @param parentTitle 给家长的标题
     * @param parentContent 给家长的内容
     * @param relatedId 关联ID（可为null）
     */
    void sendNotificationToStudentAndParents(Long studentId, String notificationType,
                                            String studentTitle, String studentContent,
                                            String parentTitle, String parentContent,
                                            Long relatedId);
    
    /**
     * 批量发送通知（如活动通知）
     * @param userIds 用户ID列表
     * @param userType 用户类型
     * @param notificationType 通知类型
     * @param title 标题
     * @param content 内容
     * @param relatedId 关联ID（可为null）
     */
    void sendBatchNotification(List<Long> userIds, String userType, String notificationType,
                               String title, String content, Long relatedId);
}

