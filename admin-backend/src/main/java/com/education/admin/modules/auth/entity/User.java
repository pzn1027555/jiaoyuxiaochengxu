package com.education.admin.modules.auth.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统用户实体 - 对应sys_user表
 */
@Data
public class User {
    
    private Long id;
    
    private String username;
    
    private String password;
    
    private String realName;     // 真实姓名
    
    private String email;
    
    private String phone;
    
    private Integer status;      // 1-启用 0-禁用
    
    private String role;         // admin-管理员，teacher-教师，operator-运营
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
    
    private LocalDateTime lastLoginTime;
}