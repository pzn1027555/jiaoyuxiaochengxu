package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/mini/search")
@RequiredArgsConstructor
public class MiniSearchController {

    private final MiniSearchService searchService;

    /**
     * 搜索老师：q 既可匹配老师名，也可匹配课程名以反查授课老师
     */
    @GetMapping("/teachers")
    public Result<Object> searchTeachers(@RequestParam(value = "q", required = false) String keyword,
                                         @RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
                                         @RequestParam(value = "size", required = false, defaultValue = "10") Integer size,
                                         @RequestParam(value = "subjectId", required = false) Long subjectId,
                                         @RequestParam(value = "province", required = false) String province,
                                         @RequestParam(value = "city", required = false) String city,
                                         @RequestParam(value = "district", required = false) String district) {
        return searchService.searchTeachers(keyword, page, size, subjectId, province, city, district);
    }
}


