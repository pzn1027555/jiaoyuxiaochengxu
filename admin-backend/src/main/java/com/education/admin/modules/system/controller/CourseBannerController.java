package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.entity.CourseBanner;
import com.education.admin.modules.system.service.CourseBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/course-banner")
@RequiredArgsConstructor
public class CourseBannerController {

    private final CourseBannerService bannerService;

    @GetMapping("/list")
    public Result<List<CourseBanner>> list() {
        return Result.success(bannerService.listAll());
    }

    @PostMapping
    public Result<CourseBanner> create(@RequestBody CourseBanner banner) {
        return Result.success(bannerService.create(banner));
    }

    @PutMapping("/{id}")
    public Result<CourseBanner> update(@PathVariable Long id, @RequestBody CourseBanner banner) {
        banner.setId(id);
        return Result.success(bannerService.update(banner));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        return bannerService.delete(id) ? Result.success() : Result.error("删除失败");
    }
}


