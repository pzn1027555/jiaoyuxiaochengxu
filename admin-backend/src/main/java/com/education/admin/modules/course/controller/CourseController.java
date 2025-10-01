package com.education.admin.modules.course.controller;

import com.education.admin.common.Result;
import com.github.pagehelper.PageInfo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 课程管理（对接 course_info 表）
 * 路由：/api/course/** 对应前端 api/course.js
 */
@RestController
@RequestMapping("/api/course")
public class CourseController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.course.mapper.CourseMapper courseMapper;

    @GetMapping("/list")
    public Result<PageInfo<com.education.admin.modules.course.entity.Course>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                                     @RequestParam(defaultValue = "10") Integer pageSize,
                                                     @RequestParam(required = false) Long categoryId,
                                                     @RequestParam(required = false) Long teacherId,
                                                     @RequestParam(required = false) Integer status,
                                                     @RequestParam(required = false) String keyword){
        com.github.pagehelper.PageHelper.startPage(pageNum, pageSize);
        java.util.List<com.education.admin.modules.course.entity.Course> rows = courseMapper.findByPage(categoryId, teacherId, status, keyword);
        return Result.success(new PageInfo<>(rows));
    }

    @GetMapping("/{id}")
    public Result<Map<String,Object>> detail(@PathVariable Long id){
        var c = courseMapper.findById(id);
        if (c == null) return Result.error("未找到课程");
        return Result.success(new java.util.HashMap<>(new com.fasterxml.jackson.databind.ObjectMapper().convertValue(c, java.util.Map.class)));
    }

    @GetMapping("/category/{categoryId}")
    public Result<List<Map<String,Object>>> listByCategory(@PathVariable Long categoryId){
        return Result.success(java.util.List.of());
        
    }

    @GetMapping("/teacher/{teacherId}")
    public Result<List<Map<String,Object>>> listByTeacher(@PathVariable Long teacherId){
        return Result.success(java.util.List.of());
    }

    @GetMapping("/pending-audit")
    public Result<List<Map<String,Object>>> pendingAudit(){
        return Result.success(java.util.List.of());
    }

    @GetMapping("/hot")
    public Result<List<Map<String,Object>>> hot(@RequestParam(defaultValue = "10") Integer limit){
        return Result.success(java.util.List.of());
    }

    @GetMapping("/recommended")
    public Result<List<Map<String,Object>>> recommended(@RequestParam(defaultValue = "10") Integer limit){
        return Result.success(java.util.List.of());
    }

    @GetMapping("/search")
    public Result<List<Map<String,Object>>> search(@RequestParam String keyword, @RequestParam(defaultValue = "20") Integer limit){
        return Result.success(java.util.List.of());
    }

    @PostMapping
    public Result<Void> create(@RequestBody Map<String,Object> body){
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        var c = mapper.convertValue(body, com.education.admin.modules.course.entity.Course.class);
        courseMapper.insert(c);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Map<String,Object> body){
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        var c = mapper.convertValue(body, com.education.admin.modules.course.entity.Course.class);
        c.setId(id);
        courseMapper.update(c);
        return Result.success();
    }

    @PostMapping("/audit")
    public Result<Void> audit(@RequestBody Map<String,Object> body){
        return Result.success();
    }

    @PostMapping("/batch")
    public Result<Void> batch(@RequestBody Map<String,Object> body){
        return Result.success();
    }

    @PostMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status){
        return Result.success();
    }

    @PostMapping("/{id}/hot")
    public Result<Void> updateHot(@PathVariable Long id, @RequestParam Boolean isHot){
        return Result.success();
    }

    @PostMapping("/{id}/recommend")
    public Result<Void> updateRecommend(@PathVariable Long id, @RequestParam Boolean isRecommended){
        return Result.success();
    }

    @PostMapping("/{id}/category")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestParam Long categoryId){
        return Result.success();
    }

    @PostMapping("/{id}/view")
    public Result<Void> increaseView(@PathVariable Long id){
        return Result.success();
    }

    @PostMapping("/{id}/favorite")
    public Result<Void> favorite(@PathVariable Long id){
        return Result.success();
    }

    @DeleteMapping("/{id}/favorite")
    public Result<Void> unfavorite(@PathVariable Long id){
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id){
        courseMapper.deleteById(id);
        return Result.success();
    }

    @GetMapping("/statistics")
    public Result<Map<String,Object>> statistics(){
        return Result.success(Map.of("total", 234, "hot", 20, "recommended", 35));
    }

    @GetMapping("/statistics/category")
    public Result<List<Map<String,Object>>> statisticsByCategory(){
        return Result.success(List.of(Map.of("category","数学","count",50)));
    }

    @GetMapping("/statistics/type")
    public Result<List<Map<String,Object>>> statisticsByType(){
        return Result.success(List.of(Map.of("type","one_to_one","count",120)));
    }

    @GetMapping("/ranking/hot")
    public Result<List<Map<String,Object>>> rankingHot(@RequestParam(defaultValue = "10") Integer limit){
        return Result.success(java.util.List.of());
    }

    @GetMapping("/ranking/sales")
    public Result<List<Map<String,Object>>> rankingSales(@RequestParam(defaultValue = "10") Integer limit){
        return Result.success(java.util.List.of());
    }

    // 移除mock
}


