package com.education.admin.modules.course.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 课程分类实体 - 对应course_category表
 */
@Data
public class CourseCategory {
    
    private Long id;
    
    private Long parentId;         // 父级分类ID，NULL表示一级分类
    
    private Integer level;         // 分类层级：1-一级分类，2-二级分类
    
    private String categoryName;   // 分类名称
    
    private String categoryCode;   // 分类编码
    
    private String categoryIcon;   // 分类图标
    
    private Integer sortOrder;     // 排序序号
    
    private String description;    // 分类描述
    
    private Integer status;        // 状态：1-启用，0-禁用
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
