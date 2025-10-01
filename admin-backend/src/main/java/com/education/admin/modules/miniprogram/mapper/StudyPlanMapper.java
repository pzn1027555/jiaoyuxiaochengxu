package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.StudyPlan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StudyPlanMapper {
    
    void insert(StudyPlan studyPlan);
    
    StudyPlan findById(@Param("id") Long id);
    
    StudyPlan findByPlanCode(@Param("planCode") String planCode);
    
    List<StudyPlan> findByStudentId(@Param("studentId") Long studentId);
    
    List<StudyPlan> findByTeacherId(@Param("teacherId") Long teacherId);
    
    void updateConfirmationStatus(@Param("id") Long id, @Param("status") String status, @Param("orderId") Long orderId);
    
    void updateById(StudyPlan studyPlan);
    
    void deleteById(@Param("id") Long id);
}
