package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import com.education.admin.modules.miniprogram.service.AdminPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/employment-post")
@RequiredArgsConstructor
public class AdminEmploymentPostController {

    private final AdminPostService adminPostService;

    @GetMapping("/list")
    public Result<List<EmploymentPost>> list() {
        return adminPostService.employmentList();
    }

    @PostMapping("/create")
    public Result<Void> create(@RequestBody EmploymentPost post) {
        return adminPostService.employmentCreate(post);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody EmploymentPost post) {
        post.setId(id);
        return adminPostService.employmentUpdate(post);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        return adminPostService.employmentDelete(id);
    }
}



