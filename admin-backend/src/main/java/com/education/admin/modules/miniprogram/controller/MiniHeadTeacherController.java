package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniHeadTeacherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/mini/head-teacher")
@RequiredArgsConstructor
public class MiniHeadTeacherController {

    private final MiniHeadTeacherService headTeacherService;

    /** 获取当前启用的班主任二维码与信息 */
    @GetMapping("/current")
    public Result<java.util.Map<String,Object>> current(){
        return headTeacherService.getCurrent();
    }

    /** 学生端：返回已绑定班主任；若无则随机绑定一个启用的 */
    @GetMapping("/my")
    public Result<java.util.Map<String,Object>> my(){
        return headTeacherService.my();
    }
}


