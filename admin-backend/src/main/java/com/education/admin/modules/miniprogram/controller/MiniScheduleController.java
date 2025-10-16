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
    public Result<Object> day(@RequestParam(required = false) String date,
                              @RequestParam(required = false) Long teacherId) {
        return scheduleService.getDaySchedule(date, teacherId);
    }

    @GetMapping("/month")
    public Result<Object> month(@RequestParam String month,
                                @RequestParam(required = false) Long teacherId) {
        return scheduleService.getMonthSchedule(month, teacherId);
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

  /**
   * 获取指定排课的教师中期报告（feedback_type=midterm）。
   * 若不存在中期报告，则回退返回任意教师反馈（兼容旧数据）。
   */
  @GetMapping("/{id}/feedback/midterm")
  public Result<Object> getMidterm(@PathVariable Long id){
    // 直接复用 service 的 getFeedback，前端据 feedbackType 判断；
    // 若需要强制仅返回 midterm，可在 service/mapper 层新增按类型查询方法。
    return scheduleService.getFeedback(id);
  }

  @PostMapping("/{id}/feedback")
  public Result<Object> submitFeedback(@PathVariable Long id, @RequestBody(required = false) Map<String,Object> body){
    String content = body==null? null : String.valueOf(body.getOrDefault("content", ""));
    String type = null;
    try{ if(body!=null){ Object v = body.get("feedbackType"); if(v!=null) type = String.valueOf(v); } }catch(Exception ignored){}
    return scheduleService.submitFeedback(id, content, type);
  }
}


