package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniTeacherResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/teacher-resource")
@RequiredArgsConstructor
public class MiniTeacherResourceController {

    private final MiniTeacherResourceService resourceService;

    /**
     * 列表查询：根据类型获取当前教师的资源
     */
    @GetMapping("/list")
    public Result<Object> list(@RequestParam String type,
                               @RequestParam(defaultValue = "1") Integer page,
                               @RequestParam(defaultValue = "10") Integer size,
                               @RequestParam(required = false) Long teacherId) {
        return resourceService.list(type, page, size, teacherId);
    }

    /**
     * 创建资源
     */
    @PostMapping("/create")
    public Result<Object> create(@RequestBody Map<String, Object> payload) {
        return resourceService.create(payload);
    }

    /**
     * 更新资源
     */
    @PutMapping("/{id}")
    public Result<Object> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return resourceService.update(id, payload);
    }

    /**
     * 获取资源详情（编辑回填）
     */
    @GetMapping("/{id}")
    public Result<Object> detail(@PathVariable Long id) {
        return resourceService.detail(id);
    }

    /**
     * 删除资源
     */
    @DeleteMapping("/{id}")
    public Result<Object> delete(@PathVariable Long id) {
        return resourceService.delete(id);
    }
}


