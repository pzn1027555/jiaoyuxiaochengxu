package com.education.admin.modules.system.mapper;

import com.education.admin.modules.system.entity.SubjectLessonPrice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 学科课时价格配置Mapper
 */
@Mapper
public interface SubjectLessonPriceMapper {
    
    SubjectLessonPrice selectById(@Param("id") Long id);
    
    SubjectLessonPrice selectBySubjectId(@Param("subjectId") Long subjectId);
    
    List<SubjectLessonPrice> selectAll();
    
    int insert(SubjectLessonPrice subjectLessonPrice);
    
    int updateById(SubjectLessonPrice subjectLessonPrice);
    
    int deleteById(@Param("id") Long id);
}

