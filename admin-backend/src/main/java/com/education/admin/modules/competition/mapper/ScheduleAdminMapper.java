package com.education.admin.modules.competition.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface ScheduleAdminMapper {
    List<Map<String, Object>> list(@Param("keyword") String keyword,
                                   @Param("classType") String classType,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);
}


