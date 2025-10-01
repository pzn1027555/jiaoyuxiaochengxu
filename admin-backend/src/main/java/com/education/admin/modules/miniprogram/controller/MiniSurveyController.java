package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniSurveyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/survey")
@RequiredArgsConstructor
public class MiniSurveyController {

    private final MiniSurveyService surveyService;

    @GetMapping("/{studentId}")
    public Result<Object> get(@PathVariable Long studentId,
                              @RequestParam(required = false) Long teacherId){
        return surveyService.getByStudent(studentId, teacherId);
    }

    @PostMapping("/save")
    public Result<Object> save(@RequestBody Map<String,Object> payload){
        return surveyService.save(payload);
    }

    // 新增：创建预约（不覆盖问卷）
    @PostMapping("/booking/create")
    public Result<Object> createBooking(@RequestBody Map<String,Object> payload){
        return surveyService.createBooking(payload);
    }

    // 新增：提交问卷明细，返回 detailId；student_survey 仅关联 detailId
    @PostMapping("/detail/create")
    public Result<Object> createDetail(@RequestBody Map<String,Object> payload){
        return surveyService.createSurveyDetail(payload);
    }

    @GetMapping("/count")
    public Result<Object> getBookingCount(@RequestParam Long teacherId,
                                          @RequestParam Long studentId,
                                          @RequestParam(required = false) String bookingType){
        return surveyService.getBookingCount(teacherId, studentId, bookingType);
    }

    @PostMapping("/create-booking-with-detail")
    public Result<Object> createBookingWithDetail(@RequestBody Map<String,Object> payload){
        return surveyService.createBookingWithDetail(payload);
    }

    @GetMapping("/detail/check")
    public Result<Object> checkStudentSurveyDetail(@RequestParam Long studentId){
        return surveyService.checkStudentSurveyDetail(studentId);
    }

    /**
     * 预约/问卷列表：供“课程预约”页使用
     * 返回字段：id, studentId, name, avatar, courseTitle, timeDesc(格式化create_time), status
     * 支持前端显式传入 teacherId 或 phone（优先使用），避免依赖JWT解析。
     */
    @GetMapping("/list")
    public Result<Object> list(@RequestParam(required = false) Long teacherId,
                               @RequestParam(required = false) String phone){
        return surveyService.listForBooking(teacherId, phone);
    }

    // 状态更新：同意/拒绝
    @PostMapping("/{id}/approve")
    public Result<Object> approve(@PathVariable Long id){
        return surveyService.updateStatus(id, 1, null);
    }

    @PostMapping("/{id}/reject")
    public Result<Object> reject(@PathVariable Long id, @RequestBody Map<String,Object> body){
        String reason = body==null? null : String.valueOf(body.getOrDefault("reason",""));
        return surveyService.updateStatus(id, 2, reason);
    }
}


