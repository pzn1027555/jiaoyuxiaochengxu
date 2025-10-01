package com.education.admin.modules.course.mapper;

import com.education.admin.modules.course.entity.CourseCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 课程分类Mapper
 */
@Mapper
public interface CourseCategoryMapper {
    
    /**
     * 根据ID查询
     */
    CourseCategory findById(@Param("id") Long id);
    
    /**
     * 根据父级ID查询子分类
     */
    List<CourseCategory> findByParentId(@Param("parentId") Long parentId);
    
    /**
     * 查询所有启用的一级分类
     */
    List<CourseCategory> findLevel1Categories();
    
    /**
     * 查询所有启用的二级分类
     */
    List<CourseCategory> findLevel2Categories();
    
    /**
     * 查询所有启用的分类（层级结构）
     */
    List<CourseCategory> findAllEnabledCategories();
    
    /**
     * 根据分类编码查询
     */
    CourseCategory findByCategoryCode(@Param("categoryCode") String categoryCode);
    
    /**
     * 插入分类
     */
    int insert(CourseCategory courseCategory);
    
    /**
     * 更新分类
     */
    int update(CourseCategory courseCategory);
    
    /**
     * 删除分类
     */
    int deleteById(@Param("id") Long id);
    
    /**
     * 分页查询分类
     */
    List<CourseCategory> findByPage(@Param("categoryName") String categoryName, 
                                   @Param("level") Integer level,
                                   @Param("status") Integer status);
    
    /**
     * 统计总数
     */
    int countTotal(@Param("categoryName") String categoryName, 
                   @Param("level") Integer level,
                   @Param("status") Integer status);
    
    /**
     * 根据状态查询分类
     */
    List<CourseCategory> findByStatus(@Param("status") Integer status);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);

    int moveParent(@Param("id") Long id, @Param("newParentId") Long newParentId, @Param("newLevel") Integer newLevel);

    CourseCategory findByNameAndParent(@Param("categoryName") String categoryName, @Param("parentId") Long parentId);
}
