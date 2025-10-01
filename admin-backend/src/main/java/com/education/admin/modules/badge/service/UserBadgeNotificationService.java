package com.education.admin.modules.badge.service;

import com.education.admin.common.Result;
import com.education.admin.modules.badge.dto.BadgeStatusRequest;
import com.education.admin.modules.badge.dto.BadgeStatusResponse;

import java.util.List;

/**
 * 用户红点通知服务接口
 */
public interface UserBadgeNotificationService {
    
    /**
     * 获取用户所有红点状态
     */
    Result<List<BadgeStatusResponse>> getUserBadgeStatus(Long userId, String userType);
    
    /**
     * 显示红点
     */
    Result<Void> showBadge(Long userId, String userType, String badgeKey, Integer badgeCount);
    
    /**
     * 隐藏红点
     */
    Result<Void> hideBadge(Long userId, String userType, String badgeKey);
    
    /**
     * 更新红点状态
     */
    Result<Void> updateBadgeStatus(BadgeStatusRequest request);
    
    /**
     * 批量隐藏红点
     */
    Result<Void> batchHideBadges(Long userId, String userType, List<String> badgeKeys);
    
    /**
     * 初始化用户红点配置（用户注册时调用）
     */
    Result<Void> initUserBadges(Long userId, String userType);
}

