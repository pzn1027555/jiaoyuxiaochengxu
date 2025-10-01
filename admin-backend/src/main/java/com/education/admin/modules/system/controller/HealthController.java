package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 系统健康检查控制器
 */
@RestController
@RequestMapping("/api/system")
public class HealthController {
    
    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("timestamp", LocalDateTime.now());
        data.put("version", "1.0.0");
        data.put("description", "教育小程序后台管理系统");
        
        return Result.success(data);
    }
    
    /**
     * 获取系统信息
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> info() {
        Map<String, Object> data = new HashMap<>();
        data.put("projectName", "教育小程序后台管理系统");
        data.put("version", "1.0.0");
        data.put("architecture", "Spring Boot + MyBatis + MySQL");
        data.put("buildTime", LocalDateTime.now());
        
        return Result.success(data);
    }
}