package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.entity.CourseBanner;
import com.education.admin.modules.system.entity.LearningSystemConfig;
import com.education.admin.modules.system.entity.LessonPriceConfig;
import com.education.admin.modules.system.service.CourseBannerService;
import com.education.admin.modules.system.service.LearningSystemConfigService;
import com.education.admin.modules.system.service.LessonPriceConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mini/system")
@RequiredArgsConstructor
public class MiniSystemController {

    private final LearningSystemConfigService learningSystemService;
    private final LessonPriceConfigService lessonPriceService;
    private final CourseBannerService courseBannerService;

    // 小程序查询可用学习体系
    @GetMapping("/learning-systems")
    public Result<List<LearningSystemConfig>> getEnabledLearningSystems(){
        return Result.success(learningSystemService.listEnabled());
    }

    // 小程序查询当前统一课时价格
    @GetMapping("/lesson-price")
    public Result<LessonPriceConfig> getLessonPrice(){
        return Result.success(lessonPriceService.getCurrent());
    }

    // 小程序课程页轮播图
    @GetMapping("/course-banners")
    public Result<List<CourseBanner>> getCourseBanners(){
        return Result.success(courseBannerService.listEnabled());
    }
}


