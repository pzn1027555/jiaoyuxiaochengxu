package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface MiniReviewService {
    
    /**
     * 检查订单是否已评价
     */
    Result<Map<String, Object>> checkReviewStatus(Long orderId);
    
    /**
     * 提交评价
     */
    Result<String> submitReview(Map<String, Object> params);

    /**
     * 获取订单评价详情（当前学生）
     */
    Result<Map<String, Object>> getReviewDetail(Long orderId);
}
