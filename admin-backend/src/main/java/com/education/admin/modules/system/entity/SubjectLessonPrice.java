package com.education.admin.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 学科课时价格配置实体类
 */
@Data
public class SubjectLessonPrice {
    
    private Long id;
    
    /**
     * 学科ID（关联course_category.id）
     */
    private Long subjectId;
    
    /**
     * 学科名称（冗余字段，便于显示）
     */
    private String subjectName;
    
    /**
     * 课时价格(元/课时)
     */
    private BigDecimal price;
    
    /**
     * 币种
     */
    private String currency;
    
    /**
     * 是否启用：1-启用，0-禁用
     */
    private Integer isEnabled;
    
    /**
     * 备注
     */
    private String remark;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}

