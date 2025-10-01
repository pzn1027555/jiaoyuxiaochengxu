package com.education.admin.modules.badge.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户红点通知实体类
 */
@Data
public class UserBadgeNotification {
    
    /**
     * 主键ID
     */
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户类型：teacher-教师, student-学生, parent-家长
     */
    private String userType;
    
    /**
     * 红点标识键
     */
    private String badgeKey;
    
    /**
     * 模块名称
     */
    private String moduleName;
    
    /**
     * 是否显示红点：0-不显示，1-显示
     */
    private Boolean isVisible;
    
    /**
     * 红点数量（0表示只显示红点不显示数字）
     */
    private Integer badgeCount;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}

