package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 教研活动信息
 */
@Data
public class ResearchPost {
    private Long id;
    private String title;
    private String description;
    private String bannerUrl;
    private LocalDateTime publishTime;
    private Integer status;
}



