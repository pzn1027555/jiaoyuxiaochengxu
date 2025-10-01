package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 家长-学生关联Mapper接口
 */
@Mapper
public interface ParentStudentRelationMapper {

    /**
     * 获取学生绑定的家长列表
     * @param studentId 学生ID
     * @return 家长列表
     */
    List<Map<String, Object>> getParentsByStudentId(@Param("studentId") Long studentId);

    /**
     * 检查家长和学生的绑定关系
     * @param parentId 家长ID
     * @param studentId 学生ID
     * @return 关联记录数
     */
    int checkParentStudentRelation(@Param("parentId") Long parentId, @Param("studentId") Long studentId);

    /**
     * 根据家长ID获取第一个学生ID
     * @param parentId 家长ID
     * @return 学生ID
     */
    Long findFirstStudentIdByParentId(@Param("parentId") Long parentId);

    /**
     * 根据家长ID获取所有学生ID列表
     * @param parentId 家长ID
     * @return 学生ID列表
     */
    List<Long> findStudentIdsByParentId(@Param("parentId") Long parentId);

    /**
     * 插入家长-学生绑定关系（存在则更新时间）
     */
    int insertRelation(@Param("parentId") Long parentId,
                       @Param("studentId") Long studentId,
                       @Param("relationType") String relationType,
                       @Param("isPrimary") Integer isPrimary);

    /**
     * 获取家长绑定的学生列表（含学生基本信息）
     */
    List<Map<String,Object>> getStudentsByParentId(@Param("parentId") Long parentId);
    
    /**
     * 根据学生ID获取所有家长ID列表
     * @param studentId 学生ID
     * @return 家长ID列表
     */
    List<Long> findParentIdsByStudentId(@Param("studentId") Long studentId);
}