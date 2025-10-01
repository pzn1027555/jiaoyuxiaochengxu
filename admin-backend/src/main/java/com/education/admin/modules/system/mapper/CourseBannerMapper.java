package com.education.admin.modules.system.mapper;

import com.education.admin.modules.system.entity.CourseBanner;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CourseBannerMapper {

    List<CourseBanner> selectList(@Param("isEnabled") Integer isEnabled);

    CourseBanner selectById(@Param("id") Long id);

    int insert(CourseBanner banner);

    int update(CourseBanner banner);

    int delete(@Param("id") Long id);
}


