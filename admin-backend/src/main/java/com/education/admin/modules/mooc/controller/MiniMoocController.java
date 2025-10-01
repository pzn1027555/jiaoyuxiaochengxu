package com.education.admin.modules.mooc.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.mooc.entity.MoocApplication;
import com.education.admin.modules.mooc.entity.MoocNotification;
import com.education.admin.modules.mooc.service.MoocService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序-磨课
 */
@RestController
@RequestMapping("/api/mini/mooc")
@RequiredArgsConstructor
public class MiniMoocController {

    private final MoocService moocService;

    /** 教师发起磨课申请（接收JSON：{"teacherId":xx}） */
    @PostMapping("/apply")
    public Result<MoocApplication> apply(@RequestBody ApplyRequest request) {
        if (request == null || request.getTeacherId() == null) {
            return Result.error("teacherId不能为空");
        }
        return Result.success(moocService.apply(request.getTeacherId()));
    }

    /** 获取我的磨课通知列表 */
    @GetMapping("/notifications")
    public Result<List<MoocNotification>> listNotifications(@RequestParam Long teacherId) {
        return Result.success(moocService.listNotifications(teacherId));
    }

    /** 查询当前最新的磨课申请状态 */
    @GetMapping("/status")
    public Result<MoocApplication> status(@RequestParam Long teacherId) {
        List<MoocApplication> list = moocService.listApplications(teacherId, null);
        MoocApplication latest = (list != null && !list.isEmpty()) ? list.get(0) : null;
        return Result.success(latest);
    }

    /** 将通知标记为已读 */
    @PostMapping("/notifications/{id}/read")
    public Result<Void> read(@PathVariable Long id) {
        moocService.markNotificationRead(id);
        return Result.success();
    }
}

@Data
class ApplyRequest {
    private Long teacherId;
}


