package com.education.admin.modules.system.mapper;

import com.education.admin.modules.system.entity.System;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 系统配置数据访问接口
 */
@Mapper
public interface SystemMapper {
    
    System findById(@Param("id") Long id);
    List<System> findAll();
    int insert(System system);
    int update(System system);
    int deleteById(@Param("id") Long id);
}