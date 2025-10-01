package com.education.admin.modules.badge.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.badge.dto.BadgeStatusRequest;
import com.education.admin.modules.badge.dto.BadgeStatusResponse;
import com.education.admin.modules.badge.service.UserBadgeNotificationService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.List;

/**
 * 红点通知管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/badge")
public class BadgeController {
    
    @Autowired
    private UserBadgeNotificationService badgeService;
    
    @GetMapping("/status")
    public Result<List<BadgeStatusResponse>> getBadgeStatus(
            @RequestParam Long userId,
            @RequestParam String userType) {
        
        log.info("获取用户红点状态，userId: {}, userType: {}", userId, userType);
        return badgeService.getUserBadgeStatus(userId, userType);
    }
    
    @PostMapping("/show")
    public Result<Void> showBadge(
            @RequestParam Long userId,
            @RequestParam String userType,
            @RequestParam String badgeKey,
            @RequestParam(defaultValue = "0") Integer badgeCount) {
        
        log.info("显示红点，userId: {}, userType: {}, badgeKey: {}, count: {}", 
                userId, userType, badgeKey, badgeCount);
        return badgeService.showBadge(userId, userType, badgeKey, badgeCount);
    }
    
    @PostMapping("/hide")
    public Result<Void> hideBadge(
            @RequestParam Long userId,
            @RequestParam String userType,
            @RequestParam String badgeKey) {
        
        log.info("隐藏红点，userId: {}, userType: {}, badgeKey: {}", userId, userType, badgeKey);
        return badgeService.hideBadge(userId, userType, badgeKey);
    }
    
    @PostMapping("/update")
    public Result<Void> updateBadgeStatus(@RequestBody BadgeStatusRequest request) {
        log.info("更新红点状态，request: {}", request);
        return badgeService.updateBadgeStatus(request);
    }
    
    @PostMapping("/batch-hide")
    public Result<Void> batchHideBadges(
            @RequestParam Long userId,
            @RequestParam String userType,
            @RequestBody List<String> badgeKeys) {
        
        log.info("批量隐藏红点，userId: {}, userType: {}, badgeKeys: {}", userId, userType, badgeKeys);
        return badgeService.batchHideBadges(userId, userType, badgeKeys);
    }
    
    @PostMapping("/init")
    public Result<Void> initUserBadges(
            @RequestParam Long userId,
            @RequestParam String userType) {
        
        log.info("初始化用户红点配置，userId: {}, userType: {}", userId, userType);
        return badgeService.initUserBadges(userId, userType);
    }
}
