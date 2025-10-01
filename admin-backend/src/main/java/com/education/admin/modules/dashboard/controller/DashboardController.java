package com.education.admin.modules.dashboard.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 仪表盘控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    
    /**
     * 获取仪表盘统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        return dashboardService.getStatistics();
    }
    
    /**
     * 获取实时数据看板
     */
    @GetMapping("/realtime")
    public Result<Map<String, Object>> getRealtimeData() {
        return dashboardService.getRealtimeData();
    }
    
    /**
     * 获取用户增长趋势
     */
    @GetMapping("/trend/user-growth")
    public Result<Map<String, Object>> getUserGrowthTrend(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return dashboardService.getUserGrowthTrend(startDate, endDate);
    }
    
    /**
     * 获取收入趋势
     */
    @GetMapping("/trend/revenue")
    public Result<Map<String, Object>> getRevenueTrend(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return dashboardService.getRevenueTrend(startDate, endDate);
    }

    /**
     * 获取客单价趋势
     */
    @GetMapping("/trend/order-amount")
    public Result<Map<String, Object>> getOrderAmountTrend(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return dashboardService.getOrderAmountTrend(startDate, endDate);
    }
    
    /**
     * 获取地区分布数据
     */
    @GetMapping("/distribution/region")
    public Result<List<Map<String, Object>>> getRegionDistribution() {
        return dashboardService.getRegionDistribution();
    }
    
    /**
     * 获取学生等级分布
     */
    @GetMapping("/distribution/student-level")
    public Result<List<Map<String, Object>>> getStudentLevelDistribution() {
        return dashboardService.getStudentLevelDistribution();
    }
    
    /**
     * 获取城市渗透率分析
     */
    @GetMapping("/analysis/city-penetration")
    public Result<Map<String, Object>> getCityPenetrationAnalysis() {
        return dashboardService.getCityPenetrationAnalysis();
    }
    
    /**
     * 获取教师审核面板数据
     */
    @GetMapping("/panel/teacher-audit")
    public Result<Map<String, Object>> getTeacherAuditPanelData() {
        return dashboardService.getTeacherAuditPanelData();
    }
    
    /**
     * 获取投诉面板数据
     */
    @GetMapping("/panel/complaint")
    public Result<Map<String, Object>> getComplaintPanelData() {
        return dashboardService.getComplaintPanelData();
    }
    
    /**
     * 获取课程排行榜
     */
    @GetMapping("/ranking/course")
    public Result<List<Map<String, Object>>> getCourseRanking(@RequestParam(defaultValue = "10") int limit) {
        return dashboardService.getCourseRanking(limit);
    }
    
    /**
     * 获取教师排行榜
     */
    @GetMapping("/ranking/teacher")
    public Result<List<Map<String, Object>>> getTeacherRanking(@RequestParam(defaultValue = "10") int limit) {
        return dashboardService.getTeacherRanking(limit);
    }
}