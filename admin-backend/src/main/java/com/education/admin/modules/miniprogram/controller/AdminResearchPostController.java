package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.ResearchPost;
import com.education.admin.modules.miniprogram.service.AdminPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/research-post")
@RequiredArgsConstructor
public class AdminResearchPostController {

    private final AdminPostService adminPostService;

    @GetMapping("/list")
    public Result<List<ResearchPost>> list() {
        return adminPostService.researchList();
    }

    @PostMapping("/create")
    public Result<Void> create(@RequestBody ResearchPost post) {
        return adminPostService.researchCreate(post);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ResearchPost post) {
        post.setId(id);
        return adminPostService.researchUpdate(post);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        return adminPostService.researchDelete(id);
    }
}



