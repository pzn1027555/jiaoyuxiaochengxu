package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.EmploymentApplication;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmploymentApplicationMapper {
    int insert(EmploymentApplication app);

    // 后台分页列表可在 Service 层用 PageHelper 包装
    java.util.List<EmploymentApplication> listAll();
}


