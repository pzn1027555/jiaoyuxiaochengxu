package com.education.admin.modules.teacher.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.teacher.service.TeacherCertificationService;
import com.education.admin.modules.teacher.dto.TeacherCertificationResponse;
import com.education.admin.modules.teacher.dto.TeacherCertificationAuditRequest;
import com.education.admin.modules.teacher.dto.InterviewNotificationRequest;
import com.education.admin.modules.teacher.dto.TeacherGradeRequest;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 后台管理系统教师认证控制器
 *
 * @author education
 * @since 2025-08-16
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/teacher/certification")
@RequiredArgsConstructor
public class TeacherCertificationController {

    private final TeacherCertificationService certificationService;

    /**
     * 分页查询教师认证列表
     */
    @GetMapping("/list")
    public Result<PageInfo<TeacherCertificationResponse>> getCertificationList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) String realName,
            @RequestParam(required = false) Integer certificationStatus) {
        
        return certificationService.getCertificationList(page, size, teacherName, realName, certificationStatus);
    }

    /**
     * 获取认证详情
     */
    @GetMapping("/{id}")
    public Result<TeacherCertificationResponse> getCertificationDetail(@PathVariable Long id) {
        return certificationService.getCertificationDetail(id);
    }

    /**
     * 审核教师认证
     */
    @PostMapping("/audit")
    public Result<Void> auditCertification(@Valid @RequestBody TeacherCertificationAuditRequest request) {
        // TODO: 从JWT或Session中获取当前审核人姓名
        String auditUserName = "管理员"; // 临时使用固定值
        
        return certificationService.auditCertification(request, auditUserName);
    }

    /**
     * 更新面试结果
     */
    @PostMapping("/interview-result")
    public Result<Void> updateInterviewResult(
            @RequestParam Long id,
            @RequestParam String interviewResult,
            @RequestParam Integer status) {
        
        return certificationService.updateInterviewResult(id, interviewResult, status);
    }

    /**
     * 发送面试通知
     */
    @PostMapping("/send-interview-notification")
    public Result<Void> sendInterviewNotification(@Valid @RequestBody InterviewNotificationRequest request) {
        return certificationService.sendInterviewNotification(request);
    }

    /**
     * 教师等级评定
     */
    @PostMapping("/grade")
    public Result<Void> gradeTeacher(@RequestBody TeacherGradeRequest request) {
        // TODO: 从JWT或Session中获取当前评级人姓名
        String gradeUserName = "管理员"; // 临时使用固定值
        
        return certificationService.gradeTeacher(request, gradeUserName);
    }

    /**
     * 获取认证统计信息
     */
    @GetMapping("/statistics")
    public Result<Object> getCertificationStatistics() {
        return certificationService.getCertificationStatistics();
    }
}
