package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface UserInviteCodeMapper {
    Map<String,Object> findByUser(@Param("userId") Long userId, @Param("userType") String userType, @Param("codeType") String codeType);
    int insert(@Param("userId") Long userId, @Param("userType") String userType, @Param("codeType") String codeType, @Param("code") String code);
    Map<String,Object> findByCode(@Param("code") String code);
}


