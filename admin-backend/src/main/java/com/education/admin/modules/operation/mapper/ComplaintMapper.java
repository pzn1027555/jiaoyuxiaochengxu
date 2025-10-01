package com.education.admin.modules.operation.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 投诉管理数据访问接口
 */
@Mapper
public interface ComplaintMapper {

    /**
     * 获取投诉列表
     */
    List<Map<String, Object>> getComplaintList(Map<String, Object> params);

    /**
     * 获取投诉总数
     */
    int getComplaintCount(Map<String, Object> params);

    /**
     * 获取投诉详情
     */
    Map<String, Object> getComplaintDetail(@Param("id") Long id);

    /**
     * 更新投诉状态
     */
    int updateComplaintStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 更新投诉处理结果
     */
    int updateComplaintProcess(@Param("id") Long id, @Param("processResult") String processResult, @Param("satisfactionScore") Integer satisfactionScore);

    /**
     * 获取待处理投诉列表
     */
    List<Map<String, Object>> getPendingComplaints(@Param("limit") Integer limit);

    /**
     * 获取今日新增投诉列表
     */
    List<Map<String, Object>> getTodayComplaints();

    /**
     * 获取投诉统计数据
     */
    Map<String, Object> getComplaintStatistics();
}
