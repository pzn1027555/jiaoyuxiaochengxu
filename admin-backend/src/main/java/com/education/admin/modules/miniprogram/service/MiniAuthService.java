package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

/**
 * 小程序认证服务接口
 */
public interface MiniAuthService {
    
    /**
     * 发送短信验证码
     */
    Result<Object> sendSmsCode(String phone);
    
    /**
     * 手机号验证码登录
     */
    Result<Object> phoneLogin(String phone, String code);
    
    /**
     * 选择用户角色
     */
    Result<Object> selectRole(String role);
    
    /**
     * 验证Token
     */
    Result<Object> verifyToken();
    
    /**
     * 登出
     */
    Result<Void> logout();
}