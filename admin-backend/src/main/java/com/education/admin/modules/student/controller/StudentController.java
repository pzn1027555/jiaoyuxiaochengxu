package com.education.admin.modules.student.controller;

import com.education.admin.common.Result;
import com.github.pagehelper.PageInfo;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 学生管理（对接 admin-frontend/src/api/student.js）
 * 路由前缀与 axios baseURL("/api") 对齐：/api/student/**
 */
@RestController
@RequestMapping("/api/student")
public class StudentController {

    // 分页查询学生列表
    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.student.mapper.StudentMapper studentMapper;

    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper parentStudentRelationMapper;

    @org.springframework.beans.factory.annotation.Autowired
    private com.education.admin.modules.miniprogram.mapper.StudentNotificationMapper studentNotificationMapper;

    @org.springframework.beans.factory.annotation.Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @GetMapping("/list")
    public Result<PageInfo<java.util.Map<String,Object>>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String studentLevel,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) java.time.LocalDateTime startTime,
            @RequestParam(required = false) java.time.LocalDateTime endTime
    ){
        com.github.pagehelper.PageHelper.startPage(pageNum, pageSize);
        List<com.education.admin.modules.student.entity.Student> rows = studentMapper.findByPage(
                studentName, studentLevel, status, phone, province, city, district, startTime, endTime
        );
        // 组装返回 Map 并追加家长信息
        java.util.List<java.util.Map<String,Object>> list = new java.util.ArrayList<>();
        for (var s : rows) {
            java.util.Map<String,Object> m = objectMapper.convertValue(s, java.util.Map.class);
            try {
                java.util.List<java.util.Map<String,Object>> parents = parentStudentRelationMapper.getParentsByStudentId(s.getId());
                m.put("parents", parents == null ? java.util.Collections.emptyList() : parents);
            } catch (Exception ignored) { m.put("parents", java.util.Collections.emptyList()); }
            list.add(m);
        }
        PageInfo<java.util.Map<String,Object>> page = new PageInfo<>(list);
        page.setPageNum(pageNum); page.setPageSize(pageSize);
        return Result.success(page);
    }

    // 获取学生详情
    @GetMapping("/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id){
        com.education.admin.modules.student.entity.Student s = studentMapper.findById(id);
        if (s == null) return Result.error("未找到学生");
        java.util.Map<String,Object> map = objectMapper.convertValue(s, java.util.Map.class);
        return Result.success(map);
    }

    // 需要续课提醒的学生
    @GetMapping("/renewal-reminder")
    public Result<List<Map<String, Object>>> renewalReminder(@RequestParam(defaultValue = "10") Integer reminderThreshold){
        return Result.success(java.util.List.of());
    }

    // 紧急续课提醒
    @GetMapping("/urgent-renewal")
    public Result<List<Map<String, Object>>> urgentRenewal(){
        return Result.success(java.util.List.of());
    }

    // 普通续课提醒
    @GetMapping("/normal-renewal")
    public Result<List<Map<String, Object>>> normalRenewal(){
        return Result.success(java.util.List.of());
    }

    // 按等级查询
    @GetMapping("/level/{level}")
    public Result<List<Map<String, Object>>> listByLevel(@PathVariable String level){
        return Result.success(java.util.List.of());
    }

    // 活跃学生
    @GetMapping("/active")
    public Result<List<Map<String, Object>>> active(@RequestParam(defaultValue = "30") Integer days){
        return Result.success(java.util.List.of());
    }

    // 创建学生
    @PostMapping
    public Result<Void> create(@RequestBody Map<String, Object> body){
        return Result.success();
    }

    // 更新学生
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body){
        return Result.success();
    }

    // 更新学生等级
    @PostMapping("/update-level")
    public Result<Void> updateLevel(@RequestBody Map<String, Object> body){
        Long id = body.get("id") == null ? null : Long.valueOf(String.valueOf(body.get("id")));
        String level = body.get("studentLevel") == null ? null : String.valueOf(body.get("studentLevel"));
        if (id == null || level == null || level.isEmpty()) return Result.error("参数缺失");
        int n = studentMapper.updateLevel(id, level);
        if (n > 0) return Result.success();
        return Result.error("更新失败");
    }

    // 批量更新学生等级
    @PostMapping("/batch-update-level")
    public Result<Void> batchUpdateLevel(@RequestBody Map<String, Object> body){
        return Result.success();
    }

    // 更新剩余课程数
    @PostMapping("/{id}/update-courses")
    public Result<Void> updateCourses(@PathVariable Long id, @RequestParam Integer remainingCourses){
        return Result.success();
    }

    // 发送续课提醒
    @PostMapping("/send-renewal-reminder")
    public Result<Void> sendRenewalReminder(@RequestBody Map<String, Object> body){
        try{
            Long studentId = body.get("studentId") == null ? null : Long.valueOf(String.valueOf(body.get("studentId")));
            if (studentId == null) return Result.error("studentId 缺失");

            String title = "提醒";
            String content = "您的余额已不足，请及时充值";
            // 学生通知
            studentNotificationMapper.insert(studentId, "student", "money", title, content, null);
            // 家长通知（所有绑定家长的子女上下文使用 studentId）
            java.util.List<java.util.Map<String,Object>> parents = parentStudentRelationMapper.getParentsByStudentId(studentId);
            if (parents != null && !parents.isEmpty()) {
                for (int i = 0; i < parents.size(); i++) {
                    studentNotificationMapper.insert(studentId, "parent", "money", title, content, null);
                }
            }
            return Result.success();
        }catch(Exception e){
            return Result.error(e.getMessage());
        }
    }

    // 标记提醒已发送
    @PostMapping("/mark-reminder-sent")
    public Result<Void> markReminderSent(@RequestBody List<Long> studentIds){
        return Result.success();
    }

    // 重置续课提醒状态
    @PostMapping("/{id}/reset-reminder")
    public Result<Void> resetReminder(@PathVariable Long id){
        return Result.success();
    }

    // 增加投诉次数
    @PostMapping("/{id}/complaint")
    public Result<Void> increaseComplaint(@PathVariable Long id){
        return Result.success();
    }

    // 增加推荐次数
    @PostMapping("/{id}/referral")
    public Result<Void> increaseReferral(@PathVariable Long id){
        return Result.success();
    }

    // 更新学生状态
    @PostMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status){
        return Result.success();
    }

    // 批量更新状态
    @PostMapping("/batch-update-status")
    public Result<Void> batchUpdateStatus(@RequestBody Map<String, Object> body){
        return Result.success();
    }

    // 删除学生
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id){
        return Result.success();
    }

    // 统计
    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics(){
        Map<String, Object> data = new HashMap<>();
        data.put("total", 1161);
        data.put("active", 830);
        data.put("pendingRenewal", 120);
        data.put("complaints", 15);
        data.put("avgOrderAmount", new BigDecimal("256.30"));
        return Result.success(data);
    }

    // 地区分布
    @GetMapping("/distribution/region")
    public Result<List<Map<String, Object>>> regionDistribution(){
        List<Map<String, Object>> list = new ArrayList<>();
        String[] provinces = {"北京","上海","广东","江苏","浙江"};
        for(String p: provinces){
            Map<String,Object> m = new HashMap<>();
            m.put("name", p);
            m.put("value", (int)(Math.random()*200)+50);
            list.add(m);
        }
        return Result.success(list);
    }

    // 等级分布
    @GetMapping("/distribution/level")
    public Result<List<Map<String, Object>>> levelDistribution(){
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("level","bronze","count",450));
        list.add(Map.of("level","silver","count",320));
        list.add(Map.of("level","gold","count",180));
        return Result.success(list);
    }

    // 状态分布
    @GetMapping("/distribution/status")
    public Result<List<Map<String, Object>>> statusDistribution(){
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("status","在读","count",900));
        list.add(Map.of("status","暂停","count",120));
        list.add(Map.of("status","毕业","count",141));
        return Result.success(list);
    }

    // 消费分析
    @GetMapping("/analysis/consumption")
    public Result<Map<String, Object>> consumptionAnalysis(){
        Map<String,Object> data = new HashMap<>();
        data.put("totalAmount", new BigDecimal("125670.50"));
        data.put("avgAmount", new BigDecimal("268.90"));
        data.put("topStudents", List.of(
                Map.of("studentName","张三","amount",new BigDecimal("3560.00")),
                Map.of("studentName","李四","amount",new BigDecimal("2890.00"))
        ));
        return Result.success(data);
    }

    // 自动等级升级（占位）
    @PostMapping("/auto-upgrade-levels")
    public Result<Void> autoUpgradeLevels(){
        return Result.success();
    }

    // 自动发送续课提醒（占位）
    @PostMapping("/auto-send-reminders")
    public Result<Void> autoSendReminders(){
        return Result.success();
    }

    // 删除 mock 工具方法
}


