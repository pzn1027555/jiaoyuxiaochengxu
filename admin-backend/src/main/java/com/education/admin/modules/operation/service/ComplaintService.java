package com.education.admin.modules.operation.service;

import com.education.admin.common.Result;
import java.util.Map;

/**
 * 投诉管理服务接口
 */
public interface ComplaintService {

    /**
     * 获取投诉列表
     */
    Result<Map<String, Object>> getComplaintList(Map<String, Object> params);

    /**
     * 获取投诉详情
     */
    Result<Map<String, Object>> getComplaintDetail(Long id);

    /**
     * 处理投诉
     */
    Result<Void> processComplaint(Long id, Map<String, Object> data);

    /**
     * 更新投诉状态
     */
    Result<Void> updateComplaintStatus(Long id, Integer status);

    /**
     * 批量更新投诉状态
     */
    Result<Void> batchUpdateComplaintStatus(String complaintIds, Integer status);

    /**
     * 获取待处理投诉列表
     */
    Result<Map<String, Object>> getPendingComplaints(Integer limit);

    /**
     * 获取今日新增投诉列表
     */
    Result<Map<String, Object>> getTodayComplaints();

    /**
     * 获取投诉统计数据
     */
    Result<Map<String, Object>> getComplaintStatistics();
}
