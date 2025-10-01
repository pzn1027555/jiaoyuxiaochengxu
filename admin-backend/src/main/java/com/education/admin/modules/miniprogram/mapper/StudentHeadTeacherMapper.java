package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface StudentHeadTeacherMapper {
    Map<String,Object> findByStudentId(@Param("studentId") Long studentId);
    int insert(@Param("studentId") Long studentId, @Param("headTeacherId") Long headTeacherId);
}


