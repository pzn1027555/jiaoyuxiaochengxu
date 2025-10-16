package com.education.admin.modules.miniprogram.service;

import java.util.List;
import java.util.Map;

/**
 * 小程序家长服务接口
 */
public interface MiniParentService {

    /**
     * 获取当前学生绑定的家长列表
     * @return 家长列表
     */
    List<Map<String, Object>> getBindParents();

    /**
     * 家长学习统计（当传入 studentId 时统计该学生；否则聚合所绑定学生）
     * 返回：data: { duration:{today,week,month}, chart:{ labels:[], values:[] } }
     */
    Map<String, Object> getParentStudyStats(String period, String phone, Long studentId);

    /** 家长端：按月获取孩子课程反馈/中期报告列表 */
    default java.util.List<java.util.Map<String,Object>> listStudentFeedbackByMonth(Long studentId, String month, String type){
        throw new UnsupportedOperationException("Not implemented");
    }
}
