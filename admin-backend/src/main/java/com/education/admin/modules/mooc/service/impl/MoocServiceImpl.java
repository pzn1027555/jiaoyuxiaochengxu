package com.education.admin.modules.mooc.service.impl;

import com.education.admin.modules.badge.service.UserBadgeNotificationService;
import com.education.admin.modules.mooc.entity.MoocApplication;
import com.education.admin.modules.mooc.entity.MoocGroup;
import com.education.admin.modules.mooc.entity.MoocNotification;
import com.education.admin.modules.mooc.mapper.MoocMapper;
import com.education.admin.modules.mooc.service.MoocService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoocServiceImpl implements MoocService {

    private final MoocMapper moocMapper;
    private final UserBadgeNotificationService badgeService;

    @Override
    public MoocGroup createOrUpdateGroup(MoocGroup group) {
        if (group.getId() == null) {
            moocMapper.insertGroup(group);
        } else {
            moocMapper.updateGroup(group);
        }
        return group;
    }

    @Override
    public List<MoocGroup> listGroups() {
        return moocMapper.listGroups();
    }

    @Override
    public MoocApplication apply(Long teacherId) {
        // 若已有“待审核”的申请，则直接返回，避免重复提交
        List<MoocApplication> pendings = moocMapper.findApplications(teacherId, 0);
        if (pendings != null && !pendings.isEmpty()) {
            return pendings.get(0);
        }

        MoocApplication app = new MoocApplication();
        app.setTeacherId(teacherId);
        app.setStatus(0);
        moocMapper.insertApplication(app);
        // 显示红点：mooc 模块
        badgeService.showBadge(teacherId, "teacher", "mooc", 1);
        // 通知本人：申请已提交
        notifyTeacher(teacherId, "apply", "磨课申请", "您的磨课申请已提交，等待审核", app.getId());
        return app;
    }

    @Override
    public MoocApplication audit(Long applicationId, Integer status, Long groupId, Long auditUserId, String auditReason) {
        MoocApplication app = moocMapper.findApplicationById(applicationId);
        if (app == null) return null;
        app.setStatus(status);
        app.setGroupId(groupId);
        app.setAuditUserId(auditUserId);
        app.setAuditReason(auditReason);
        moocMapper.updateApplication(app);

        // 通知发起人
        String title = status != null && status == 1 ? "磨课申请通过" : "磨课申请被拒";
        String content = status != null && status == 1 ? "已为您分配磨课小组，稍后加入群完成磨课安排" : (auditReason == null ? "申请被拒" : auditReason);
        notifyTeacher(app.getTeacherId(), "apply", title, content, applicationId);

        // 若通过，同时通知小组派遣老师（这里仅在通知表记录，前端展示即可）
        if (status != null && status == 1 && groupId != null) {
            MoocGroup group = moocMapper.findGroupById(groupId);
            String groupInfo = group == null ? "" : (group.getGroupName() + " 群二维码已配置");
            notifyTeacher(app.getTeacherId(), "group", "磨课小组与群二维码", groupInfo, groupId);
        }

        // 隐藏红点
        badgeService.hideBadge(app.getTeacherId(), "teacher", "mooc");
        return app;
    }

    @Override
    public List<MoocApplication> listApplications(Long teacherId, Integer status) {
        return moocMapper.findApplications(teacherId, status);
    }

    @Override
    public void notifyTeacher(Long teacherId, String type, String title, String content, Long relatedId) {
        MoocNotification notification = new MoocNotification();
        notification.setTeacherId(teacherId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedId(relatedId);
        moocMapper.insertNotification(notification);
    }

    @Override
    public List<MoocNotification> listNotifications(Long teacherId) {
        return moocMapper.listNotifications(teacherId);
    }

    @Override
    public void markNotificationRead(Long notificationId) {
        moocMapper.markNotificationRead(notificationId);
    }
}


