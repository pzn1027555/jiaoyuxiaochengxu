package com.education.admin.modules.system.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.system.entity.SubjectLessonPrice;
import com.education.admin.modules.system.service.SubjectLessonPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 学科课时价格配置Controller
 */
@RestController
@RequestMapping("/admin/system/subjectPrice")
public class SubjectLessonPriceController {

    @Autowired
    private SubjectLessonPriceService subjectLessonPriceService;

    /**
     * 获取所有学科价格配置列表
     */
    @GetMapping("/list")
    public Result<List<SubjectLessonPrice>> list() {
        List<SubjectLessonPrice> list = subjectLessonPriceService.getAllPriceList();
        return Result.success(list);
    }

    /**
     * 根据ID获取学科价格配置详情
     */
    @GetMapping("/detail/{id}")
    public Result<SubjectLessonPrice> detail(@PathVariable Long id) {
        SubjectLessonPrice price = subjectLessonPriceService.getById(id);
        if (price == null) {
            return Result.error("学科价格配置不存在");
        }
        return Result.success(price);
    }

    /**
     * 根据学科ID获取价格配置
     */
    @GetMapping("/getBySubjectId/{subjectId}")
    public Result<SubjectLessonPrice> getBySubjectId(@PathVariable Long subjectId) {
        SubjectLessonPrice price = subjectLessonPriceService.getBySubjectId(subjectId);
        return Result.success(price);
    }

    /**
     * 保存或更新学科价格配置
     */
    @PostMapping("/saveOrUpdate")
    public Result<String> saveOrUpdate(@RequestBody SubjectLessonPrice subjectLessonPrice) {
        try {
            boolean success = subjectLessonPriceService.saveOrUpdatePrice(subjectLessonPrice);
            if (success) {
                return Result.success("保存成功");
            } else {
                return Result.error("保存失败");
            }
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除学科价格配置
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean success = subjectLessonPriceService.deletePrice(id);
        if (success) {
            return Result.success("删除成功");
        } else {
            return Result.error("删除失败");
        }
    }
}

