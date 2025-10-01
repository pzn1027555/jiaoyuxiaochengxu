package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniStudentScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/mini/student/schedule")
@RequiredArgsConstructor
public class MiniStudentScheduleController {

    private final MiniStudentScheduleService service;

    @GetMapping("/day")
    public Result<java.util.Map<String,Object>> getDay(@RequestParam("date") String date,
                                                      @RequestParam(value = "studentId", required = false) Long studentId){
        return service.getDay(LocalDate.parse(date), studentId);
    }

    @GetMapping("/review")
    public Result<java.util.Map<String,Object>> getReview(@RequestParam("scheduleId") Long scheduleId){
        return service.getReview(scheduleId);
    }

    @PostMapping("/review/submit")
    public Result<Object> submitReview(@RequestBody java.util.Map<String, Object> body){
        Long scheduleId = null; String content = null; Integer starRating = null;
        try{ Object v = body.get("scheduleId"); if(v!=null) scheduleId = Long.valueOf(String.valueOf(v)); }catch(Exception ignored){}
        try{ Object v = body.get("content"); if(v!=null) content = String.valueOf(v); }catch(Exception ignored){}
        try{ Object v = body.get("starRating"); if(v!=null) starRating = Integer.valueOf(String.valueOf(v)); }catch(Exception ignored){}
        return service.submitReview(scheduleId, content, starRating);
    }
}
