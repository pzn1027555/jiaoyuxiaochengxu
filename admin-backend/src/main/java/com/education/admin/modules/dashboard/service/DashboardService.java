package com.education.admin.modules.dashboard.service;

import com.education.admin.common.Result;
import java.util.Map;

/**
 * 仪表盘服务接口
 */
public interface DashboardService {

    /**
     * 获取仪表盘统计数据
     */
    Result<Map<String, Object>> getStatistics();

    /**
     * 获取实时数据看板
     */
    Result<Map<String, Object>> getRealtimeData();

    /**
     * 获取用户增长趋势
     */
    Result<Map<String, Object>> getUserGrowthTrend(String startDate, String endDate);

    /**
     * 获取收入趋势
     */
    Result<Map<String, Object>> getRevenueTrend(String startDate, String endDate);

    /**
     * 获取地区分布数据
     */
    Result<java.util.List<Map<String, Object>>> getRegionDistribution();

    /**
     * 获取城市渗透率分析
     */
    Result<Map<String, Object>> getCityPenetrationAnalysis();

    /**
     * 获取教师审核面板数据
     */
    Result<Map<String, Object>> getTeacherAuditPanelData();

    /**
     * 获取投诉处理面板数据
     */
    Result<Map<String, Object>> getComplaintPanelData();

    /**
     * 获取课程销售排行
     */
    Result<java.util.List<Map<String, Object>>> getCourseRanking(int limit);

    /**
     * 获取教师排行
     */
    Result<java.util.List<Map<String, Object>>> getTeacherRanking(int limit);

    /**
     * 获取学生等级分布
     */
    Result<java.util.List<Map<String, Object>>> getStudentLevelDistribution();

    /**
     * 获取客单价趋势
     */
    Result<Map<String, Object>> getOrderAmountTrend(String startDate, String endDate);
}
