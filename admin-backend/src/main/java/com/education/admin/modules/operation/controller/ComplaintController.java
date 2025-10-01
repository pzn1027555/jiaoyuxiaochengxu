package com.education.admin.modules.operation.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.operation.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 投诉管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/operation/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    /**
     * 获取投诉列表
     */
    @GetMapping
    public Result<Map<String, Object>> getComplaintList(
            @RequestParam Map<String, Object> params) {
        return complaintService.getComplaintList(params);
    }

    /**
     * 获取投诉详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getComplaintDetail(@PathVariable Long id) {
        return complaintService.getComplaintDetail(id);
    }

    /**
     * 处理投诉
     */
    @PostMapping("/{id}/process")
    public Result<Void> processComplaint(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return complaintService.processComplaint(id, data);
    }

    /**
     * 更新投诉状态
     */
    @PostMapping("/{id}/status")
    public Result<Void> updateComplaintStatus(@PathVariable Long id, @RequestParam Integer status) {
        return complaintService.updateComplaintStatus(id, status);
    }

    /**
     * 批量更新投诉状态
     */
    @PostMapping("/batch-status")
    public Result<Void> batchUpdateComplaintStatus(@RequestBody Map<String, Object> params) {
        String complaintIds = (String) params.get("complaintIds");
        Integer status = (Integer) params.get("status");
        return complaintService.batchUpdateComplaintStatus(complaintIds, status);
    }

    /**
     * 获取待处理投诉列表
     */
    @GetMapping("/pending")
    public Result<Map<String, Object>> getPendingComplaints(@RequestParam(defaultValue = "10") Integer limit) {
        return complaintService.getPendingComplaints(limit);
    }

    /**
     * 获取今日新增投诉列表
     */
    @GetMapping("/today")
    public Result<Map<String, Object>> getTodayComplaints() {
        return complaintService.getTodayComplaints();
    }

    /**
     * 解决投诉（更新状态为已解决）
     */
    @PostMapping("/{id}/resolve")
    public Result<Void> resolveComplaint(@PathVariable Long id) {
        return complaintService.updateComplaintStatus(id, 2);
    }

    /**
     * 获取投诉统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getComplaintStatistics() {
        return complaintService.getComplaintStatistics();
    }
}
