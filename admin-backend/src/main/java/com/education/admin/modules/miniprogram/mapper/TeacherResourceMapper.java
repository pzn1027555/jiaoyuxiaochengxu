package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.TeacherResource;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TeacherResourceMapper {
    List<TeacherResource> findByTeacherAndType(@Param("teacherId") Long teacherId, @Param("type") String type);
    int insert(TeacherResource entity);
    int update(TeacherResource entity);
    TeacherResource findById(@Param("id") Long id);
    int deleteByIdAndTeacher(@Param("id") Long id, @Param("teacherId") Long teacherId);
}


