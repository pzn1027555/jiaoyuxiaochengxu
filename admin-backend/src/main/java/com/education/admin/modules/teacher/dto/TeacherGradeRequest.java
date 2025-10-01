package com.education.admin.modules.teacher.dto;

import lombok.Data;

/**
 * 教师评级请求DTO
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class TeacherGradeRequest {
    
    /**
     * 认证ID
     */
    private Long id;
    
    /**
     * 教师等级：junior-初级，intermediate-中级，senior-高级，expert-专家
     */
    private String teacherLevel;
    
    /**
     * 评级说明
     */
    private String gradeReason;
}
