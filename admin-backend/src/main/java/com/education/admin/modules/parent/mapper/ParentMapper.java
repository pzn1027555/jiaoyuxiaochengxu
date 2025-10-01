package com.education.admin.modules.parent.mapper;

import com.education.admin.modules.parent.entity.Parent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 家长数据访问接口
 */
@Mapper
public interface ParentMapper {
    
    Parent findById(@Param("id") Long id);
    Parent findByPhone(@Param("phone") String phone);
    List<Parent> findAll();
    int insert(Parent parent);
    int update(Parent parent);
    int deleteById(@Param("id") Long id);
}