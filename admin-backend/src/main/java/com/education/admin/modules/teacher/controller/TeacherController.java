package com.education.admin.modules.teacher.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.teacher.entity.Teacher;
import com.education.admin.modules.badge.service.UserBadgeNotificationService;
import com.education.admin.modules.teacher.service.TeacherService;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 教师管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {
    
    private final TeacherService teacherService;
    private final UserBadgeNotificationService badgeService;
    
    /**
     * 分页查询教师列表
     */
    @GetMapping("/list")
    public Result<PageInfo<Teacher>> getTeacherList(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) String teacherLevel,
            @RequestParam(required = false) Integer risk) {
        
        try {
            // 这里的第二个过滤参数原语义是审核状态，保持兼容传null
            PageInfo<Teacher> teachers = teacherService.getTeacherList(pageNum, pageSize, teacherName, null, risk);
            return Result.success(teachers);
        } catch (Exception e) {
            return Result.error("查询教师列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取教师详情
     */
    @GetMapping("/{id}")
    public Result<Teacher> getTeacherDetail(@PathVariable Long id) {
        try {
            Teacher teacher = teacherService.getTeacherById(id);
            if (teacher == null) {
                return Result.error("教师不存在");
            }
            return Result.success(teacher);
        } catch (Exception e) {
            return Result.error("获取教师详情失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取待审核教师列表
     */
    @GetMapping("/pending-audit")
    public Result<List<Map<String, Object>>> getPendingAuditTeachers() {
        // 模拟数据
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> teacher = new HashMap<>();
            teacher.put("id", i);
            teacher.put("teacherName", "教师" + i);
            teacher.put("phone", "1380000000" + i);
            teacher.put("submitTime", "2025-08-0" + i + " 10:30:00");
            teacher.put("auditStatus", 0); // 待审核
            data.add(teacher);
        }
        return Result.success(data);
    }
    
    /**
     * 获取风险教师列表
     */
    @GetMapping("/risk-teachers")
    public Result<List<Map<String, Object>>> getRiskTeachers() {
        // 真实数据：投诉率>10 或 星级<3
        List<com.education.admin.modules.teacher.entity.Teacher> list = teacherService.getTeacherList(1, Integer.MAX_VALUE, null, null, 1).getList();
        // 角标只需要数量；列表也返回基础字段给前端做展示
        List<Map<String,Object>> data = new ArrayList<>();
        for (var t : list) {
            Map<String,Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("teacherName", t.getTeacherName());
            m.put("avatar", t.getAvatar());
            m.put("phone", t.getPhone());
            m.put("teacherLevel", t.getTeacherLevel());
            m.put("starRating", t.getStarRating());
            m.put("complaintRate", t.getComplaintRate());
            data.add(m);
        }
        return Result.success(data);
    }
    
    /**
     * 获取推荐教师列表
     */
    @GetMapping("/recommended")
    public Result<List<Map<String, Object>>> getRecommendedTeachers() {
        // 模拟数据
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            Map<String, Object> teacher = new HashMap<>();
            teacher.put("id", i);
            teacher.put("teacherName", "优秀教师" + i);
            teacher.put("starRating", 4.5 + (Math.random() * 0.5));
            teacher.put("studentCount", 50 + i * 10);
            teacher.put("recommendOrder", i);
            data.add(teacher);
        }
        return Result.success(data);
    }
    
    /**
     * 创建教师
     */
    @PostMapping
    public Result<Void> createTeacher(@RequestBody Teacher teacher) {
        try {
            teacherService.createTeacher(teacher);
            return Result.success();
        } catch (Exception e) {
            return Result.error("创建教师失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新教师信息
     */
    @PutMapping("/{id}")
    public Result<Void> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        try {
            teacher.setId(id);
            // 若仅调整等级，避免全量更新导致必填字段被置空
            if (teacher.getTeacherLevel() != null && teacher.getTeacherName() == null) {
                teacherService.updateTeacherLevelOnly(id, teacher.getTeacherLevel());
            } else {
                teacherService.updateTeacher(teacher);
            }
            return Result.success();
        } catch (Exception e) {
            return Result.error("更新教师信息失败：" + e.getMessage());
        }
    }

    /** 仅更新教师等级（可选专用接口，前端也可调用该接口） */
    @PutMapping("/{id}/level")
    public Result<Void> updateTeacherLevel(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        try {
            String level = body.get("teacherLevel");
            teacherService.updateTeacherLevelOnly(id, level);
            return Result.success();
        } catch (Exception e) {
            return Result.error("更新教师等级失败：" + e.getMessage());
        }
    }
    
    /**
     * 审核教师
     */
    @PutMapping("/{id}/audit")
    public Result<Void> auditTeacher(@PathVariable Long id, @RequestBody Map<String, Object> auditData) {
        try {
            // 这里应该调用服务层方法进行审核
            // teacherService.audit(id, auditData);
            return Result.success();
        } catch (Exception e) {
            return Result.error("审核失败：" + e.getMessage());
        }
    }
    
    /**
     * 批量操作教师
     */
    @PostMapping("/batch")
    public Result<Void> batchOperation(@RequestBody Map<String, Object> batchData) {
        try {
            // 这里应该根据操作类型进行批量处理
            return Result.success();
        } catch (Exception e) {
            return Result.error("批量操作失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取教师统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getTeacherStatistics() {
        Map<String, Object> data = new HashMap<>();
        
        data.put("totalTeachers", 156);
        data.put("pendingAudit", 12);
        data.put("activeTeachers", 134);
        data.put("riskTeachers", 5);
        data.put("averageRating", 4.3);
        data.put("monthlyNewTeachers", 23);
        
        return Result.success(data);
    }
    
    /**
     * 删除教师
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteTeacher(@PathVariable Long id) {
        try {
            boolean deleted = teacherService.deleteTeacher(id);
            if (deleted) {
                return Result.success();
            } else {
                return Result.error("删除失败");
            }
        } catch (Exception e) {
            return Result.error("删除教师失败：" + e.getMessage());
        }
    }

    /**
     * 增加教师抽查次数
     */
    @PostMapping("/{id}/check")
    public Result<Void> increaseCheck(@PathVariable Long id) {
        try {
            boolean ok = teacherService.increaseCheckCount(id);
            if (ok) {
                return Result.success();
            }
            return Result.error("更新失败");
        } catch (Exception e) {
            return Result.error("增加抽查次数失败：" + e.getMessage());
        }
    }

    /**
     * 发送合同：更新合同状态并给小程序教师认证模块发红点通知
     */
    @PostMapping("/{id}/send-contract")
    public Result<Void> sendContract(@PathVariable Long id) {
        try {
            // 更新teacher_info合同状态为1（已发送待签）
            boolean updated = teacherService.markContractSent(id, "/uploads/2025/08/新文枢教师兼职合同.doc");
            if (!updated) {
                return Result.error("更新合同状态失败");
            }
            
            log.info("发送合同成功，教师ID: {}", id);
            
            // 显示教师认证红点（小程序"教师认证"页）- 使用count=1表示有1个新通知
            try {
                Result<Void> badgeResult = badgeService.showBadge(id, "teacher", "certification", 1);
                if (badgeResult.getCode() == 200) {
                    log.info("教师认证红点显示成功，教师ID: {}", id);
                } else {
                    log.warn("教师认证红点显示失败，教师ID: {}, 原因: {}", id, badgeResult.getMessage());
                }
            } catch (Exception e) {
                log.error("显示教师认证红点异常，教师ID: {}", id, e);
            }
            
            return Result.success();
        } catch (Exception e) {
            log.error("发送合同失败，教师ID: {}", id, e);
            return Result.error("发送合同失败：" + e.getMessage());
        }
    }

    /**
     * 雪藏/解除雪藏
     */
    @PostMapping("/{id}/toggle-hidden")
    public Result<Void> toggleHidden(@PathVariable Long id) {
        try {
            return teacherService.toggleHidden(id) ? Result.success() : Result.error("操作失败");
        } catch (Exception e) {
            return Result.error("操作失败：" + e.getMessage());
        }
    }

    /**
     * 推荐/取消推荐
     */
    @PostMapping("/{id}/toggle-recommend")
    public Result<Void> toggleRecommend(@PathVariable Long id) {
        try {
            return teacherService.toggleRecommend(id) ? Result.success() : Result.error("操作失败");
        } catch (Exception e) {
            return Result.error("操作失败：" + e.getMessage());
        }
    }
}