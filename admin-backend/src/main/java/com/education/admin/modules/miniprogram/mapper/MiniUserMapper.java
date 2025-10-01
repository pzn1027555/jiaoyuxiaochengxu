package com.education.admin.modules.miniprogram.mapper;

import com.education.admin.modules.miniprogram.entity.MiniUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 小程序用户数据访问接口
 */
@Mapper
public interface MiniUserMapper {
    
    MiniUser findById(@Param("id") Long id);
    MiniUser findByOpenid(@Param("openid") String openid);
    MiniUser findByPhone(@Param("phone") String phone);
    List<MiniUser> findAll();
    int insert(MiniUser miniUser);
    int update(MiniUser miniUser);
    int deleteById(@Param("id") Long id);
}