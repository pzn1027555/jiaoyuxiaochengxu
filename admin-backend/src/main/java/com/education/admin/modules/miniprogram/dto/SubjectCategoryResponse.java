package com.education.admin.modules.miniprogram.dto;

import lombok.Data;
import java.util.List;

/**
 * 科目分类响应DTO
 */
@Data
public class SubjectCategoryResponse {
    
    /**
     * 一级科目分类
     */
    @Data
    public static class CategoryLevel1 {
        private Long id;
        private String categoryName;
        private String categoryCode; 
        private String description;
        private Integer sortOrder;
        private List<CategoryLevel2> children; // 二级分类列表
    }
    
    /**
     * 二级科目分类
     */
    @Data
    public static class CategoryLevel2 {
        private Long id;
        private Long parentId;
        private String categoryName;
        private String categoryCode;
        private String description;
        private Integer sortOrder;
    }
    
    private List<CategoryLevel1> categories;
}
