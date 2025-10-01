package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.entity.LessonPriceConfig;
import com.education.admin.modules.system.service.LessonPriceConfigService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/system/lesson-price")
@RequiredArgsConstructor
public class LessonPriceConfigController {

    private final LessonPriceConfigService service;

    @GetMapping("/current")
    public Result<LessonPriceConfig> current(){
        LessonPriceConfig cfg = service.getCurrent();
        return Result.success(cfg);
    }

    @PostMapping("/save")
    public Result<LessonPriceConfig> save(@RequestBody SaveRequest req){
        if (req == null || req.getPrice() == null){
            return Result.badRequest("price 必填");
        }
        LessonPriceConfig cfg = service.upsert(req.getPrice(), req.getCurrency() == null ? "CNY" : req.getCurrency());
        return Result.success("保存成功", cfg);
    }

    @Data
    public static class SaveRequest{
        private BigDecimal price;
        private String currency;
    }
}


