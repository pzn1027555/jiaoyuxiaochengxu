package com.education.admin.modules.badge.dto;

import lombok.Data;



/**
 * 红点状态请求DTO
 */
@Data
public class BadgeStatusRequest {
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户类型
     */
    private String userType;
    
    /**
     * 红点标识键
     */
    private String badgeKey;
    
    /**
     * 是否显示红点
     */
    private Boolean isVisible;
    
    /**
     * 红点数量
     */
    private Integer badgeCount;
}
