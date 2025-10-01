package com.education.admin.modules.mooc.mapper;

import com.education.admin.modules.mooc.entity.MoocApplication;
import com.education.admin.modules.mooc.entity.MoocGroup;
import com.education.admin.modules.mooc.entity.MoocNotification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MoocMapper {

    // group
    int insertGroup(MoocGroup group);
    int updateGroup(MoocGroup group);
    MoocGroup findGroupById(@Param("id") Long id);
    List<MoocGroup> listGroups();

    // application
    int insertApplication(MoocApplication app);
    int updateApplication(MoocApplication app);
    MoocApplication findApplicationById(@Param("id") Long id);
    List<MoocApplication> findApplications(@Param("teacherId") Long teacherId, @Param("status") Integer status);

    // notification
    int insertNotification(MoocNotification notification);
    List<MoocNotification> listNotifications(@Param("teacherId") Long teacherId);
    int markNotificationRead(@Param("id") Long id);
}


