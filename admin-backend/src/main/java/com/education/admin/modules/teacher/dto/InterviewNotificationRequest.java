package com.education.admin.modules.teacher.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * 面试通知请求DTO
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class InterviewNotificationRequest {
    
    /**
     * 认证ID
     */
    @NotNull(message = "认证ID不能为空")
    private Long certificationId;
    
    /**
     * 面试时间
     */
    @NotNull(message = "面试时间不能为空")
    private LocalDateTime interviewTime;
    
    /**
     * 通知内容
     */
    @NotBlank(message = "通知内容不能为空")
    private String content;
}
