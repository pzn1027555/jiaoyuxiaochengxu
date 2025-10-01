package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface InvitationRecordMapper {
    int insert(@Param("activityId") Long activityId,
               @Param("inviterId") Long inviterId,
               @Param("inviterType") String inviterType,
               @Param("invitedId") Long invitedId,
               @Param("invitedType") String invitedType,
               @Param("invitationCode") String invitationCode);

    int exists(@Param("inviterId") Long inviterId, @Param("invitedId") Long invitedId);

    List<Map<String,Object>> listInvitees(@Param("inviterId") Long inviterId);
}


