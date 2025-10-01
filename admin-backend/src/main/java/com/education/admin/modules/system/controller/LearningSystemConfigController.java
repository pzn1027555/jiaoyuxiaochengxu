package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.entity.LearningSystemConfig;
import com.education.admin.modules.system.service.LearningSystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/learning-system")
@RequiredArgsConstructor
public class LearningSystemConfigController {

    private final LearningSystemConfigService service;

    @GetMapping("/list")
    public Result<List<LearningSystemConfig>> list() {
        return Result.success(service.listAll());
    }

    @GetMapping("/enabled")
    public Result<List<LearningSystemConfig>> enabled() {
        return Result.success(service.listEnabled());
    }

    @GetMapping("/{systemKey}")
    public Result<LearningSystemConfig> get(@PathVariable String systemKey) {
        return Result.success(service.getBySystemKey(systemKey));
    }

    @PostMapping
    public Result<LearningSystemConfig> create(@RequestBody LearningSystemConfig config) {
        return Result.success(service.create(config));
    }

    @PutMapping("/{id}")
    public Result<LearningSystemConfig> update(@PathVariable Long id, @RequestBody LearningSystemConfig config) {
        config.setId(id);
        return Result.success(service.update(config));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        return service.delete(id) ? Result.success() : Result.error("删除失败");
    }
}


