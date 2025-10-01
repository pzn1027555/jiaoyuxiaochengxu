package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniAuthService;
import com.education.admin.modules.miniprogram.dto.PhoneLoginRequest;
import com.education.admin.modules.miniprogram.dto.SendCodeRequest;
import com.education.admin.modules.miniprogram.dto.SelectRoleRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 小程序认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/auth")
@RequiredArgsConstructor
public class MiniAuthController {

    private final MiniAuthService miniAuthService;

    /**
     * 发送验证码
     */
    @PostMapping("/send-code")
    public Result<Object> sendCode(@Valid @RequestBody SendCodeRequest request) {
        log.info("发送验证码请求: {}", request.getPhone());
        return miniAuthService.sendSmsCode(request.getPhone());
    }

    /**
     * 手机号验证码登录
     */
    @PostMapping("/phone-login")
    public Result<Object> phoneLogin(@Valid @RequestBody PhoneLoginRequest request) {
        log.info("手机号登录请求: {}", request.getPhone());
        return miniAuthService.phoneLogin(request.getPhone(), request.getCode());
    }

    /**
     * 选择用户角色
     */
    @PostMapping("/select-role")
    public Result<Object> selectRole(@Valid @RequestBody SelectRoleRequest request) {
        log.info("选择角色请求: {}", request.getRole());
        return miniAuthService.selectRole(request.getRole());
    }

    /**
     * 验证Token
     */
    @GetMapping("/verify")
    public Result<Object> verifyToken() {
        return miniAuthService.verifyToken();
    }

    /**
     * 登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        return miniAuthService.logout();
    }
}