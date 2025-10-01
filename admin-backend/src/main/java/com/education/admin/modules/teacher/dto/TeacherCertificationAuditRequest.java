package com.education.admin.modules.teacher.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 教师认证审核请求DTO
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class TeacherCertificationAuditRequest {

    /**
     * 认证ID
     */
    @NotNull(message = "认证ID不能为空")
    private Long id;

    /**
     * 认证状态：1-审核通过，2-审核拒绝，3-安排面试
     */
    @NotNull(message = "审核状态不能为空")
    private Integer certificationStatus;

    /**
     * 审核意见
     */
    private String auditReason;

    /**
     * 面试时间（当状态为安排面试时）
     */
    private LocalDateTime interviewTime;
}
