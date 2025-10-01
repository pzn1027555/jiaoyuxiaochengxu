package com.education.admin.modules.badge.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.badge.dto.BadgeStatusRequest;
import com.education.admin.modules.badge.dto.BadgeStatusResponse;
import com.education.admin.modules.badge.entity.UserBadgeNotification;
import com.education.admin.modules.badge.mapper.UserBadgeNotificationMapper;
import com.education.admin.modules.badge.service.UserBadgeNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户红点通知服务实现
 */
@Slf4j
@Service
public class UserBadgeNotificationServiceImpl implements UserBadgeNotificationService {
    
    @Autowired
    private UserBadgeNotificationMapper badgeMapper;
    
    @Override
    public Result<List<BadgeStatusResponse>> getUserBadgeStatus(Long userId, String userType) {
        try {
            List<UserBadgeNotification> badges = badgeMapper.selectByUserIdAndType(userId, userType);
            
            // 如果用户没有红点配置，初始化默认配置
            if (badges.isEmpty()) {
                initUserBadges(userId, userType);
                badges = badgeMapper.selectByUserIdAndType(userId, userType);
            }
            
            List<BadgeStatusResponse> responses = badges.stream()
                    .map(badge -> new BadgeStatusResponse(
                            badge.getBadgeKey(),
                            badge.getModuleName(),
                            badge.getIsVisible(),
                            badge.getBadgeCount()
                    ))
                    .collect(Collectors.toList());
                    
            return Result.success(responses);
        } catch (Exception e) {
            log.error("获取用户红点状态失败，userId: {}, userType: {}", userId, userType, e);
            return Result.error("获取红点状态失败");
        }
    }
    
    @Override
    public Result<Void> showBadge(Long userId, String userType, String badgeKey, Integer badgeCount) {
        try {
            int updated = badgeMapper.showBadge(userId, userType, badgeKey, badgeCount);
            if (updated > 0) {
                log.info("显示红点成功，userId: {}, userType: {}, badgeKey: {}, count: {}", 
                        userId, userType, badgeKey, badgeCount);
                return Result.success();
            } else {
                return Result.error("红点配置不存在");
            }
        } catch (Exception e) {
            log.error("显示红点失败，userId: {}, userType: {}, badgeKey: {}", userId, userType, badgeKey, e);
            return Result.error("显示红点失败");
        }
    }
    
    @Override
    public Result<Void> hideBadge(Long userId, String userType, String badgeKey) {
        try {
            int updated = badgeMapper.hideBadge(userId, userType, badgeKey);
            if (updated > 0) {
                log.info("隐藏红点成功，userId: {}, userType: {}, badgeKey: {}", userId, userType, badgeKey);
                return Result.success();
            } else {
                return Result.error("红点配置不存在");
            }
        } catch (Exception e) {
            log.error("隐藏红点失败，userId: {}, userType: {}, badgeKey: {}", userId, userType, badgeKey, e);
            return Result.error("隐藏红点失败");
        }
    }
    
    @Override
    public Result<Void> updateBadgeStatus(BadgeStatusRequest request) {
        try {
            int updated = badgeMapper.updateBadgeStatus(
                    request.getUserId(),
                    request.getUserType(),
                    request.getBadgeKey(),
                    request.getIsVisible(),
                    request.getBadgeCount()
            );
            
            if (updated > 0) {
                log.info("更新红点状态成功，userId: {}, userType: {}, badgeKey: {}, visible: {}, count: {}", 
                        request.getUserId(), request.getUserType(), request.getBadgeKey(), 
                        request.getIsVisible(), request.getBadgeCount());
                return Result.success();
            } else {
                return Result.error("红点配置不存在");
            }
        } catch (Exception e) {
            log.error("更新红点状态失败，request: {}", request, e);
            return Result.error("更新红点状态失败");
        }
    }
    
    @Override
    public Result<Void> batchHideBadges(Long userId, String userType, List<String> badgeKeys) {
        try {
            int updated = badgeMapper.batchUpdateBadgeStatus(userId, userType, badgeKeys, false);
            log.info("批量隐藏红点成功，userId: {}, userType: {}, badgeKeys: {}, updated: {}", 
                    userId, userType, badgeKeys, updated);
            return Result.success();
        } catch (Exception e) {
            log.error("批量隐藏红点失败，userId: {}, userType: {}, badgeKeys: {}", userId, userType, badgeKeys, e);
            return Result.error("批量隐藏红点失败");
        }
    }
    
    @Override
    public Result<Void> initUserBadges(Long userId, String userType) {
        try {
            // 根据用户类型初始化不同的红点配置
            List<UserBadgeNotification> defaultBadges = getDefaultBadgeConfig(userId, userType);
            
            for (UserBadgeNotification badge : defaultBadges) {
                badgeMapper.insert(badge);
            }
            
            log.info("初始化用户红点配置成功，userId: {}, userType: {}, count: {}", 
                    userId, userType, defaultBadges.size());
            return Result.success();
        } catch (Exception e) {
            log.error("初始化用户红点配置失败，userId: {}, userType: {}", userId, userType, e);
            return Result.error("初始化红点配置失败");
        }
    }
    
    /**
     * 获取默认红点配置
     */
    private List<UserBadgeNotification> getDefaultBadgeConfig(Long userId, String userType) {
        if ("teacher".equals(userType)) {
            return Arrays.asList(
                    createBadge(userId, userType, "certification", "教师认证"),
                    createBadge(userId, userType, "booking", "课程预约"),
                    createBadge(userId, userType, "message", "消息中心"),
                    createBadge(userId, userType, "research", "教研活动"),
                    createBadge(userId, userType, "employment", "就业服务"),
                    createBadge(userId, userType, "mooc", "磨课")
            );
        } else if ("student".equals(userType)) {
            return Arrays.asList(
                    createBadge(userId, userType, "course_notification", "课程通知"),
                    createBadge(userId, userType, "homework_reminder", "作业提醒"),
                    createBadge(userId, userType, "message_center", "消息中心")
            );
        } else if ("parent".equals(userType)) {
            return Arrays.asList(
                    createBadge(userId, userType, "child_progress", "孩子进度"),
                    createBadge(userId, userType, "message_center", "消息中心"),
                    createBadge(userId, userType, "payment_reminder", "缴费提醒")
            );
        }
        return Arrays.asList();
    }
    
    /**
     * 创建红点配置
     */
    private UserBadgeNotification createBadge(Long userId, String userType, String badgeKey, String moduleName) {
        UserBadgeNotification badge = new UserBadgeNotification();
        badge.setUserId(userId);
        badge.setUserType(userType);
        badge.setBadgeKey(badgeKey);
        badge.setModuleName(moduleName);
        badge.setIsVisible(false);
        badge.setBadgeCount(0);
        return badge;
    }
}

