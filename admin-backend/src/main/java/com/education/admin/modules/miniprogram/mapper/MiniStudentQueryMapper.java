package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.student.entity.Student;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface MiniStudentQueryMapper {

    List<Student> findStudentsByTeacherId(@Param("teacherId") Long teacherId);

    Map<String, Object> findLatestOrderBrief(@Param("teacherId") Long teacherId,
                                             @Param("studentId") Long studentId);

    Integer sumMonthlyHours(@Param("teacherId") Long teacherId,
                            @Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end);
}


