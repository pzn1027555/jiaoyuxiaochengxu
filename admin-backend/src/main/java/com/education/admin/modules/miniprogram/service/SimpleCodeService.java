package com.education.admin.modules.miniprogram.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 简化的验证码服务 - 使用内存缓存
 */
@Slf4j
@Service
public class SimpleCodeService {

    // 内存缓存存储验证码，key为手机号，value为验证码
    private final Map<String, String> codeCache = new ConcurrentHashMap<>();

    /**
     * 发送验证码 - 模拟发送，固定返回123456
     */
    public String sendCode(String phone) {
        String code = "123456"; // 固定验证码
        
        // 存储到内存缓存
        codeCache.put(phone, code);
        
        log.info("为手机号 {} 生成验证码: {}", phone, code);
        return code;
    }

    /**
     * 验证验证码
     */
    public boolean verifyCode(String phone, String code) {
        String cachedCode = codeCache.get(phone);
        
        boolean isValid = "123456".equals(code) || code.equals(cachedCode);
        
        if (isValid) {
            // 验证成功后删除缓存
            codeCache.remove(phone);
            log.info("手机号 {} 验证码验证成功", phone);
        } else {
            log.warn("手机号 {} 验证码验证失败: 输入={}, 缓存={}", phone, code, cachedCode);
        }
        
        return isValid;
    }

    /**
     * 清除过期验证码（可以定时调用）
     */
    public void clearExpiredCodes() {
        codeCache.clear();
        log.debug("清除验证码缓存");
    }
}