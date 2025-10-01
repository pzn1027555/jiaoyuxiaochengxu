package com.education.admin.modules.mooc.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.mooc.entity.MoocApplication;
import com.education.admin.modules.mooc.entity.MoocGroup;
import com.education.admin.modules.mooc.service.MoocService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

import com.education.admin.modules.badge.service.UserBadgeNotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

/**
 * 后台-磨课管理
 */
@RestController
@RequestMapping("/api/mooc")
@RequiredArgsConstructor
public class AdminMoocController {

    private final MoocService moocService;
    private final UserBadgeNotificationService badgeService;

    @GetMapping("/applications")
    public Result<List<MoocApplication>> listApplications(@RequestParam(required = false) Long teacherId,
                                                          @RequestParam(required = false) Integer status) {
        return Result.success(moocService.listApplications(teacherId, status));
    }

    @PostMapping("/audit")
    public Result<MoocApplication> audit(@RequestParam Long applicationId,
                                         @RequestParam Integer status,
                                         @RequestParam(required = false) Long groupId,
                                         @RequestParam(required = false) Long auditUserId,
                                         @RequestParam(required = false) String auditReason) {
        return Result.success(moocService.audit(applicationId, status, groupId, auditUserId, auditReason));
    }

    @GetMapping("/groups")
    public Result<List<MoocGroup>> listGroups() {
        return Result.success(moocService.listGroups());
    }

    @PostMapping("/group")
    public Result<MoocGroup> createOrUpdateGroup(@RequestBody MoocGroup group) {
        return Result.success(moocService.createOrUpdateGroup(group));
    }

    /** 安排磨课：选择老师(多选) + 时间 + 二维码，自动创建小组并通过申请 */
    @PostMapping("/arrange")
    public Result<MoocApplication> arrange(@RequestBody ArrangeRequest req) {
        MoocGroup group = new MoocGroup();
        group.setGroupName(req.getGroupName());
        group.setDispatchTeachers(req.getDispatchTeachers()); // JSON 字符串
        group.setQrcodeUrl(req.getQrcodeUrl());
        group.setScheduleTime(req.getScheduleTime());
        group.setRemark(req.getRemark());
        group.setCreatorUserId(req.getCreatorUserId());
        moocService.createOrUpdateGroup(group);
        MoocApplication app = moocService.audit(req.getApplicationId(), 1, group.getId(), req.getCreatorUserId(), "安排磨课");

        // 通知被派遣老师 + 红点
        List<Long> teacherIds = new ArrayList<>();
        try {
            if (req.getDispatchTeachers() != null && !req.getDispatchTeachers().isEmpty()) {
                ObjectMapper mapper = new ObjectMapper();
                teacherIds = mapper.readValue(req.getDispatchTeachers(), new TypeReference<List<Long>>(){});
            }
        } catch (Exception ignored) {}

        for (Long tid : teacherIds) {
            try {
                moocService.notifyTeacher(tid, "invite", "磨课邀请", "您被安排加入磨课小组，请查看群二维码并按时参加点评", group.getId());
                badgeService.showBadge(tid, "teacher", "mooc", 1);
            } catch (Exception ignored) {}
        }

        return Result.success(app);
    }
}

@Data
class ArrangeRequest {
    private Long applicationId;
    private String groupName;
    /** 选中的老师ID数组转成的JSON字符串，如 "[1,2,3]" */
    private String dispatchTeachers;
    private java.time.LocalDateTime scheduleTime;
    private String qrcodeUrl;
    private String remark;
    private Long creatorUserId;
}


