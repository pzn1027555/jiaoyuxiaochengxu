package com.education.admin.modules.badge.dto;

import lombok.Data;

/**
 * 红点状态响应DTO
 */
@Data
public class BadgeStatusResponse {
    
    /**
     * 红点标识键
     */
    private String badgeKey;
    
    /**
     * 模块名称
     */
    private String moduleName;
    
    /**
     * 是否显示红点
     */
    private Boolean isVisible;
    
    /**
     * 红点数量
     */
    private Integer badgeCount;
    
    public BadgeStatusResponse() {}
    
    public BadgeStatusResponse(String badgeKey, String moduleName, Boolean isVisible, Integer badgeCount) {
        this.badgeKey = badgeKey;
        this.moduleName = moduleName;
        this.isVisible = isVisible;
        this.badgeCount = badgeCount;
    }
}

