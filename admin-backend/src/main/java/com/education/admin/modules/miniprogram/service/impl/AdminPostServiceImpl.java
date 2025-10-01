package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import com.education.admin.modules.miniprogram.entity.ResearchPost;
import com.education.admin.modules.miniprogram.mapper.EmploymentPostMapper;
import com.education.admin.modules.miniprogram.mapper.ResearchPostMapper;
import com.education.admin.modules.miniprogram.service.AdminPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPostServiceImpl implements AdminPostService {

    private final EmploymentPostMapper employmentPostMapper;
    private final ResearchPostMapper researchPostMapper;

    @Override
    public Result<List<EmploymentPost>> employmentList() {
        return Result.success(employmentPostMapper.listAll());
    }

    @Override
    public Result<Void> employmentCreate(EmploymentPost post) {
        if (post.getStatus() == null) post.setStatus(1);
        employmentPostMapper.insert(post);
        return Result.success();
    }

    @Override
    public Result<Void> employmentUpdate(EmploymentPost post) {
        employmentPostMapper.update(post);
        return Result.success();
    }

    @Override
    public Result<Void> employmentDelete(Long id) {
        employmentPostMapper.delete(id);
        return Result.success();
    }

    @Override
    public Result<List<ResearchPost>> researchList() {
        return Result.success(researchPostMapper.listAll());
    }

    @Override
    public Result<Void> researchCreate(ResearchPost post) {
        if (post.getStatus() == null) post.setStatus(1);
        researchPostMapper.insert(post);
        return Result.success();
    }

    @Override
    public Result<Void> researchUpdate(ResearchPost post) {
        researchPostMapper.update(post);
        return Result.success();
    }

    @Override
    public Result<Void> researchDelete(Long id) {
        researchPostMapper.delete(id);
        return Result.success();
    }
}



