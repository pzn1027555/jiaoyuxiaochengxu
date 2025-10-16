package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.modules.badge.service.UserBadgeNotificationService;
import com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper;
import com.education.admin.modules.miniprogram.mapper.StudentNotificationMapper;
import com.education.admin.modules.miniprogram.service.StudentNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 学生/家长通知服务实现类
 */
@Slf4j
@Service
public class StudentNotificationServiceImpl implements StudentNotificationService {
    
    @Autowired
    private StudentNotificationMapper notificationMapper;
    
    @Autowired
    private UserBadgeNotificationService badgeService;
    
    @Autowired
    private ParentStudentRelationMapper relationMapper;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void sendNotification(Long userId, String userType, String notificationType, 
                                String title, String content, Long relatedId) {
        try {
            // 1. 保存通知到 student_notification 表
            int result = notificationMapper.insert(userId, userType, notificationType, title, content, relatedId);
            
            if (result > 0) {
                // 2. 触发红点（查询未读通知数量）
                int unreadCount = notificationMapper.countUnread(userId, userType);
                badgeService.showBadge(userId, userType, "notifications", unreadCount);
                
                log.info("发送通知成功: userId={}, userType={}, type={}, title={}, unreadCount={}", 
                         userId, userType, notificationType, title, unreadCount);
            } else {
                log.warn("发送通知失败: userId={}, userType={}, type={}, title={}", 
                        userId, userType, notificationType, title);
            }
        } catch (Exception e) {
            log.error("发送通知异常: userId={}, userType={}, type={}, title={}", 
                     userId, userType, notificationType, title, e);
            throw e;
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void sendNotificationToStudentAndParents(Long studentId, String notificationType,
                                                   String studentTitle, String studentContent,
                                                   String parentTitle, String parentContent,
                                                   Long relatedId) {
        try {
            // 1. 发送通知给学生
            sendNotification(studentId, "student", notificationType, studentTitle, studentContent, relatedId);
            
            // 2. 查询该学生绑定的所有家长
            List<Long> parentIds = relationMapper.findParentIdsByStudentId(studentId);
            
            // 3. 发送通知给每个家长
            if (parentIds != null && !parentIds.isEmpty()) {
                for (Long parentId : parentIds) {
                    // 注意：家长的通知也存在student_notification表中，但user_type为parent
                    // student_id字段存的是关联的学生ID，用于家长查询时过滤
                    sendNotification(studentId, "parent", notificationType, parentTitle, parentContent, relatedId);
                    
                    // 同时给家长的红点系统发送通知（使用家长ID）
                    int unreadCount = notificationMapper.countUnread(studentId, "parent");
                    badgeService.showBadge(parentId, "parent", "notifications", unreadCount);
                }
                
                log.info("已发送通知给学生及其{}位家长: studentId={}, type={}", parentIds.size(), studentId, notificationType);
            } else {
                log.info("学生未绑定家长，仅发送学生通知: studentId={}, type={}", studentId, notificationType);
            }
        } catch (Exception e) {
            log.error("发送学生和家长通知异常: studentId={}, type={}", studentId, notificationType, e);
            throw e;
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void sendBatchNotification(List<Long> userIds, String userType, String notificationType,
                                     String title, String content, Long relatedId) {
        try {
            if (userIds == null || userIds.isEmpty()) {
                log.warn("批量发送通知失败：用户ID列表为空");
                return;
            }
            
            int successCount = 0;
            for (Long userId : userIds) {
                try {
                    sendNotification(userId, userType, notificationType, title, content, relatedId);
                    successCount++;
                } catch (Exception e) {
                    log.error("批量发送通知失败，跳过用户: userId={}", userId, e);
                }
            }
            
            log.info("批量发送通知完成: userType={}, type={}, total={}, success={}", 
                     userType, notificationType, userIds.size(), successCount);
        } catch (Exception e) {
            log.error("批量发送通知异常: userType={}, type={}", userType, notificationType, e);
            throw e;
        }
    }
}

