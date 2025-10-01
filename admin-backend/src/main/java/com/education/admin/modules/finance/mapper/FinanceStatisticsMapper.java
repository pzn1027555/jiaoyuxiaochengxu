package com.education.admin.modules.finance.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FinanceStatisticsMapper {

    /**
     * 返回字段：
     * totalRevenue, todayRevenue, averageOrderValue,
     * totalOrders, todayOrders, completedOrders, refundOrders, pendingOrders
     */
    java.util.Map<String,Object> getOrderStatistics();

    java.util.List<java.util.Map<String,Object>> getRecentOrders(@org.apache.ibatis.annotations.Param("limit") Integer limit);

    /** 财务统计页-核心汇总卡片 */
    java.util.Map<String, Object> getFinancialSummary();

    /** 支付方式分布 */
    java.util.List<java.util.Map<String, Object>> getPaymentMethodDistribution();

    /** 课程类型收入分布 */
    java.util.List<java.util.Map<String, Object>> getCourseTypeRevenue();

    /** 教师收入排行 */
    java.util.List<java.util.Map<String, Object>> getTeacherRevenueRanking(@org.apache.ibatis.annotations.Param("limit") Integer limit);

    /** 学生消费排行 */
    java.util.List<java.util.Map<String, Object>> getStudentConsumptionRanking(@org.apache.ibatis.annotations.Param("limit") Integer limit);
}


