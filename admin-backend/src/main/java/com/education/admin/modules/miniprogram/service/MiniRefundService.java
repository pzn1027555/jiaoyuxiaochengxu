package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface MiniRefundService {
    Result<Map<String,Object>> apply(Map<String,Object> payload);
    Result<Map<String,Object>> status(Long orderId);
    Result<String> revoke(Long orderId);
}


