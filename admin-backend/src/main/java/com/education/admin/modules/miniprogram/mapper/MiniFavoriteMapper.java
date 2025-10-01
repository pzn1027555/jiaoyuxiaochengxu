package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface MiniFavoriteMapper {
    int exists(@Param("studentId") Long studentId, @Param("teacherId") Long teacherId);
    int insert(@Param("studentId") Long studentId, @Param("teacherId") Long teacherId);
    int delete(@Param("studentId") Long studentId, @Param("teacherId") Long teacherId);
    int countByStudentId(@Param("studentId") Long studentId);
    
    // 新增：获取学生收藏的教师列表
    List<Map<String, Object>> getFavoriteTeachers(@Param("studentId") Long studentId,
                                                  @Param("pageSize") Integer pageSize,
                                                  @Param("offset") Integer offset);
    
    // 新增：获取学生点赞的帖子列表
    List<Map<String, Object>> getLikedPosts(@Param("studentId") Long studentId,
                                           @Param("pageSize") Integer pageSize,
                                           @Param("offset") Integer offset);
                                           
    // 新增：统计收藏教师总数
    int countFavoriteTeachers(@Param("studentId") Long studentId);
    
    // 新增：统计点赞帖子总数
    int countLikedPosts(@Param("studentId") Long studentId);
}


