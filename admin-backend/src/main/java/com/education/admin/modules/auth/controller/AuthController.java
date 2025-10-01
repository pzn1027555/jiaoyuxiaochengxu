package com.education.admin.modules.auth.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.auth.entity.User;
import com.education.admin.modules.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getUsername(), request.getPassword());
            User user = authService.getUserByUsername(request.getUsername());
            
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUser(user);
            
            return Result.success(response);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/user")
    public Result<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            String username = authService.getUsernameFromToken(token);
            User user = authService.getUserByUsername(username);
            
            return Result.success(user);
        } catch (Exception e) {
            return Result.error("获取用户信息失败");
        }
    }
    
    /**
     * 登录请求数据
     */
    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
    
    /**
     * 登录响应数据
     */
    @Data
    public static class LoginResponse {
        private String token;
        private User user;
    }
}