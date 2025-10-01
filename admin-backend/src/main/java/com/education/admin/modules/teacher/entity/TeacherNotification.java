package com.education.admin.modules.teacher.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 教师通知实体类
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class TeacherNotification {
    
    /**
     * 通知ID
     */
    private Long id;
    
    /**
     * 教师ID
     */
    private Long teacherId;
    
    /**
     * 通知类型：interview-面试通知，grade-评级通知，audit-审核通知
     */
    private String type;
    
    /**
     * 通知标题
     */
    private String title;
    
    /**
     * 通知内容
     */
    private String content;
    
    /**
     * 关联的认证ID
     */
    private Long certificationId;
    
    /**
     * 面试时间（面试通知用）
     */
    private LocalDateTime interviewTime;
    
    /**
     * 评定等级（评级通知用）
     */
    private String teacherLevel;
    
    /**
     * 是否已读：0-未读，1-已读
     */
    private Integer isRead;
    
    /**
     * 阅读时间
     */
    private LocalDateTime readTime;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
    
    // 通知类型常量
    public static final String TYPE_INTERVIEW = "interview";
    public static final String TYPE_GRADE = "grade";
    public static final String TYPE_AUDIT = "audit";
    
    // 教师等级常量
    public static final String LEVEL_JUNIOR = "junior";
    public static final String LEVEL_INTERMEDIATE = "intermediate";
    public static final String LEVEL_SENIOR = "senior";
    public static final String LEVEL_EXPERT = "expert";
}
