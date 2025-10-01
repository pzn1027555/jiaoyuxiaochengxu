package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniTeacherService;
import com.education.admin.modules.teacher.service.TeacherService;
import org.springframework.web.bind.annotation.PostMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@Slf4j
@RestController
@RequestMapping("/api/mini/teacher")
@RequiredArgsConstructor
public class MiniTeacherController {

    private final MiniTeacherService teacherService;
    private final TeacherService teacherDetailService;

    /** 推荐老师：teacher_info 中 is_recommended=1 且 is_hidden=0 */
    @GetMapping("/recommended")
    public Result<Object> recommended(@RequestParam(value = "limit", required = false, defaultValue = "8") Integer limit){
        return teacherService.recommended(limit);
    }

    /** 推荐老师完整列表（含全部推荐老师） */
    @GetMapping("/recommended/all")
    public Result<Object> recommendedAll(){
        return teacherService.recommendedList();
    }

    /** 学生收藏老师 */
    @PostMapping("/favorite")
    public Result<Object> favorite(@RequestParam("teacherId") Long teacherId, @RequestParam("action") String action){
        return teacherService.favorite(teacherId, action);
    }

    /** 查询是否已收藏 */
    @GetMapping("/favorite/status")
    public Result<Object> favoriteStatus(@RequestParam("teacherId") Long teacherId){
        return teacherService.favoriteStatus(teacherId);
    }

    /**
     * 兼容旧路径：/api/mini/teacher/{id}
     * 行为与 /api/teacher/{id} 一致，返回教师详情
     */
    @GetMapping("/{id}")
    public Result<Object> detailAlias(@PathVariable("id") Long id){
        try{
            var t = teacherDetailService.getTeacherById(id);
            if (t == null) return Result.error("教师不存在");
            return Result.success(t);
        }catch(Exception e){
            return Result.error("获取教师详情失败");
        }
    }
}



