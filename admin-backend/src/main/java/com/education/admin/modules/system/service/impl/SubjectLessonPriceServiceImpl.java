package com.education.admin.modules.system.service.impl;

import com.education.admin.modules.system.entity.SubjectLessonPrice;
import com.education.admin.modules.system.mapper.SubjectLessonPriceMapper;
import com.education.admin.modules.system.service.SubjectLessonPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 学科课时价格配置Service实现类
 */
@Service
public class SubjectLessonPriceServiceImpl implements SubjectLessonPriceService {

    @Autowired
    private SubjectLessonPriceMapper subjectLessonPriceMapper;

    @Override
    public SubjectLessonPrice getById(Long id) {
        return subjectLessonPriceMapper.selectById(id);
    }

    @Override
    public List<SubjectLessonPrice> getAllPriceList() {
        return subjectLessonPriceMapper.selectAll();
    }

    @Override
    public SubjectLessonPrice getBySubjectId(Long subjectId) {
        return subjectLessonPriceMapper.selectBySubjectId(subjectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveOrUpdatePrice(SubjectLessonPrice subjectLessonPrice) {
        // 检查是否已存在该学科的价格配置
        SubjectLessonPrice existing = getBySubjectId(subjectLessonPrice.getSubjectId());
        
        if (existing != null && !existing.getId().equals(subjectLessonPrice.getId())) {
            throw new RuntimeException("该学科已存在价格配置");
        }
        
        if (subjectLessonPrice.getId() != null) {
            // 更新
            return subjectLessonPriceMapper.updateById(subjectLessonPrice) > 0;
        } else {
            // 新增
            return subjectLessonPriceMapper.insert(subjectLessonPrice) > 0;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deletePrice(Long id) {
        return subjectLessonPriceMapper.deleteById(id) > 0;
    }
}

