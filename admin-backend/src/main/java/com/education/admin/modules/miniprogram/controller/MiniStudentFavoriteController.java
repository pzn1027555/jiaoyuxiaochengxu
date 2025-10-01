package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniStudentFavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 学生收藏控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/student/favorites")
@RequiredArgsConstructor
public class MiniStudentFavoriteController {

    private final MiniStudentFavoriteService miniStudentFavoriteService;

    /**
     * 获取学生收藏的教师列表
     */
    @GetMapping("/teachers")
    public Result<Map<String, Object>> getFavoriteTeachers(
            @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        log.info("获取学生收藏教师列表，页码：{}，页大小：{}", pageNum, pageSize);
        return miniStudentFavoriteService.getFavoriteTeachers(pageNum, pageSize);
    }

    /**
     * 获取学生点赞的帖子列表
     */
    @GetMapping("/posts")
    public Result<Map<String, Object>> getLikedPosts(
            @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        log.info("获取学生点赞帖子列表，页码：{}，页大小：{}", pageNum, pageSize);
        return miniStudentFavoriteService.getLikedPosts(pageNum, pageSize);
    }
}
