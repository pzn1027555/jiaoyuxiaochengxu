package com.education.admin.modules.miniprogram.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 就业服务信息
 */
@Data
public class EmploymentPost {
    private Long id;
    private String title;
    private String description;
    private String bannerUrl;
    private LocalDateTime publishTime;
    private Integer status;
}



