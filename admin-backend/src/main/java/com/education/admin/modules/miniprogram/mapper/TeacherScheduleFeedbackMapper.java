package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.TeacherScheduleFeedback;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TeacherScheduleFeedbackMapper {
    TeacherScheduleFeedback findByScheduleId(@Param("scheduleId") Long scheduleId);
    TeacherScheduleFeedback findByScheduleIdAndRoleType(@Param("scheduleId") Long scheduleId,
                                                        @Param("roleType") String roleType);
    int insert(TeacherScheduleFeedback fb);
    int update(TeacherScheduleFeedback fb);

    // admin list with joins
    java.util.List<java.util.Map<String,Object>> adminList(@Param("roleType") String roleType,
                                                           @Param("teacherName") String teacherName,
                                                           @Param("studentName") String studentName,
                                                           @Param("pageSize") Integer pageSize,
                                                           @Param("offset") Integer offset);
    int adminCount(@Param("roleType") String roleType,
                   @Param("teacherName") String teacherName,
                   @Param("studentName") String studentName);
}


