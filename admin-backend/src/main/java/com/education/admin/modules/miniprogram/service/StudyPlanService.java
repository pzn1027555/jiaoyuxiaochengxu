package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import java.util.Map;

public interface StudyPlanService {
    
    /**
     * 创建学习计划
     */
    Result<Object> createPlan(Map<String, Object> payload);
    
    /**
     * 获取学习计划详情
     */
    Result<Object> getPlanDetail(Long planId);
    
    /**
     * 获取学生的学习计划列表
     */
    Result<Object> getStudentPlans(Long studentId);
    
    /**
     * 学生确认学习计划并生成订单
     */
    Result<Object> confirmPlanAndCreateOrder(Long planId);
    
    /**
     * 更新学习计划确认状态
     */
    Result<Object> updatePlanStatus(Long planId, String status, Long orderId);
}
