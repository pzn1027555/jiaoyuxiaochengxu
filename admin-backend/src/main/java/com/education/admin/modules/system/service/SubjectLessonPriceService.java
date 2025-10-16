package com.education.admin.modules.system.service;

import com.education.admin.modules.system.entity.SubjectLessonPrice;

import java.util.List;

/**
 * 学科课时价格配置Service接口
 */
public interface SubjectLessonPriceService {
    
    /**
     * 根据ID获取学科价格配置
     */
    SubjectLessonPrice getById(Long id);
    
    /**
     * 获取所有学科价格配置列表
     */
    List<SubjectLessonPrice> getAllPriceList();
    
    /**
     * 根据学科ID获取价格配置
     */
    SubjectLessonPrice getBySubjectId(Long subjectId);
    
    /**
     * 保存或更新学科价格配置
     */
    boolean saveOrUpdatePrice(SubjectLessonPrice subjectLessonPrice);
    
    /**
     * 删除学科价格配置
     */
    boolean deletePrice(Long id);
}

