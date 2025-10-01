package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.course.entity.CourseCategory;
import com.education.admin.modules.course.mapper.CourseCategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/course-category")
@RequiredArgsConstructor
public class MiniCourseCategoryController {

    private final CourseCategoryMapper courseCategoryMapper;

    @GetMapping("/tree")
    public Result<List<Map<String, Object>>> getCategoryTree() {
        try {
            // 获取所有启用的分类
            List<CourseCategory> allCategories = courseCategoryMapper.findByStatus(1);
            
            // 构建二级树形结构
            List<Map<String, Object>> tree = new ArrayList<>();
            Map<Long, Map<String, Object>> parentMap = new HashMap<>();
            
            // 先处理一级分类
            for (CourseCategory category : allCategories) {
                if (category.getLevel() == 1) {
                    Map<String, Object> parentNode = new HashMap<>();
                    parentNode.put("id", category.getId());
                    parentNode.put("name", category.getCategoryName());
                    parentNode.put("code", category.getCategoryCode());
                    parentNode.put("level", category.getLevel());
                    parentNode.put("children", new ArrayList<Map<String, Object>>());
                    
                    tree.add(parentNode);
                    parentMap.put(category.getId(), parentNode);
                }
            }
            
            // 再处理二级分类
            for (CourseCategory category : allCategories) {
                if (category.getLevel() == 2 && category.getParentId() != null) {
                    Map<String, Object> parentNode = parentMap.get(category.getParentId());
                    if (parentNode != null) {
                        Map<String, Object> childNode = new HashMap<>();
                        childNode.put("id", category.getId());
                        childNode.put("name", category.getCategoryName());
                        childNode.put("code", category.getCategoryCode());
                        childNode.put("level", category.getLevel());
                        childNode.put("parentId", category.getParentId());
                        
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> children = (List<Map<String, Object>>) parentNode.get("children");
                        children.add(childNode);
                    }
                }
            }
            
            return Result.success(tree);
        } catch (Exception e) {
            log.error("获取课程分类树失败", e);
            return Result.error("获取课程分类失败");
        }
    }

    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getCategoryList() {
        try {
            List<CourseCategory> categories = courseCategoryMapper.findByStatus(1);
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (CourseCategory category : categories) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", category.getId());
                item.put("name", category.getCategoryName());
                item.put("code", category.getCategoryCode());
                item.put("level", category.getLevel());
                item.put("parentId", category.getParentId());
                result.add(item);
            }
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("获取课程分类列表失败", e);
            return Result.error("获取课程分类失败");
        }
    }
}
