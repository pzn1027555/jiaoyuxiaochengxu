package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniProfileService;
import com.education.admin.modules.miniprogram.service.MiniStudentService;
import com.education.admin.modules.miniprogram.dto.TeacherStudentResponse;
import com.education.admin.modules.miniprogram.dto.SubjectCategoryResponse;
import com.education.admin.modules.miniprogram.dto.UserProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 小程序用户资料控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/profile")
@RequiredArgsConstructor
public class MiniProfileController {

    private final MiniProfileService miniProfileService;
    private final MiniStudentService miniStudentService;

    /**
     * 获取用户资料
     */
    @GetMapping("/info")
    public Result<Object> getUserProfile() {
        log.info("获取用户资料请求");
        return miniProfileService.getUserProfile();
    }

    /**
     * 获取学生资料（仅 student_info）
     */
    @GetMapping("/student")
    public Result<Object> getStudentProfile() {
        log.info("获取学生资料请求");
        return miniProfileService.getStudentProfile();
    }

    /**
     * 获取家长资料（仅 parent_info）
     */
    @GetMapping("/parent")
    public Result<Object> getParentProfile() {
        log.info("获取家长资料请求");
        return miniProfileService.getParentProfile();
    }

    // 学生账户余额接口已移除

    /** 学生关注老师数量 */
    @GetMapping("/student/followed/count")
    public Result<Integer> getStudentFollowedCount(){
        return miniProfileService.getStudentFollowedTeachersCount();
    }

    /** 学生课程数量（按 plan_id 去重） */
    @GetMapping("/student/course/count")
    public Result<Integer> getStudentCourseCount(){
        return miniProfileService.getStudentCourseCount();
    }

    /**
     * 更新用户资料
     */
    @PostMapping("/update")
    public Result<Object> updateUserProfile(@Valid @RequestBody UserProfileRequest request) {
        log.info("更新用户资料请求");
        return miniProfileService.updateUserProfile(request);
    }

    /**
     * 获取教师的学生列表
     */
    @GetMapping("/teacher/students")
    public Result<TeacherStudentResponse> getTeacherStudents() {
        log.info("获取教师学生列表请求");
        return miniProfileService.getTeacherStudents();
    }

    /**
     * 全量学生列表（供小程序排课选择器使用）
     */
    @GetMapping("/students/all")
    public Result<java.util.List<java.util.Map<String, Object>>> getAllStudents(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        return miniStudentService.getAllStudents(keyword, page, size);
    }

    /**
     * 获取科目分类列表（两级结构）
     */
    @GetMapping("/subjects")
    public Result<SubjectCategoryResponse> getSubjectCategories() {
        log.info("获取科目分类列表请求");
        return miniProfileService.getSubjectCategories();
    }
}
