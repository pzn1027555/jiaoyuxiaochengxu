package com.education.admin.modules.system.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HeadTeacherMapper {
    java.util.Map<String,Object> findEnabledOne();
    java.util.List<java.util.Map<String,Object>> listAll();
    int insert(java.util.Map<String,Object> m);
    int update(java.util.Map<String,Object> m);
    int disableAll();
    int updateStatus(@org.apache.ibatis.annotations.Param("id") Long id,
                     @org.apache.ibatis.annotations.Param("status") Integer status);
    int deleteById(@org.apache.ibatis.annotations.Param("id") Long id);
    java.util.Map<String,Object> findById(@org.apache.ibatis.annotations.Param("id") Long id);
    java.util.Map<String,Object> findRandomEnabled();
    java.util.Map<String,Object> findRandomAny();
}


