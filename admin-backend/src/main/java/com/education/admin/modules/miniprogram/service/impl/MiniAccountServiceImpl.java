package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniAccountService;
import com.education.admin.modules.parent.entity.Parent;
import com.education.admin.modules.parent.mapper.ParentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniAccountServiceImpl implements MiniAccountService {

    private final ParentMapper parentMapper;
    private final com.education.admin.modules.miniprogram.mapper.ParentAccountMapper parentAccountMapper;

    @Override
    public Result<Map<String, Object>> getParentBalanceSummary(String phone) {
        try {
            String p = phone != null && !phone.isEmpty() ? phone : getCurrentUserPhone();
            Parent parent = parentMapper.findByPhone(p);
            if (parent == null) return Result.error("家长信息不存在");

            BigDecimal balance = parentAccountMapper.getBalanceByParentId(parent.getId());
            BigDecimal totalConsumed = parentAccountMapper.getTotalConsumedByParentId(parent.getId());

            Map<String, Object> data = new HashMap<>();
            data.put("available", balance == null ? BigDecimal.ZERO : balance);
            data.put("totalConsumed", totalConsumed == null ? BigDecimal.ZERO : totalConsumed);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取家长余额汇总失败", e);
            return Result.error("获取失败");
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getParentConsumption(String yearMonth, String phone) {
        try {
            String p = phone != null && !phone.isEmpty() ? phone : getCurrentUserPhone();
            Parent parent = parentMapper.findByPhone(p);
            if (parent == null) return Result.error("家长信息不存在");

            String ym = (yearMonth == null || yearMonth.isEmpty()) ? LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")) : yearMonth;
            List<Map<String, Object>> records = parentAccountMapper.findMonthlyConsumption(parent.getId(), ym + "-01", ym + "-31");
            return Result.success(records);
        } catch (Exception e) {
            log.error("获取家长消费记录失败", e);
            return Result.error("获取失败");
        }
    }

    @Override
    public Result<Map<String, Object>> simulateRecharge(java.math.BigDecimal amount, String phone) {
        try{
            if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return Result.error("金额无效");
            }
            String p = phone != null && !phone.isEmpty() ? phone : getCurrentUserPhone();
            Parent parent = parentMapper.findByPhone(p);
            if (parent == null) return Result.error("家长信息不存在");

            // 写入充值流水并更新余额
            int inserted = parentAccountMapper.insertRecharge(parent.getId(), amount, "微信充值");
            int updated = parentAccountMapper.addBalance(parent.getId(), amount);
            if (inserted > 0 && updated > 0){
                Map<String,Object> data = new HashMap<>();
                data.put("success", true);
                return Result.success(data);
            }
            return Result.error("充值失败");
        }catch(Exception e){
            log.error("模拟充值失败", e);
            return Result.error("充值失败");
        }
    }

    private String getCurrentUserPhone() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getParameter("phone");
            if (phone != null && !phone.isEmpty()) return phone;
            String headerPhone = request.getHeader("X-User-Phone");
            if (headerPhone != null && !headerPhone.isEmpty()) return headerPhone;
            return "18071403141";
        } catch (Exception e) {
            return "18071403141";
        }
    }
}


