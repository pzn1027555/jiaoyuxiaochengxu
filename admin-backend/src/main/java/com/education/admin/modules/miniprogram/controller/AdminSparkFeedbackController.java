package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleFeedbackMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spark/feedback")
@RequiredArgsConstructor
public class AdminSparkFeedbackController {

    private final TeacherScheduleFeedbackMapper feedbackMapper;

    /**
     * 按角色分页查询课程反馈，联表返回教师/学生/课程信息
     */
    @GetMapping("/list")
    public Result<PageInfo<Map<String,Object>>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                                     @RequestParam(defaultValue = "10") Integer pageSize,
                                                     @RequestParam(required = false) String roleType,
                                                     @RequestParam(required = false) String teacherName,
                                                     @RequestParam(required = false) String studentName){
        PageHelper.startPage(pageNum, pageSize);
        List<Map<String,Object>> rows = feedbackMapper.adminList(roleType, teacherName, studentName, null, null);
        PageInfo<Map<String,Object>> page = new PageInfo<>(rows);
        return Result.success(page);
    }
}


