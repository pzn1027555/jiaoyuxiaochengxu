package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.mapper.HeadTeacherMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/head-teacher")
@RequiredArgsConstructor
public class AdminHeadTeacherController {

    private final HeadTeacherMapper headTeacherMapper;

    @GetMapping("/list")
    public Result<List<Map<String,Object>>> list(){
        return Result.success(headTeacherMapper.listAll());
    }

    @PostMapping("/save")
    public Result<String> save(@RequestBody Map<String,Object> body){
        // 默认启用：如果前端未传或传入非法，统一置 1
        Object status = body.get("status");
        if(!(status instanceof Number) || (((Number) status).intValue() != 0 && ((Number) status).intValue() != 1)){
            body.put("status", 1);
        }
        if(body.get("id")==null){ headTeacherMapper.insert(body); }
        else { headTeacherMapper.update(body); }
        return Result.success("OK");
    }

    @PostMapping("/enable")
    public Result<String> enable(@RequestParam("id") Long id){
        headTeacherMapper.disableAll();
        headTeacherMapper.updateStatus(id, 1);
        return Result.success("OK");
    }

    @PostMapping("/status")
    public Result<String> status(@RequestParam("id") Long id,
                                 @RequestParam("status") Integer status){
        if(status == null || (status != 0 && status != 1)){
            return Result.error("invalid status");
        }
        if(status == 1){
            headTeacherMapper.disableAll();
        }
        headTeacherMapper.updateStatus(id, status);
        return Result.success("OK");
    }

    @PostMapping("/delete")
    public Result<String> delete(@RequestParam("id") Long id){
        headTeacherMapper.deleteById(id);
        return Result.success("OK");
    }
}


