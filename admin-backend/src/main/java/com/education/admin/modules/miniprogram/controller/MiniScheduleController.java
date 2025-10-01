package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/teacher/schedule")
@RequiredArgsConstructor
public class MiniScheduleController {

    private final MiniScheduleService scheduleService;

    @GetMapping("/day")
    public Result<Object> day(@RequestParam(required = false) String date) {
        return scheduleService.getDaySchedule(date);
    }

    @GetMapping("/month")
    public Result<Object> month(@RequestParam String month) {
        return scheduleService.getMonthSchedule(month);
    }

    @PostMapping("/create")
    public Result<Object> create(@RequestBody Map<String, Object> payload) {
        return scheduleService.create(payload);
    }

    @PutMapping("/{id}/time")
    public Result<Object> updateTime(@PathVariable Long id,
                                     @RequestBody Map<String, String> body) {
        return scheduleService.updateTime(id, body.get("startTime"), body.get("endTime"));
    }

    @PutMapping("/{id}")
    public Result<Object> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return scheduleService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    public Result<Object> delete(@PathVariable Long id) {
        return scheduleService.delete(id);
    }

  @GetMapping("/{id}")
  public Result<Object> detail(@PathVariable Long id) {
    return scheduleService.detail(id);
  }

  /**
   * 创建学习计划：根据开始日期/时间、时长、课时与重复规则批量生成课程
   */
  @PostMapping("/plan")
  public Result<Object> createPlan(@RequestBody Map<String, Object> payload) {
    return scheduleService.createPlan(payload);
  }

  @GetMapping("/{id}/feedback")
  public Result<Object> getFeedback(@PathVariable Long id){
    return scheduleService.getFeedback(id);
  }

  @PostMapping("/{id}/feedback")
  public Result<Object> submitFeedback(@PathVariable Long id, @RequestBody Map<String,Object> body){
    return scheduleService.submitFeedback(id, String.valueOf(body.get("content")));
  }
}


