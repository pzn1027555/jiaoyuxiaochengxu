package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/account")
@RequiredArgsConstructor
public class MiniAccountController {

    private final MiniAccountService miniAccountService;

    /** 家长余额汇总 */
    @GetMapping("/parent/summary")
    public Result<Map<String, Object>> getParentBalanceSummary(
            @RequestParam(value = "phone", required = false) String phone
    ){
        return miniAccountService.getParentBalanceSummary(phone);
    }

    /** 家长消费记录（按月） */
    @GetMapping("/parent/consumption")
    public Result<List<Map<String, Object>>> getParentConsumption(
            @RequestParam(value = "yearMonth", required = false) String yearMonth,
            @RequestParam(value = "phone", required = false) String phone
    ){
        return miniAccountService.getParentConsumption(yearMonth, phone);
    }

    /** 家长充值（模拟） */
    @PostMapping("/parent/recharge/simulate")
    public Result<Map<String, Object>> simulateRecharge(@RequestBody Map<String, Object> body){
        java.math.BigDecimal amount = null;
        try{ amount = new java.math.BigDecimal(String.valueOf(body.get("amount"))); }catch(Exception ignored){}
        String phone = body.get("phone") == null ? null : String.valueOf(body.get("phone"));
        return miniAccountService.simulateRecharge(amount, phone);
    }
}


