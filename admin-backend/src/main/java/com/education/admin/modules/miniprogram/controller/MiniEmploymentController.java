package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.EmploymentApplicationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mini/employment")
@RequiredArgsConstructor
public class MiniEmploymentController {

    private final EmploymentApplicationService applicationService;

    @PostMapping("/apply")
    public Result<Void> apply(@RequestBody ApplyRequest req) {
        // TODO: 从token中解析teacherId；先兼容未登录流程传入
        Long teacherId = req.getTeacherId();
        return applicationService.apply(req.getPostId(), teacherId, req.getResumeUrl(), req.getResumeName(), req.getResumeSize());
    }

    @Data
    public static class ApplyRequest {
        private Long postId;
        private Long teacherId;
        private String resumeUrl;
        private String resumeName;
        private Long resumeSize;
    }
}


