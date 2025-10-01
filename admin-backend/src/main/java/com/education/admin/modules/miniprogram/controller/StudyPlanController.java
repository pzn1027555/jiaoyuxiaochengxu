package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.StudyPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/study-plan")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    /**
     * 创建学习计划
     */
    @PostMapping("/create")
    public Result<Object> createPlan(@RequestBody Map<String, Object> payload) {
        return studyPlanService.createPlan(payload);
    }

    /**
     * 获取学习计划详情
     */
    @GetMapping("/{planId}")
    public Result<Object> getPlanDetail(@PathVariable Long planId) {
        return studyPlanService.getPlanDetail(planId);
    }

    /**
     * 获取学生的学习计划列表
     */
    @GetMapping("/student/{studentId}")
    public Result<Object> getStudentPlans(@PathVariable Long studentId) {
        return studyPlanService.getStudentPlans(studentId);
    }

    /**
     * 学生确认学习计划并生成订单
     */
    @PostMapping("/{planId}/confirm")
    public Result<Object> confirmPlanAndCreateOrder(@PathVariable Long planId) {
        return studyPlanService.confirmPlanAndCreateOrder(planId);
    }

    /**
     * 更新学习计划确认状态
     */
    @PutMapping("/{planId}/status")
    public Result<Object> updatePlanStatus(@PathVariable Long planId, @RequestBody Map<String, Object> payload) {
        String status = (String) payload.get("status");
        Long orderId = payload.get("orderId") != null ? 
                      Long.valueOf(String.valueOf(payload.get("orderId"))) : null;
        return studyPlanService.updatePlanStatus(planId, status, orderId);
    }
}
