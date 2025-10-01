package com.education.admin.modules.badge.mapper;

import com.education.admin.modules.badge.entity.UserBadgeNotification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户红点通知Mapper接口
 */
@Mapper
public interface UserBadgeNotificationMapper {
    
    /**
     * 根据用户ID和类型查询所有红点状态
     */
    List<UserBadgeNotification> selectByUserIdAndType(@Param("userId") Long userId, @Param("userType") String userType);
    
    /**
     * 根据用户ID、类型和红点键查询
     */
    UserBadgeNotification selectByUserAndBadgeKey(@Param("userId") Long userId, 
                                                  @Param("userType") String userType, 
                                                  @Param("badgeKey") String badgeKey);
    
    /**
     * 插入红点记录
     */
    int insert(UserBadgeNotification badge);
    
    /**
     * 更新红点状态
     */
    int updateBadgeStatus(@Param("userId") Long userId, 
                         @Param("userType") String userType, 
                         @Param("badgeKey") String badgeKey, 
                         @Param("isVisible") Boolean isVisible, 
                         @Param("badgeCount") Integer badgeCount);
    
    /**
     * 隐藏指定用户的指定红点
     */
    int hideBadge(@Param("userId") Long userId, 
                  @Param("userType") String userType, 
                  @Param("badgeKey") String badgeKey);
    
    /**
     * 显示指定用户的指定红点
     */
    int showBadge(@Param("userId") Long userId, 
                  @Param("userType") String userType, 
                  @Param("badgeKey") String badgeKey, 
                  @Param("badgeCount") Integer badgeCount);
    
    /**
     * 批量更新红点状态
     */
    int batchUpdateBadgeStatus(@Param("userId") Long userId, 
                              @Param("userType") String userType, 
                              @Param("badgeKeys") List<String> badgeKeys, 
                              @Param("isVisible") Boolean isVisible);
}

