package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmploymentApplication {
    private Long id;
    private Long postId;
    private Long teacherId; // 申请人（教师）
    private String resumeUrl;
    private String resumeName;
    private Long resumeSize;
    private LocalDateTime createTime;
}


