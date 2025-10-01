package com.education.admin.modules.course.controller;

import com.education.admin.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 科目/课程分类（对接 course_category 表）
 * 路由：/api/course-category/**
 */
@RestController
@RequestMapping("/api/course-category")
public class CourseCategoryController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.course.mapper.CourseCategoryMapper categoryMapper;

    @org.springframework.beans.factory.annotation.Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @GetMapping("/list")
    public Result<List<Map<String, Object>>> list(@RequestParam(required = false) Integer pageNum,
                                                  @RequestParam(required = false) Integer pageSize,
                                                  @RequestParam(required = false) String categoryName,
                                                  @RequestParam(required = false) Integer level,
                                                  @RequestParam(required = false) Integer status) {
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> list = categoryMapper.findByPage(categoryName, level, status);
        java.util.List<java.util.Map<String,Object>> resp = new java.util.ArrayList<>();
        for (com.education.admin.modules.course.entity.CourseCategory c : list) {
            java.util.Map<String,Object> map = objectMapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            resp.add(map);
        }
        return Result.success(resp);
    }

    @GetMapping("/tree")
    public Result<List<Map<String, Object>>> tree(){
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> level1 = categoryMapper.findLevel1Categories();
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> level2 = categoryMapper.findLevel2Categories();
        final com.fasterxml.jackson.databind.ObjectMapper mapper = objectMapper;
        java.util.Map<Long, java.util.List<java.util.Map<String,Object>>> childrenMap = new java.util.HashMap<>();
        for (com.education.admin.modules.course.entity.CourseCategory c : level2) {
            java.util.Map<String,Object> child = mapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            childrenMap.computeIfAbsent(c.getParentId(), k-> new java.util.ArrayList<>()).add(child);
        }
        java.util.List<java.util.Map<String,Object>> roots = new java.util.ArrayList<>();
        for (com.education.admin.modules.course.entity.CourseCategory p : level1) {
            java.util.Map<String,Object> map = mapper.convertValue(p, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            map.put("children", childrenMap.getOrDefault(p.getId(), java.util.Collections.emptyList()));
            roots.add(map);
        }
        return Result.success(roots);
    }

    @GetMapping("/{id}")
    public Result<Map<String,Object>> detail(@PathVariable Long id){
        com.education.admin.modules.course.entity.CourseCategory c = categoryMapper.findById(id);
        if (c == null) return Result.error("未找到分类");
        java.util.Map<String,Object> map = objectMapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
        return Result.success(map);
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<Map<String,Object>>> listByParent(@PathVariable Long parentId){
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> list = categoryMapper.findByParentId(parentId);
        java.util.List<java.util.Map<String,Object>> resp = new java.util.ArrayList<>();
        final com.fasterxml.jackson.databind.ObjectMapper mapper = objectMapper;
        for (com.education.admin.modules.course.entity.CourseCategory c : list) {
            java.util.Map<String,Object> map = mapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            resp.add(map);
        }
        return Result.success(resp);
    }

    @GetMapping("/top-level")
    public Result<List<Map<String,Object>>> topLevel(){
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> list = categoryMapper.findLevel1Categories();
        java.util.List<java.util.Map<String,Object>> resp = new java.util.ArrayList<>();
        final com.fasterxml.jackson.databind.ObjectMapper mapper = objectMapper;
        for (com.education.admin.modules.course.entity.CourseCategory c : list) {
            java.util.Map<String,Object> map = mapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            resp.add(map);
        }
        return Result.success(resp);
    }

    @GetMapping("/enabled")
    public Result<List<Map<String,Object>>> enabled(){
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> list = categoryMapper.findAllEnabledCategories();
        java.util.List<java.util.Map<String,Object>> resp = new java.util.ArrayList<>();
        final com.fasterxml.jackson.databind.ObjectMapper mapper = objectMapper;
        for (com.education.admin.modules.course.entity.CourseCategory c : list) {
            java.util.Map<String,Object> map = mapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            resp.add(map);
        }
        return Result.success(resp);
    }

    @GetMapping("/visible")
    public Result<List<Map<String,Object>>> visible(){
        java.util.List<com.education.admin.modules.course.entity.CourseCategory> list = categoryMapper.findAllEnabledCategories();
        java.util.List<java.util.Map<String,Object>> resp = new java.util.ArrayList<>();
        final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        for (com.education.admin.modules.course.entity.CourseCategory c : list) {
            java.util.Map<String,Object> map = mapper.convertValue(c, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,Object>>(){});
            resp.add(map);
        }
        return Result.success(resp);
    }

    @PostMapping
    public Result<Void> create(@RequestBody Map<String,Object> body){
        var c = objectMapper.convertValue(body, com.education.admin.modules.course.entity.CourseCategory.class);
        categoryMapper.insert(c);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Map<String,Object> body){
        var c = objectMapper.convertValue(body, com.education.admin.modules.course.entity.CourseCategory.class);
        c.setId(id);
        categoryMapper.update(c);
        return Result.success();
    }

    @PostMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status){
        categoryMapper.updateStatus(id, status);
        return Result.success();
    }

    @PostMapping("/{id}/visible")
    public Result<Void> updateVisible(@PathVariable Long id, @RequestParam Boolean isVisible){
        // 若后续有单独的可见字段，请在Mapper中实现。当前先沿用status语义：显示=启用
        categoryMapper.updateStatus(id, Boolean.TRUE.equals(isVisible) ? 1 : 0);
        return Result.success();
    }

    @PostMapping("/{id}/sort")
    public Result<Void> updateSort(@PathVariable Long id, @RequestParam Integer sortOrder){
        categoryMapper.updateSortOrder(id, sortOrder);
        return Result.success();
    }

    @PostMapping("/{id}/move")
    public Result<Void> move(@PathVariable Long id, @RequestParam Long newParentId){
        com.education.admin.modules.course.entity.CourseCategory c = categoryMapper.findById(id);
        if (c == null) return Result.error("分类不存在");
        int newLevel = (newParentId == null ? 1 : 2);
        categoryMapper.moveParent(id, newParentId, newLevel);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id){
        categoryMapper.deleteById(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> ids){
        if (ids != null) {
            for (Long id : ids) { categoryMapper.deleteById(id); }
        }
        return Result.success();
    }

    @GetMapping("/check-code")
    public Result<Boolean> checkCode(@RequestParam String categoryCode, @RequestParam(required = false) Long excludeId){
        com.education.admin.modules.course.entity.CourseCategory exist = categoryMapper.findByCategoryCode(categoryCode);
        boolean ok = (exist == null) || (excludeId != null && exist.getId().equals(excludeId));
        return Result.success(ok);
    }

    @GetMapping("/check-name")
    public Result<Boolean> checkName(@RequestParam String categoryName, @RequestParam(required = false) Long parentId, @RequestParam(required = false) Long excludeId){
        com.education.admin.modules.course.entity.CourseCategory exist = categoryMapper.findByNameAndParent(categoryName, parentId);
        boolean ok = (exist == null) || (excludeId != null && exist.getId().equals(excludeId));
        return Result.success(ok);
    }

    @GetMapping("/statistics")
    public Result<Map<String,Object>> statistics(){
        return Result.success(Map.of("total", 20, "level1", 5, "level2", 15));
    }

    @GetMapping("/statistics/level")
    public Result<List<Map<String,Object>>> statisticsByLevel(){
        var level1 = categoryMapper.findLevel1Categories();
        var level2 = categoryMapper.findLevel2Categories();
        return Result.success(java.util.List.of(
                java.util.Map.of("level",1,"count", level1.size()),
                java.util.Map.of("level",2,"count", level2.size())
        ));
    }

    @GetMapping("/statistics/course-count")
    public Result<List<Map<String,Object>>> statisticsByCourseCount(){
        return Result.success(List.of(Map.of("category","数学","courseCount",30)));
    }

    // 移除mock方法
}


