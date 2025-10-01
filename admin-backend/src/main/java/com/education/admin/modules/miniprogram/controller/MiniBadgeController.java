package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.badge.dto.BadgeStatusResponse;
import com.education.admin.modules.badge.service.UserBadgeNotificationService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序红点通知控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/badge")
public class MiniBadgeController {
    
    @Autowired
    private UserBadgeNotificationService badgeService;
    
    @GetMapping("/status")
    public Result<List<BadgeStatusResponse>> getBadgeStatus(
            @RequestParam Long userId,
            @RequestParam String userType) {
        
        log.info("小程序获取用户红点状态，userId: {}, userType: {}", userId, userType);
        return badgeService.getUserBadgeStatus(userId, userType);
    }
    
    @PostMapping("/hide")
    public Result<Void> hideBadge(
            @RequestParam Long userId,
            @RequestParam String userType,
            @RequestParam String badgeKey) {
        
        log.info("小程序隐藏红点，userId: {}, userType: {}, badgeKey: {}", userId, userType, badgeKey);
        return badgeService.hideBadge(userId, userType, badgeKey);
    }
    
    @PostMapping("/batch-hide")
    public Result<Void> batchHideBadges(
            @RequestParam Long userId,
            @RequestParam String userType,
            @RequestBody List<String> badgeKeys) {
        
        log.info("小程序批量隐藏红点，userId: {}, userType: {}, badgeKeys: {}", userId, userType, badgeKeys);
        return badgeService.batchHideBadges(userId, userType, badgeKeys);
    }
}
