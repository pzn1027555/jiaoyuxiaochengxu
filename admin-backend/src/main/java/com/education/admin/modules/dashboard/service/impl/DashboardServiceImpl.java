package com.education.admin.modules.dashboard.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.dashboard.mapper.DashboardMapper;
import com.education.admin.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 仪表盘服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardMapper dashboardMapper;

    @Override
    public Result<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> userStats = dashboardMapper.getUserStatistics();
            Map<String, Object> orderStats = dashboardMapper.getOrderStatistics();
            Map<String, Object> courseStats = dashboardMapper.getCourseStatistics();

            Map<String, Object> statistics = new HashMap<>();
            statistics.putAll(userStats);
            statistics.putAll(orderStats);
            statistics.putAll(courseStats);

            // 暂时不提供增长率数据，等待历史数据积累

            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getRealtimeData() {
        try {
            int todayNewUsers = dashboardMapper.getTodayNewUsers();
            int todayNewOrders = dashboardMapper.getTodayNewOrders();
            BigDecimal todayRevenue = dashboardMapper.getTodayRevenue();

            Map<String, Object> data = new HashMap<>();
            data.put("todayNewUsers", todayNewUsers);
            data.put("todayOrders", todayNewOrders);
            data.put("todayRevenue", todayRevenue != null ? todayRevenue.doubleValue() : 0.0);

            return Result.success(data);
        } catch (Exception e) {
            log.error("获取实时数据失败", e);
            return Result.error("获取实时数据失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getUserGrowthTrend(String startDate, String endDate) {
        try {
            List<Map<String, Object>> trendData = dashboardMapper.getUserGrowthTrend(startDate, endDate);

            // 手动计算累计用户数
            int cumulativeTotal = 0;
            for (Map<String, Object> item : trendData) {
                cumulativeTotal += ((Number) item.get("newUsers")).intValue();
                item.put("totalUsers", cumulativeTotal);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("trend", trendData);

            // 计算汇总数据
            if (!trendData.isEmpty()) {
                int totalGrowth = cumulativeTotal;

                int averageDaily = trendData.stream()
                    .mapToInt(item -> ((Number) item.get("newUsers")).intValue())
                    .sum() / Math.max(trendData.size(), 1);

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalGrowth", totalGrowth);
                summary.put("averageDaily", averageDaily);
                result.put("summary", summary);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取用户增长趋势失败", e);
            return Result.error("获取用户增长趋势失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getRevenueTrend(String startDate, String endDate) {
        try {
            List<Map<String, Object>> trendData = dashboardMapper.getRevenueTrend(startDate, endDate);

            Map<String, Object> result = new HashMap<>();
            result.put("trend", trendData);

            // 计算汇总数据
            if (!trendData.isEmpty()) {
                double totalRevenue = trendData.stream()
                    .mapToDouble(item -> ((Number) item.get("revenue")).doubleValue())
                    .sum();

                int totalOrders = trendData.stream()
                    .mapToInt(item -> ((Number) item.get("orders")).intValue())
                    .sum();

                double averageDaily = totalRevenue / Math.max(trendData.size(), 1);

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalRevenue", totalRevenue);
                summary.put("averageDaily", averageDaily);
                result.put("summary", summary);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取收入趋势失败", e);
            return Result.error("获取收入趋势失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getRegionDistribution() {
        try {
            List<Map<String, Object>> data = dashboardMapper.getRegionDistribution();
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取地区分布数据失败", e);
            return Result.success(new ArrayList<>()); // 返回空数据而不是错误
        }
    }

    @Override
    public Result<Map<String, Object>> getCityPenetrationAnalysis() {
        try {
            List<Map<String, Object>> cities = dashboardMapper.getCityPenetrationAnalysis();

            Map<String, Object> result = new HashMap<>();
            result.put("cities", cities);

            // 计算汇总数据
            if (!cities.isEmpty()) {
                double averagePenetration = cities.stream()
                    .mapToDouble(city -> ((Number) city.get("penetrationRate")).doubleValue())
                    .average()
                    .orElse(0.0);

                String topCity = (String) cities.get(0).get("city");
                int maxUserCount = ((Number) cities.get(0).get("userCount")).intValue();

                Map<String, Object> summary = new HashMap<>();
                summary.put("averagePenetration", averagePenetration);
                summary.put("topCity", topCity);
                summary.put("maxUserCount", maxUserCount);
                summary.put("growthPotential", maxUserCount > 100 ? "高" : maxUserCount > 50 ? "中" : "低");
                result.put("summary", summary);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取城市渗透率分析失败", e);
            return Result.error("获取城市渗透率分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getTeacherAuditPanelData() {
        try {
            return Result.success(getTeacherAuditPanelDetails());
        } catch (Exception e) {
            log.error("获取教师审核面板数据失败", e);
            return Result.error("获取教师审核面板数据失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getComplaintPanelData() {
        try {
            return Result.success(getComplaintPanelDetails());
        } catch (Exception e) {
            log.error("获取投诉面板数据失败", e);
            return Result.error("获取投诉面板数据失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getCourseRanking(int limit) {
        try {
            List<Map<String, Object>> data = dashboardMapper.getCourseRanking(limit);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取课程排行数据失败", e);
            return Result.success(new ArrayList<>()); // 返回空数据而不是错误
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getTeacherRanking(int limit) {
        try {
            List<Map<String, Object>> data = dashboardMapper.getTeacherRanking(limit);
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取教师排行数据失败", e);
            return Result.success(new ArrayList<>()); // 返回空数据而不是错误
        }
    }

    @Override
    public Result<List<Map<String, Object>>> getStudentLevelDistribution() {
        try {
            List<Map<String, Object>> data = dashboardMapper.getStudentLevelDistribution();

            // 计算百分比
            int total = data.stream()
                .mapToInt(item -> ((Number) item.get("count")).intValue())
                .sum();

            for (Map<String, Object> item : data) {
                int count = ((Number) item.get("count")).intValue();
                double percentage = total > 0 ? (double) count / total : 0;
                item.put("percentage", Math.round(percentage * 10000) / 100.0); // 保留两位小数
            }

            return Result.success(data);
        } catch (Exception e) {
            log.error("获取学生等级分布失败", e);
            return Result.success(new ArrayList<>()); // 返回空数据而不是错误
        }
    }

    @Override
    public Result<Map<String, Object>> getOrderAmountTrend(String startDate, String endDate) {
        try {
            List<Map<String, Object>> trendData = dashboardMapper.getOrderAmountTrend(startDate, endDate);

            Map<String, Object> result = new HashMap<>();
            result.put("trend", trendData);

            // 计算汇总数据
            if (!trendData.isEmpty()) {
                double totalAmount = trendData.stream()
                    .mapToDouble(item -> ((Number) item.get("totalAmount")).doubleValue())
                    .sum();

                int totalOrders = trendData.stream()
                    .mapToInt(item -> ((Number) item.get("orderCount")).intValue())
                    .sum();

                double averageAmount = totalOrders > 0 ? totalAmount / totalOrders : 0.0;
                double averageDaily = totalAmount / Math.max(trendData.size(), 1);

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalAmount", totalAmount);
                summary.put("totalOrders", totalOrders);
                summary.put("averageAmount", averageAmount);
                summary.put("averageDaily", averageDaily);
                result.put("summary", summary);
            }

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取客单价趋势失败", e);
            return Result.error("获取客单价趋势失败: " + e.getMessage());
        }
    }

    // 以下方法用于获取面板详细数据，在Service层实现业务逻辑
    private Map<String, Object> getTeacherAuditPanelDetails() {
        try {
            Map<String, Object> panelData = dashboardMapper.getTeacherAuditPanelData();
            List<Map<String, Object>> pendingTeachers = dashboardMapper.getPendingTeachers();
            BigDecimal avgProcessTime = dashboardMapper.getAvgProcessTime();

            panelData.put("pendingTeachers", pendingTeachers);
            panelData.put("avgProcessTime", avgProcessTime != null ? avgProcessTime.doubleValue() : 0.0);

            return panelData;
        } catch (Exception e) {
            log.error("获取教师审核面板详细数据失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("pendingAuditCount", 0);
            result.put("riskTeacherCount", 0);
            result.put("newApplications", 0);
            result.put("auditedToday", 0);
            result.put("rejectedToday", 0);
            result.put("pendingTeachers", new ArrayList<>());
            result.put("avgProcessTime", 0.0);
            return result;
        }
    }

    private Map<String, Object> getComplaintPanelDetails() {
        try {
            Map<String, Object> panelData = dashboardMapper.getComplaintPanelData();
            List<Map<String, Object>> recentComplaints = dashboardMapper.getRecentComplaints();
            BigDecimal avgResponseTime = dashboardMapper.getAvgResponseTime();

            panelData.put("recentComplaints", recentComplaints);
            panelData.put("avgResponseTime", avgResponseTime != null ? avgResponseTime.doubleValue() : 0.0);

            return panelData;
        } catch (Exception e) {
            log.error("获取投诉面板详细数据失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("pendingComplaints", 0);
            result.put("processingComplaints", 0);
            result.put("todayComplaints", 0);
            result.put("totalComplaints", 0);
            result.put("resolvedToday", 0);
            result.put("recentComplaints", new ArrayList<>());
            result.put("avgResponseTime", 0.0);
            return result;
        }
    }
}
