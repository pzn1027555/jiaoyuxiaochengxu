package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResearchApplication {
    private Long id;
    private Long postId;
    private Long teacherId;
    private LocalDateTime createTime;
}


