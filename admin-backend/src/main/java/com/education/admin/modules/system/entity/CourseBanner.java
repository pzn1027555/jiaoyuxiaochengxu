package com.education.admin.modules.system.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 课程页轮播图实体
 */
@Data
public class CourseBanner {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkType;
    private String linkValue;
    private Integer sortOrder;
    private Integer isEnabled;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


