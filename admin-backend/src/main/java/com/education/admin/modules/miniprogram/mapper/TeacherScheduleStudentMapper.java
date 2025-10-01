package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TeacherScheduleStudentMapper {
    
    /**
     * 检查学生是否已经报名了该课程
     */
    int checkEnrollment(@Param("scheduleId") Long scheduleId, @Param("studentId") Long studentId);
    
    /**
     * 添加学生到课程
     */
    int insertEnrollment(TeacherScheduleStudent enrollment);
    
    /**
     * 根据scheduleId和studentId删除报名记录
     */
    int deleteEnrollment(@Param("scheduleId") Long scheduleId, @Param("studentId") Long studentId);
    
    /**
     * 获取某个课程的学生数量
     */
    int getStudentCountBySchedule(@Param("scheduleId") Long scheduleId);
    
    /**
     * 批量添加学生到课程
     */
    int insertBatch(@Param("scheduleId") Long scheduleId, @Param("studentIds") List<Long> studentIds);
    
    /**
     * 根据排课ID删除所有学生
     */
    int deleteByScheduleId(@Param("scheduleId") Long scheduleId);
    
    /**
     * 根据排课ID获取所有学生ID列表
     */
    List<Long> findStudentIdsByScheduleId(@Param("scheduleId") Long scheduleId);

    /**
     * 根据排课ID获取学生详细信息列表（包括姓名、头像等）
     */
    List<TeacherScheduleStudent> findByScheduleId(@Param("scheduleId") Long scheduleId);
}