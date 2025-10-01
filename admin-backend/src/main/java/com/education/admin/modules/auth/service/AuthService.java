package com.education.admin.modules.auth.service;

import com.education.admin.modules.auth.entity.User;

/**
 * 认证服务接口
 */
public interface AuthService {
    
    /**
     * 用户登录
     */
    String login(String username, String password);
    
    /**
     * 根据用户名获取用户信息
     */
    User getUserByUsername(String username);
    
    /**
     * 根据ID获取用户信息
     */
    User getUserById(Long id);
    
    /**
     * 验证JWT Token
     */
    boolean validateToken(String token);
    
    /**
     * 从Token中获取用户名
     */
    String getUsernameFromToken(String token);
}