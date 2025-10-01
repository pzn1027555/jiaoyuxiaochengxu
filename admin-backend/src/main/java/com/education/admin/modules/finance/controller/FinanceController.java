package com.education.admin.modules.finance.controller;

import com.education.admin.common.Result;
import com.github.pagehelper.PageInfo;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 财务管理控制器
 */
@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.finance.mapper.FinanceOrderMapper financeOrderMapper;
    
    /**
     * 分页查询订单列表
     */
    @PostMapping("/orders/list")
    public Result<PageInfo<Map<String, Object>>> getOrderList(@RequestBody Map<String, Object> params) {
        String orderNo = params.get("orderNo") == null ? null : String.valueOf(params.get("orderNo"));
        String studentName = params.get("studentName") == null ? null : String.valueOf(params.get("studentName"));
        Integer orderStatus = null;
        try {
            if (params.get("orderStatus") != null && !String.valueOf(params.get("orderStatus")).isEmpty()) {
                orderStatus = Integer.valueOf(String.valueOf(params.get("orderStatus")));
            }
        } catch (Exception ignored) {}

        int pageNum = params.get("pageNum") == null ? 1 : Integer.parseInt(String.valueOf(params.get("pageNum")));
        int pageSize = params.get("pageSize") == null ? 20 : Integer.parseInt(String.valueOf(params.get("pageSize")));

        com.github.pagehelper.PageHelper.startPage(pageNum, pageSize);
        List<Map<String, Object>> rows = financeOrderMapper.findOrders(orderNo, studentName, orderStatus);
        PageInfo<Map<String, Object>> pageInfo = new PageInfo<>(rows);
        pageInfo.setPageNum(pageNum);
        pageInfo.setPageSize(pageSize);
        return Result.success(pageInfo);
    }
    
    // 订单统计数据已迁移到 FinanceStatisticsController.get /api/finance/statistics/orders
    
    /**
     * 获取订单详情
     */
    @GetMapping("/orders/{id}")
    public Result<Map<String, Object>> getOrderDetail(@PathVariable Long id) {
        Map<String, Object> order = new HashMap<>();
        
        order.put("id", id);
        order.put("orderNo", "ORD" + String.format("%08d", id));
        order.put("studentName", "张三");
        order.put("studentPhone", "13800138000");
        order.put("courseName", "高等数学基础课程");
        order.put("teacherName", "李老师");
        order.put("originalAmount", new BigDecimal("299.00"));
        order.put("discountAmount", new BigDecimal("29.90"));
        order.put("actualAmount", new BigDecimal("269.10"));
        order.put("status", "已支付");
        order.put("paymentMethod", "微信支付");
        order.put("transactionId", "4200001234567890123456789");
        order.put("createTime", LocalDateTime.now().minusDays(1));
        order.put("payTime", LocalDateTime.now().minusDays(1));
        order.put("remark", "学生备注信息");
        
        return Result.success(order);
    }
    
    /**
     * 退款处理
     */
    @PostMapping("/orders/{id}/refund")
    public Result<Void> refundOrder(@PathVariable Long id, @RequestBody Map<String, Object> refundData) {
        try {
            // 这里应该调用服务层方法处理退款
            return Result.success();
        } catch (Exception e) {
            return Result.error("退款处理失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取财务报表数据
     */
    @GetMapping("/reports/summary")
    public Result<Map<String, Object>> getFinancialSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> data = new HashMap<>();
        
        // 收入数据
        Map<String, Object> revenue = new HashMap<>();
        revenue.put("total", new BigDecimal("125670.50"));
        revenue.put("courseRevenue", new BigDecimal("98500.00"));
        revenue.put("materialRevenue", new BigDecimal("27170.50"));
        revenue.put("growthRate", 12.5);
        
        // 支出数据
        Map<String, Object> expense = new HashMap<>();
        expense.put("total", new BigDecimal("45600.00"));
        expense.put("teacherCommission", new BigDecimal("35000.00"));
        expense.put("platformCost", new BigDecimal("8600.00"));
        expense.put("otherCost", new BigDecimal("2000.00"));
        
        // 利润数据
        Map<String, Object> profit = new HashMap<>();
        profit.put("total", new BigDecimal("80070.50"));
        profit.put("margin", 63.7);
        profit.put("growthRate", 8.3);
        
        data.put("revenue", revenue);
        data.put("expense", expense);
        data.put("profit", profit);
        data.put("reportDate", LocalDateTime.now());
        
        return Result.success(data);
    }
    
    /**
     * 获取收入趋势数据
     */
    @GetMapping("/reports/trend")
    public Result<List<Map<String, Object>>> getRevenueTrend(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<Map<String, Object>> trendData = new ArrayList<>();
        
        // 模拟30天的收入趋势
        for (int i = 0; i < 30; i++) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", "2025-01-" + String.format("%02d", i + 1));
            dayData.put("revenue", new BigDecimal(String.valueOf(Math.random() * 5000 + 1000)).setScale(2, BigDecimal.ROUND_HALF_UP));
            dayData.put("orderCount", (int)(Math.random() * 50) + 10);
            dayData.put("refundAmount", new BigDecimal(String.valueOf(Math.random() * 200)).setScale(2, BigDecimal.ROUND_HALF_UP));
            trendData.add(dayData);
        }
        
        return Result.success(trendData);
    }
    
    /**
     * 导出财务报表
     */
    @GetMapping("/reports/export")
    public Result<Map<String, Object>> exportFinancialReport(
            @RequestParam String reportType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Map<String, Object> data = new HashMap<>();
        data.put("exportUrl", "/downloads/financial_report_" + System.currentTimeMillis() + ".xlsx");
        data.put("fileName", "财务报表_" + reportType + ".xlsx");
        data.put("status", "success");
        
        return Result.success(data);
    }
}