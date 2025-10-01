package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EmploymentPostMapper {
    List<EmploymentPost> listPublished();

    List<EmploymentPost> listAll();

    EmploymentPost findById(@Param("id") Long id);

    int insert(EmploymentPost post);

    int update(EmploymentPost post);

    int delete(@Param("id") Long id);
}



