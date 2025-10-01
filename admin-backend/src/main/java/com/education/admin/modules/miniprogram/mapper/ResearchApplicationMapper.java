package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.ResearchApplication;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ResearchApplicationMapper {
    int insert(ResearchApplication app);
    List<ResearchApplication> listAll();
}


