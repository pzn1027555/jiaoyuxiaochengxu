package com.education.admin.modules.competition.service;

import com.github.pagehelper.PageInfo;

import java.util.Map;

public interface ScheduleAdminService {
    PageInfo<Map<String, Object>> list(int pageNum, int pageSize, String keyword, String classType, String startDate, String endDate);
}


