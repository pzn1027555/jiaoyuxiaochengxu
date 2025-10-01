package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.dto.TeacherStudentResponse;
import com.education.admin.modules.miniprogram.service.MiniTeacherStudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/mini/teacher")
@RequiredArgsConstructor
public class MiniTeacherStudentController {

    private final MiniTeacherStudentService service;

    /**
     * 教师-我的学生列表（一次性查出，前端自行搜索筛选）
     */
    @GetMapping("/students")
    public Result<TeacherStudentResponse> students(@org.springframework.web.bind.annotation.RequestParam(value="teacherId", required=false) Long teacherId) {
        if (teacherId != null) {
            return service.getStudentsByTeacherId(teacherId);
        }
        return service.getMyStudents();
    }
}


