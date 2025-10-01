package com.education.admin.modules.auth.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统用户实体
 */
@Data
public class AdminUser {
    
    private Long id;
    
    private String username;
    
    private String password;
    
    private String nickname;
    
    private String email;
    
    private String phone;
    
    private Integer status;  // 0-禁用 1-启用
    
    private Integer roleId;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}