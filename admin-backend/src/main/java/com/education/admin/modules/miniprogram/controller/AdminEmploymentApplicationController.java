package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.EmploymentApplicationService;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/employment-application")
@RequiredArgsConstructor
public class AdminEmploymentApplicationController {

    private final EmploymentApplicationService applicationService;

    @GetMapping("/list")
    public Result<PageInfo<Map<String, Object>>> list(@RequestParam(defaultValue = "1") Integer page,
                                                      @RequestParam(defaultValue = "10") Integer size,
                                                      @RequestParam(required = false) Long postId,
                                                      @RequestParam(required = false) Long teacherId) {
        return Result.success(applicationService.adminList(page, size, postId, teacherId));
    }
}


