package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.StudentSurvey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudentSurveyMapper {
    StudentSurvey findById(@Param("id") Long id);
    StudentSurvey findByTeacherAndStudent(@Param("teacherId") Long teacherId, @Param("studentId") Long studentId);
    int insert(StudentSurvey survey);
    int update(StudentSurvey survey);
    java.util.List<java.util.Map<String,Object>> findByTeacher(@Param("teacherId") Long teacherId);
    int countByTeacherAndStudent(@Param("teacherId") Long teacherId, @Param("studentId") Long studentId, @Param("bookingType") String bookingType);
    StudentSurvey findLatestUnpaidTrialByTeacherAndStudent(@Param("teacherId") Long teacherId, @Param("studentId") Long studentId);
    StudentSurvey findLatestByTeacherAndStudent(@Param("teacherId") Long teacherId, @Param("studentId") Long studentId);
}


