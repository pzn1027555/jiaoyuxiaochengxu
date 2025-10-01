package com.education.admin.modules.miniprogram.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 教师学生列表响应DTO
 */
@Data
public class TeacherStudentResponse {
    
    /**
     * 学生基本信息
     */
    @Data
    public static class StudentInfo {
        private Long studentId;
        private String studentName;
        private String avatar;
        private Integer gender; // 1-男，2-女
        private String grade;
        private String school;
        private String phone;
        private String parentName;
        private String parentPhone;
        private String studentLevel; // 学生等级：bronze-铜牌，silver-银牌，gold-金牌
        private Integer status; // 1-在读，2-暂停，3-毕业，0-禁用
        private LocalDateTime lastCourseTime; // 最后上课时间
        
        // 课程相关信息
        private List<CourseProgress> courses;
    }
    
    /**
     * 课程进度信息
     */
    @Data
    public static class CourseProgress {
        private Long courseId;
        private String courseName;
        private String subject;
        private String courseType;
        private Integer totalLessons; // 总课时
        private Integer completedLessons; // 已完成课时
        private Integer remainingLessons; // 剩余课时
        private String currentChapter; // 当前章节
        private String progress; // 进度描述，如"第三章已学完 第6课/72课"
    }
    
    /**
     * 统计信息
     */
    @Data
    public static class Statistics {
        private Integer totalStudents; // 学生总数
        private Integer monthlyHours; // 当月总课时
        private Integer activeStudents; // 活跃学生数
    }
    
    private List<StudentInfo> students;
    private Statistics statistics;
}
