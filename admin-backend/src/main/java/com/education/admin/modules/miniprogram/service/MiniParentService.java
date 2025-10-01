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
     * 家长学习统计（聚合所绑定学生的学习时长等）
     * data: { duration:{today,week,month}, chart:{ labels:[], values:[] } }
     */
    Map<String, Object> getParentStudyStats(String period, String phone);
}
