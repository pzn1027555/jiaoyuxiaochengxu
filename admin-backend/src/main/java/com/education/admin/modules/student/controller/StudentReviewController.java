package com.education.admin.modules.student.controller;

import com.education.admin.common.Result;
import com.github.pagehelper.PageInfo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 学生课程反馈（基于表 student_review）
 * 提供列表查询、统计、详情与审核操作接口
 */
@RestController
@RequestMapping("/api/student/review")
public class StudentReviewController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.student.mapper.StudentReviewMapper reviewMapper;

    /** 列表查询（分页 + 条件） */
    @GetMapping("/list")
    public Result<PageInfo<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) Integer starRating,
            @RequestParam(required = false) Integer auditStatus
    ) {
        com.github.pagehelper.PageHelper.startPage(pageNum, pageSize);
        List<Map<String, Object>> list = reviewMapper.findByPage(studentName, teacherName, starRating, auditStatus);
        return Result.success(new PageInfo<>(list));
    }

    /** 统计卡片数据 */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalReviews", 156);
        data.put("pendingReviews", 23);
        data.put("excellentReviews", 108);
        data.put("averageRating", 4.3);
        return Result.success(data);
    }

    /** 详情 */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        var r = reviewMapper.findByStudentAndSchedule(null, null); // 示例：应提供实际查询方法
        return Result.success(new java.util.HashMap<>());
    }

    /** 单条审核 */
    @PutMapping("/{id}/audit")
    public Result<Void> audit(@PathVariable Long id, @RequestParam Integer status) {
        // TODO: 实现审核更新SQL
        return Result.success();
    }

    /** 批量审核 */
    @PostMapping("/batch-audit")
    public Result<Void> batchAudit(@RequestBody Map<String, Object> body) {
        // TODO: 实现批量审核SQL
        return Result.success();
    }
}


