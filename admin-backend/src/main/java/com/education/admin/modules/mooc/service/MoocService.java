package com.education.admin.modules.mooc.service;

import com.education.admin.modules.mooc.entity.MoocApplication;
import com.education.admin.modules.mooc.entity.MoocGroup;
import com.education.admin.modules.mooc.entity.MoocNotification;

import java.util.List;

public interface MoocService {

    // group
    MoocGroup createOrUpdateGroup(MoocGroup group);
    List<MoocGroup> listGroups();

    // application
    MoocApplication apply(Long teacherId);
    MoocApplication audit(Long applicationId, Integer status, Long groupId, Long auditUserId, String auditReason);
    List<MoocApplication> listApplications(Long teacherId, Integer status);

    // notification
    void notifyTeacher(Long teacherId, String type, String title, String content, Long relatedId);
    List<MoocNotification> listNotifications(Long teacherId);
    void markNotificationRead(Long notificationId);
}


