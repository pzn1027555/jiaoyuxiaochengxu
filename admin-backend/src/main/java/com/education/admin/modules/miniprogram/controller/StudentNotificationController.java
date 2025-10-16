package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.StudentNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 学生/家长通知管理Controller
 * 用于管理员发送系统通知和活动通知
 */
@Slf4j
@RestController
@RequestMapping("/admin/student-notification")
public class StudentNotificationController {
    
    @Autowired
    private StudentNotificationService notificationService;
    
    /**
     * 发送单个通知
     * @param request 包含userId, userType, notificationType, title, content, relatedId
     */
    @PostMapping("/send")
    public Result<String> sendNotification(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String userType = (String) request.get("userType");
            String notificationType = (String) request.get("notificationType");
            String title = (String) request.get("title");
            String content = (String) request.get("content");
            Long relatedId = request.get("relatedId") != null ? Long.parseLong(request.get("relatedId").toString()) : null;
            
            notificationService.sendNotification(userId, userType, notificationType, title, content, relatedId);
            
            return Result.success("通知发送成功");
        } catch (Exception e) {
            log.error("发送通知失败", e);
            return Result.error("发送通知失败：" + e.getMessage());
        }
    }
    
    /**
     * 给学生和家长发送通知
     * @param request 包含studentId, notificationType, studentTitle, studentContent, parentTitle, parentContent, relatedId
     */
    @PostMapping("/send-to-student-and-parents")
    public Result<String> sendToStudentAndParents(@RequestBody Map<String, Object> request) {
        try {
            Long studentId = Long.parseLong(request.get("studentId").toString());
            String notificationType = (String) request.get("notificationType");
            String studentTitle = (String) request.get("studentTitle");
            String studentContent = (String) request.get("studentContent");
            String parentTitle = (String) request.get("parentTitle");
            String parentContent = (String) request.get("parentContent");
            Long relatedId = request.get("relatedId") != null ? Long.parseLong(request.get("relatedId").toString()) : null;
            
            notificationService.sendNotificationToStudentAndParents(
                studentId, notificationType, 
                studentTitle, studentContent, 
                parentTitle, parentContent, 
                relatedId
            );
            
            return Result.success("通知发送成功");
        } catch (Exception e) {
            log.error("发送学生和家长通知失败", e);
            return Result.error("发送通知失败：" + e.getMessage());
        }
    }
    
    /**
     * 批量发送通知（用于系统通知或活动通知）
     * @param request 包含userIds, userType, notificationType, title, content, relatedId
     */
    @PostMapping("/send-batch")
    public Result<String> sendBatchNotification(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> userIdsInt = (List<Integer>) request.get("userIds");
            List<Long> userIds = userIdsInt.stream()
                .map(Integer::longValue)
                .collect(java.util.stream.Collectors.toList());
            
            String userType = (String) request.get("userType");
            String notificationType = (String) request.get("notificationType");
            String title = (String) request.get("title");
            String content = (String) request.get("content");
            Long relatedId = request.get("relatedId") != null ? Long.parseLong(request.get("relatedId").toString()) : null;
            
            notificationService.sendBatchNotification(userIds, userType, notificationType, title, content, relatedId);
            
            return Result.success("批量通知发送成功");
        } catch (Exception e) {
            log.error("批量发送通知失败", e);
            return Result.error("批量发送通知失败：" + e.getMessage());
        }
    }
    
    /**
     * 发送系统广播通知（所有学生或所有家长）
     * @param request 包含userType, title, content
     */
    @PostMapping("/broadcast")
    public Result<String> broadcastNotification(@RequestBody Map<String, Object> request) {
        try {
            // TODO: 查询所有学生或家长ID，然后批量发送
            // 这里需要根据实际业务需求实现
            String userType = (String) request.get("userType");
            String title = (String) request.get("title");
            
            log.info("系统广播通知: userType={}, title={}", userType, title);
            
            return Result.success("广播通知功能待实现，需要查询所有用户ID");
        } catch (Exception e) {
            log.error("发送广播通知失败", e);
            return Result.error("发送广播通知失败：" + e.getMessage());
        }
    }
}

