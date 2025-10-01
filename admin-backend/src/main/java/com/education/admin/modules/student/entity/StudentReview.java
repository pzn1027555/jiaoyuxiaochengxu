package com.education.admin.modules.student.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudentReview {
    private Long id;
    private Long studentId;
    private Long teacherId;
    private Long courseId;
    // 这里复用 order_id 字段存放 scheduleId（排课ID）
    private Long orderId;
    private Integer starRating;
    private String reviewContent;
    private Integer auditStatus;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


