package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.StudentSurveyDetail;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StudentSurveyDetailMapper {
    int insert(StudentSurveyDetail detail);
    StudentSurveyDetail findById(Long id);
    StudentSurveyDetail findLatestByStudentId(Long studentId);
}


