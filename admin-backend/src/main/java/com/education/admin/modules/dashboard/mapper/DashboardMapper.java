package com.education.admin.modules.dashboard.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘数据查询Mapper
 */
@Mapper
public interface DashboardMapper {

    /**
     * 获取用户统计数据
     */
    Map<String, Object> getUserStatistics();

    /**
     * 获取订单统计数据
     */
    Map<String, Object> getOrderStatistics();

    /**
     * 获取课程统计数据
     */
    Map<String, Object> getCourseStatistics();

    /**
     * 获取今日实时数据
     */
    Map<String, Object> getRealtimeData();

    /**
     * 获取用户增长趋势数据
     */
    List<Map<String, Object>> getUserGrowthTrend(@Param("startDate") String startDate,
                                                 @Param("endDate") String endDate);

    /**
     * 获取收入趋势数据
     */
    List<Map<String, Object>> getRevenueTrend(@Param("startDate") String startDate,
                                              @Param("endDate") String endDate);

    /**
     * 获取地区分布数据
     */
    List<Map<String, Object>> getRegionDistribution();

    /**
     * 获取城市渗透率分析数据
     */
    List<Map<String, Object>> getCityPenetrationAnalysis();

    /**
     * 获取教师审核面板数据
     */
    Map<String, Object> getTeacherAuditPanelData();

    /**
     * 获取投诉面板数据
     */
    Map<String, Object> getComplaintPanelData();

    /**
     * 获取课程销售排行
     */
    List<Map<String, Object>> getCourseRanking(@Param("limit") int limit);

    /**
     * 获取教师排行
     */
    List<Map<String, Object>> getTeacherRanking(@Param("limit") int limit);

    /**
     * 获取学生等级分布
     */
    List<Map<String, Object>> getStudentLevelDistribution();

    /**
     * 获取客单价趋势
     */
    List<Map<String, Object>> getOrderAmountTrend(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * 获取今日新用户数
     */
    int getTodayNewUsers();

    /**
     * 获取今日新订单数
     */
    int getTodayNewOrders();

    /**
     * 获取今日收入
     */
    BigDecimal getTodayRevenue();

    /**
     * 获取在线用户数（模拟数据，实际需要WebSocket或缓存实现）
     */
    int getOnlineUsers();

    /**
     * 获取待审核教师列表
     */
    List<Map<String, Object>> getPendingTeachers();

    /**
     * 获取最近投诉列表
     */
    List<Map<String, Object>> getRecentComplaints();

    /**
     * 获取平均处理时间
     */
    BigDecimal getAvgProcessTime();

    /**
     * 获取平均响应时间
     */
    BigDecimal getAvgResponseTime();
}
