package com.education.admin.modules.finance.controller;

import com.education.admin.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/finance/statistics", "/finance/statistics"})
@RequiredArgsConstructor
public class FinanceStatisticsController {

    private final com.education.admin.modules.finance.mapper.FinanceStatisticsMapper financeStatisticsMapper;

    /** 订单统计：用于财务统计页或订单页概览 */
    @GetMapping("/orders")
    public Result<java.util.Map<String,Object>> orderStatistics(){
        java.util.Map<String,Object> data = financeStatisticsMapper.getOrderStatistics();
        if (data == null) data = new java.util.HashMap<>();
        // 兜底为 0，防止前端展示 NaN/undefined
        data.putIfAbsent("totalRevenue", java.math.BigDecimal.ZERO);
        data.putIfAbsent("todayRevenue", java.math.BigDecimal.ZERO);
        data.putIfAbsent("averageOrderValue", java.math.BigDecimal.ZERO);
        data.putIfAbsent("totalOrders", 0);
        data.putIfAbsent("todayOrders", 0);
        data.putIfAbsent("completedOrders", 0);
        data.putIfAbsent("refundOrders", 0);
        data.putIfAbsent("pendingOrders", 0);
        // recent orders for page cards/table
        java.util.List<java.util.Map<String,Object>> recent = financeStatisticsMapper.getRecentOrders(20);
        data.put("recentOrders", recent == null ? java.util.Collections.emptyList() : recent);
        return Result.success(data);
    }

    /**
     * 财务统计页 - 核心指标
     * 对应前端：GET /finance/statistics
     */
    @GetMapping("")
    public Result<java.util.Map<String, Object>> financialStatistics(){
        java.util.Map<String,Object> data = financeStatisticsMapper.getFinancialSummary();
        if (data == null) data = new java.util.HashMap<>();
        data.putIfAbsent("totalRevenue", java.math.BigDecimal.ZERO);
        data.putIfAbsent("todayRevenue", java.math.BigDecimal.ZERO);
        data.putIfAbsent("paymentSuccessRate", java.math.BigDecimal.ZERO);
        data.putIfAbsent("avgOrderAmount", java.math.BigDecimal.ZERO);
        data.putIfAbsent("refundRate", java.math.BigDecimal.ZERO);
        data.putIfAbsent("totalRefundAmount", java.math.BigDecimal.ZERO);
        data.putIfAbsent("totalOrders", 0);
        data.putIfAbsent("todayOrders", 0);
        return Result.success(data);
    }

    /** 支付方式分布 */
    @GetMapping("/payment-methods")
    public Result<java.util.List<java.util.Map<String,Object>>> paymentMethodDistribution(){
        java.util.List<java.util.Map<String,Object>> list = financeStatisticsMapper.getPaymentMethodDistribution();
        return Result.success(list == null ? java.util.Collections.emptyList() : list);
    }

    /** 课程类型收入分布 */
    @GetMapping("/course-types")
    public Result<java.util.List<java.util.Map<String,Object>>> courseTypeRevenue(){
        java.util.List<java.util.Map<String,Object>> list = financeStatisticsMapper.getCourseTypeRevenue();
        return Result.success(list == null ? java.util.Collections.emptyList() : list);
    }

    /** 教师收入排行 */
    @GetMapping("/teacher-revenue-ranking")
    public Result<java.util.List<java.util.Map<String,Object>>> teacherRevenueRanking(@org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") Integer limit){
        java.util.List<java.util.Map<String,Object>> list = financeStatisticsMapper.getTeacherRevenueRanking(limit);
        return Result.success(list == null ? java.util.Collections.emptyList() : list);
    }

    /** 学生消费排行 */
    @GetMapping("/student-consumption-ranking")
    public Result<java.util.List<java.util.Map<String,Object>>> studentConsumptionRanking(@org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") Integer limit){
        java.util.List<java.util.Map<String,Object>> list = financeStatisticsMapper.getStudentConsumptionRanking(limit);
        return Result.success(list == null ? java.util.Collections.emptyList() : list);
    }
}


