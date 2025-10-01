package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.ResearchPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ResearchPostMapper {
    List<ResearchPost> listPublished();

    List<ResearchPost> listAll();

    ResearchPost findById(@Param("id") Long id);

    int insert(ResearchPost post);

    int update(ResearchPost post);

    int delete(@Param("id") Long id);
}



