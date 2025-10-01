package com.education.admin.modules.student.mapper;

import com.education.admin.modules.student.entity.StudentReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudentReviewMapper {
    StudentReview findByStudentAndSchedule(@Param("studentId") Long studentId,
                                           @Param("scheduleId") Long scheduleId);

    java.util.List<java.util.Map<String,Object>> findByPage(@Param("studentName") String studentName,
                                                            @Param("teacherName") String teacherName,
                                                            @Param("starRating") Integer starRating,
                                                            @Param("auditStatus") Integer auditStatus);

    int insert(StudentReview review);

    int update(StudentReview review);
}


