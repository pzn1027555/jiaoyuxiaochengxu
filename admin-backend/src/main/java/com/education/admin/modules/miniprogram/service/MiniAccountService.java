package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.List;
import java.util.Map;

public interface MiniAccountService {
    Result<Map<String, Object>> getParentBalanceSummary(String phone);
    Result<List<Map<String, Object>>> getParentConsumption(String yearMonth, String phone);
    Result<Map<String, Object>> simulateRecharge(java.math.BigDecimal amount, String phone);
}


