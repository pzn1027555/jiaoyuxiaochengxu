package com.education.admin.modules.competition.service.impl;

import com.education.admin.modules.competition.service.ScheduleAdminService;
import com.education.admin.modules.competition.mapper.ScheduleAdminMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScheduleAdminServiceImpl implements ScheduleAdminService {

    private final ScheduleAdminMapper mapper;

    @Override
    public PageInfo<Map<String, Object>> list(int pageNum, int pageSize, String keyword, String classType, String startDate, String endDate) {
        LocalDateTime start = null;
        LocalDateTime end = null;
        if (startDate != null && !startDate.isBlank()) {
            start = LocalDate.parse(startDate).atStartOfDay();
        }
        if (endDate != null && !endDate.isBlank()) {
            end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
        }
        PageHelper.startPage(pageNum, pageSize);
        List<Map<String, Object>> list = mapper.list(keyword, classType, start, end);
        return new PageInfo<>(list);
    }
}


