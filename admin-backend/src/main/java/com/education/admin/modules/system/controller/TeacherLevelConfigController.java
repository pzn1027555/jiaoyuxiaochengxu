package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.entity.TeacherLevelConfig;
import com.education.admin.modules.system.service.TeacherLevelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system/teacher-level")
@RequiredArgsConstructor
public class TeacherLevelConfigController {

    private final TeacherLevelConfigService service;

    @GetMapping("/list")
    public Result<List<TeacherLevelConfig>> list() {
        return Result.success(service.listAll());
    }

    @GetMapping("/{levelKey}")
    public Result<TeacherLevelConfig> getByLevel(@PathVariable String levelKey) {
        return Result.success(service.getByLevelKey(levelKey));
    }

    @PostMapping
    public Result<TeacherLevelConfig> create(@RequestBody TeacherLevelConfig config) {
        return Result.success(service.create(config));
    }

    @PutMapping("/{id}")
    public Result<TeacherLevelConfig> update(@PathVariable Long id, @RequestBody TeacherLevelConfig config) {
        config.setId(id);
        return Result.success(service.update(config));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        return service.delete(id) ? Result.success() : Result.error("删除失败");
    }
}


