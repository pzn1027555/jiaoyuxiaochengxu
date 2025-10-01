package com.education.admin.modules.course.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 课程信息实体
 */
@Data
public class Course {
    
    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long teacherId;
    private String teacherName;
    private BigDecimal price;
    private String coverImage;
    private String videoUrl;
    private Integer duration;
    private Integer difficulty;
    private Integer status;
    private Integer sort;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}