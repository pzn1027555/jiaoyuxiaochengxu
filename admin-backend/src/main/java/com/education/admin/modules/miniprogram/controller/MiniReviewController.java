package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/review")
public class MiniReviewController {

    @Autowired
    private MiniReviewService reviewService;

    /**
     * 检查订单是否已评价
     */
    @GetMapping("/check/{orderId}")
    public Result<Map<String, Object>> checkReviewStatus(@PathVariable Long orderId) {
        log.info("检查订单评价状态, orderId: {}", orderId);
        return reviewService.checkReviewStatus(orderId);
    }

    /**
     * 提交评价
     */
    @PostMapping("/submit")
    public Result<String> submitReview(@RequestBody Map<String, Object> params) {
        log.info("提交评价, params: {}", params);
        return reviewService.submitReview(params);
    }

    /**
     * 获取订单评价详情（当前学生）
     */
    @GetMapping("/detail/{orderId}")
    public Result<java.util.Map<String, Object>> detail(@PathVariable Long orderId) {
        log.info("获取订单评价详情, orderId: {}", orderId);
        return reviewService.getReviewDetail(orderId);
    }
}
