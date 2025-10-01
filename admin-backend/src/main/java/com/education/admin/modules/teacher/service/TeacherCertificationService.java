package com.education.admin.modules.teacher.service;
import com.education.admin.modules.teacher.dto.TeacherCertificationRequest;
import com.education.admin.modules.teacher.dto.TeacherCertificationResponse;
import com.education.admin.modules.teacher.dto.TeacherCertificationAuditRequest;
import com.education.admin.modules.teacher.dto.InterviewNotificationRequest;
import com.education.admin.modules.teacher.dto.TeacherGradeRequest;
import com.education.admin.common.Result;
import com.github.pagehelper.PageInfo;

/**
 * 教师认证服务接口
 *
 * @author education
 * @since 2025-08-16
 */
public interface TeacherCertificationService {

    /**
     * 提交教师认证（小程序端）
     */
    Result<Void> submitCertification(Long teacherId, TeacherCertificationRequest request);

    /**
     * 获取教师认证状态（小程序端）
     */
    Result<TeacherCertificationResponse> getCertificationStatus(Long teacherId);

    /**
     * 分页查询教师认证列表（后台管理）
     */
    Result<PageInfo<TeacherCertificationResponse>> getCertificationList(
            Integer page, Integer size, String teacherName, String realName, Integer certificationStatus);

    /**
     * 获取认证详情（后台管理）
     */
    Result<TeacherCertificationResponse> getCertificationDetail(Long id);

    /**
     * 审核教师认证（后台管理）
     */
    Result<Void> auditCertification(TeacherCertificationAuditRequest request, String auditUserName);

    /**
     * 更新面试结果（后台管理）
     */
    Result<Void> updateInterviewResult(Long id, String interviewResult, Integer status);

    /**
     * 发送面试通知（后台管理）
     */
    Result<Void> sendInterviewNotification(InterviewNotificationRequest request);

    /**
     * 教师等级评定（后台管理）
     */
    Result<Void> gradeTeacher(TeacherGradeRequest request, String gradeUserName);

    /**
     * 教师认证统计（后台管理）
     */
    Result<Object> getCertificationStatistics();
}
