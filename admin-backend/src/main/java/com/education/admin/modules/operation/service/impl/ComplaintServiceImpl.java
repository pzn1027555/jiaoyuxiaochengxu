package com.education.admin.modules.operation.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.operation.mapper.ComplaintMapper;
import com.education.admin.modules.operation.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 投诉管理服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintMapper complaintMapper;

    @Override
    public Result<Map<String, Object>> getComplaintList(Map<String, Object> params) {
        try {
            // 将page参数转换为offset
            Integer page = null;
            Integer size = null;
            Object pageObj = params.get("page");
            Object sizeObj = params.get("size");

            if (pageObj != null) {
                page = Integer.parseInt(pageObj.toString());
            }
            if (sizeObj != null) {
                size = Integer.parseInt(sizeObj.toString());
            }

            // 设置默认分页参数并确保为整数类型
            if (page == null || page < 1) {
                page = 1;
            }
            if (size == null || size < 1) {
                size = 10;
            }

            int offset = (page - 1) * size;
            params.put("offset", offset);
            params.put("size", size);
            params.put("pageSize", size);

            List<Map<String, Object>> complaints = complaintMapper.getComplaintList(params);
            int total = complaintMapper.getComplaintCount(params);

            Map<String, Object> result = new HashMap<>();
            result.put("items", complaints);
            result.put("total", total);

            return Result.success(result);
        } catch (Exception e) {
            log.error("获取投诉列表失败", e);
            return Result.error("获取投诉列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getComplaintDetail(Long id) {
        try {
            Map<String, Object> complaint = complaintMapper.getComplaintDetail(id);
            if (complaint == null) {
                return Result.error("投诉不存在");
            }
            return Result.success(complaint);
        } catch (Exception e) {
            log.error("获取投诉详情失败", e);
            return Result.error("获取投诉详情失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Void> processComplaint(Long id, Map<String, Object> data) {
        try {
            // 更新投诉状态为处理中
            complaintMapper.updateComplaintStatus(id, 1);

            // 记录处理结果
            String processResult = null;
            Integer satisfactionScore = null;
            Object processResultObj = data.get("processResult");
            Object satisfactionScoreObj = data.get("satisfactionScore");

            if (processResultObj != null) {
                processResult = processResultObj.toString();
            }
            if (satisfactionScoreObj != null) {
                satisfactionScore = Integer.parseInt(satisfactionScoreObj.toString());
            }

            complaintMapper.updateComplaintProcess(id, processResult, satisfactionScore);

            return Result.success();
        } catch (Exception e) {
            log.error("处理投诉失败", e);
            return Result.error("处理投诉失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Void> updateComplaintStatus(Long id, Integer status) {
        try {
            complaintMapper.updateComplaintStatus(id, status);
            return Result.success();
        } catch (Exception e) {
            log.error("更新投诉状态失败", e);
            return Result.error("更新投诉状态失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Void> batchUpdateComplaintStatus(String complaintIds, Integer status) {
        try {
            String[] ids = complaintIds.split(",");
            for (String id : ids) {
                complaintMapper.updateComplaintStatus(Long.parseLong(id), status);
            }
            return Result.success();
        } catch (Exception e) {
            log.error("批量更新投诉状态失败", e);
            return Result.error("批量更新投诉状态失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getPendingComplaints(Integer limit) {
        try {
            List<Map<String, Object>> complaints = complaintMapper.getPendingComplaints(limit);
            Map<String, Object> result = new HashMap<>();
            result.put("complaints", complaints);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取待处理投诉列表失败", e);
            return Result.error("获取待处理投诉列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getTodayComplaints() {
        try {
            List<Map<String, Object>> complaints = complaintMapper.getTodayComplaints();
            Map<String, Object> result = new HashMap<>();
            result.put("complaints", complaints);
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取今日新增投诉列表失败", e);
            return Result.error("获取今日新增投诉列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getComplaintStatistics() {
        try {
            Map<String, Object> stats = complaintMapper.getComplaintStatistics();
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取投诉统计数据失败", e);
            return Result.error("获取投诉统计数据失败: " + e.getMessage());
        }
    }
}
