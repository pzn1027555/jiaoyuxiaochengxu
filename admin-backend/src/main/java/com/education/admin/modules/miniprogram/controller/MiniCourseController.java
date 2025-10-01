package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniCourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/mini/course")
@RequiredArgsConstructor
public class MiniCourseController {

    private final MiniCourseService courseService;

    /**
     * 课程列表（联表 teacher_schedule、teacher_schedule_student、teacher_info、student_info）
     */
    @GetMapping("/list")
    public Result<Object> list(@RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
                               @RequestParam(value = "size", required = false, defaultValue = "10") Integer size,
                               @RequestParam(value = "keyword", required = false) String keyword,
                               @RequestParam(value = "subjectId", required = false) Long subjectId) {
        return courseService.list(page, size, keyword, subjectId);
    }

    /** 课程详情 */
    @GetMapping("/detail")
    public Result<Object> detail(@RequestParam("id") Long id){
        return courseService.detail(id);
    }
}



