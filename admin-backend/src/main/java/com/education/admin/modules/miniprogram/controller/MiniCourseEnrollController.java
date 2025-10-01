package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniCourseEnrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/course")
@RequiredArgsConstructor
public class MiniCourseEnrollController {

    private final MiniCourseEnrollService enrollService;

    /**
     * 学生报名课程（代付方式）
     */
    @PostMapping("/enroll")
    public Result<Object> enrollCourse(@RequestBody Map<String, Object> payload) {
        log.info("课程报名请求: {}", payload);
        return enrollService.enrollCourse(payload);
    }

    /**
     * 取消课程报名
     */
    @PostMapping("/cancel-enrollment")
    public Result<Object> cancelEnrollment(@RequestBody Map<String, Object> payload) {
        Long scheduleId = payload.get("scheduleId") != null ? 
            Long.valueOf(String.valueOf(payload.get("scheduleId"))) : null;
        log.info("取消课程报名请求, scheduleId: {}", scheduleId);
        return enrollService.cancelEnrollment(scheduleId);
    }

    /**
     * 检查学生是否已报名某课程
     */
    @GetMapping("/enrollment-status")
    public Result<Object> checkEnrollmentStatus(@RequestParam Long scheduleId) {
        log.info("检查课程报名状态, scheduleId: {}", scheduleId);
        return enrollService.checkEnrollmentStatus(scheduleId);
    }
}
