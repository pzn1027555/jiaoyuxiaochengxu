package com.education.admin.modules.competition.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.competition.service.ScheduleAdminService;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleAdminService scheduleAdminService;

    /**
     * 课程列表（teacher_schedule 联 student 与 feedback 与 teacher_info）
     */
    @GetMapping("/list")
    public Result<PageInfo<java.util.Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String classType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            return Result.success(scheduleAdminService.list(pageNum, pageSize, keyword, classType, startDate, endDate));
        } catch (Exception e) {
            log.error("查询课程列表失败", e);
            return Result.error("查询课程列表失败");
        }
    }
}


