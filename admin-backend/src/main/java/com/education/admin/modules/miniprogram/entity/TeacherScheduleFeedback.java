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
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


