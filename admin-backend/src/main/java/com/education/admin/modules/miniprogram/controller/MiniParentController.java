package com.education.admin.modules.miniprogram.controller;

import com.education.admin.modules.miniprogram.service.MiniParentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 小程序家长控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/parent")
public class MiniParentController {

    @Autowired
    private MiniParentService miniParentService;

    /**
     * 获取当前学生绑定的家长列表
     */
    @GetMapping("/bind-list")
    public Map<String, Object> getBindParents() {
        log.info("Getting bind parents list");
        try {
            List<Map<String, Object>> parents = miniParentService.getBindParents();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", parents);
            response.put("message", "获取绑定家长列表成功");
            return response;
        } catch (Exception e) {
            log.error("Error getting bind parents list", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }

    /** 学习统计（家长绑定的所有学生聚合） */
    @GetMapping("/stats")
    public Map<String, Object> getParentStudyStats(
            @RequestParam(value = "period", required = false) String period,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "studentId", required = false) Long studentId
    ){
        try {
            Map<String, Object> data = miniParentService.getParentStudyStats(period, phone, studentId);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("data", data);
            return res;
        } catch (Exception e) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("message", e.getMessage());
            return res;
        }
    }

    /** 家长端：获取我绑定的学生列表（子女列表） */
    @GetMapping("/students")
    public Map<String,Object> getStudents(){
        Map<String,Object> resp = new HashMap<>();
        try{
            java.util.List<java.util.Map<String,Object>> list = ((com.education.admin.modules.miniprogram.service.impl.MiniParentServiceImpl)miniParentService).getStudentsOfCurrentParent();
            resp.put("success", true);
            resp.put("data", list);
        }catch(Exception e){
            resp.put("success", false);
            resp.put("message", e.getMessage());
        }
        return resp;
    }

    /** 家长端：按月获取孩子课程反馈/中期报告列表 */
    @GetMapping("/feedback/list")
    public Map<String,Object> getChildFeedback(
            @RequestParam("studentId") Long studentId,
            @RequestParam("month") String month, // YYYY-MM
            @RequestParam(value = "type", required = false) String type // teacher_daily | midterm | all
    ){
        Map<String,Object> resp = new HashMap<>();
        try{
            java.util.List<java.util.Map<String,Object>> list = ((com.education.admin.modules.miniprogram.service.impl.MiniParentServiceImpl)miniParentService)
                    .listStudentFeedbackByMonth(studentId, month, type);
            resp.put("success", true);
            resp.put("data", list);
        }catch(Exception e){
            resp.put("success", false);
            resp.put("message", e.getMessage());
        }
        return resp;
    }
}
