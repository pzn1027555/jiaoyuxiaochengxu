package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.TeacherSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TeacherScheduleMapper {
    List<TeacherSchedule> findByTeacherAndRange(@Param("teacherId") Long teacherId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    TeacherSchedule findByIdAndTeacher(@Param("id") Long id, @Param("teacherId") Long teacherId);

    int insert(TeacherSchedule entity);

    int update(TeacherSchedule entity);

    int deleteByIdAndTeacher(@Param("id") Long id, @Param("teacherId") Long teacherId);

    int countConflicts(@Param("teacherId") Long teacherId,
                       @Param("start") LocalDateTime start,
                       @Param("end") LocalDateTime end,
                       @Param("excludeId") Long excludeId);

    // 学生端：按学生查询某日程
    List<TeacherSchedule> findByStudentAndRange(@Param("studentId") Long studentId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    TeacherSchedule findById(@Param("id") Long id);

    TeacherSchedule findByIdForStudent(@Param("id") Long id, @Param("studentId") Long studentId);

    /** 统计学生的课程数量（按 plan_id 去重） */
    int countCoursesByStudent(@Param("studentId") Long studentId);

    /** 统计某学生在时间范围内的课时数量（每条排课算1课时） */
    int countLessonsByStudentInRange(@Param("studentId") Long studentId,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);

    /** 汇总某学生在时间范围内的总学习时长（分钟），基于 teacher_schedule.duration_minutes */
    int sumDurationMinutesByStudentInRange(@Param("studentId") Long studentId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    /** 按学习计划编号查询所有排课 */
    List<TeacherSchedule> findByPlanId(@Param("planId") String planId);

    /** 按计划编号更新确认状态 */
    int updateConfirmationStatusByPlanId(@Param("planId") String planId,
                                         @Param("status") String status);
}


