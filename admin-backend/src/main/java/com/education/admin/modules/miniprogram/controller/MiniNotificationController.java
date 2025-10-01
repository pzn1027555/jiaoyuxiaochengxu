package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mini/notification")
@RequiredArgsConstructor
public class MiniNotificationController {

    private final MiniNotificationService notificationService;

    @GetMapping("/list")
    public Result<java.util.List<java.util.Map<String,Object>>> list(){
        return notificationService.list();
    }

    @PostMapping("/read")
    public Result<Object> markRead(@RequestParam("id") Long id){
        return notificationService.markRead(id);
    }

    @PostMapping("/read/all")
    public Result<Object> markAll(){
        return notificationService.markAll();
    }
}

