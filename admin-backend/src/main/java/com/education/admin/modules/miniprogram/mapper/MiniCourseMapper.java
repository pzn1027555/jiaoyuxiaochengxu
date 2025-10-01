package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface MiniCourseMapper {
    List<Map<String, Object>> list(@Param("offset") Integer offset,
                                   @Param("limit") Integer limit,
                                   @Param("keyword") String keyword,
                                   @Param("subjectId") Long subjectId);

    int count(@Param("keyword") String keyword, @Param("subjectId") Long subjectId);

    Map<String,Object> detail(@Param("id") Long id);
}



