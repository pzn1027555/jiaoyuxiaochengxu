package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import com.education.admin.modules.miniprogram.entity.ResearchPost;
import com.education.admin.modules.miniprogram.service.MiniPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/mini")
@RequiredArgsConstructor
public class MiniPostController {

    private final MiniPostService postService;

    @GetMapping("/research/list")
    public Result<List<ResearchPost>> researchList() {
        return postService.listResearchPosts();
    }

    @GetMapping("/employment/list")
    public Result<List<EmploymentPost>> employmentList() {
        return postService.listEmploymentPosts();
    }

    @PostMapping("/research/apply")
    public Result<Void> applyResearch(@RequestBody ApplyResearchRequest req) {
        return postService.applyResearch(req.getPostId(), req.getTeacherId());
    }

    @lombok.Data
    public static class ApplyResearchRequest {
        private Long postId;
        private Long teacherId;
    }
}



