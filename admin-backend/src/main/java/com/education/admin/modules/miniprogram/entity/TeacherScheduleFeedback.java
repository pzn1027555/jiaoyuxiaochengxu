package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeacherScheduleFeedback {
    private Long id;
    private Long scheduleId;
    private Long teacherId;
    private Long studentId;
    private String roleType; // teacher / student
    private Integer starRating; // 1-5
    private String content;
    /** 教师反馈类型：teacher_daily(课堂反馈)/midterm(中期报告) */
    private String feedbackType;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


