package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import com.education.admin.modules.miniprogram.entity.ResearchPost;
import com.education.admin.modules.miniprogram.mapper.EmploymentPostMapper;
import com.education.admin.modules.miniprogram.mapper.ResearchPostMapper;
import com.education.admin.modules.miniprogram.service.MiniPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniPostServiceImpl implements MiniPostService {

    private final ResearchPostMapper researchPostMapper;
    private final EmploymentPostMapper employmentPostMapper;
    private final com.education.admin.modules.miniprogram.mapper.ResearchApplicationMapper researchApplicationMapper;

    @Override
    public Result<List<ResearchPost>> listResearchPosts() {
        List<ResearchPost> list = researchPostMapper.listPublished();
        return Result.success(list);
    }

    @Override
    public Result<List<EmploymentPost>> listEmploymentPosts() {
        List<EmploymentPost> list = employmentPostMapper.listPublished();
        return Result.success(list);
    }

    @Override
    public Result<Void> applyResearch(Long postId, Long teacherId) {
        com.education.admin.modules.miniprogram.entity.ResearchApplication app = new com.education.admin.modules.miniprogram.entity.ResearchApplication();
        app.setPostId(postId);
        app.setTeacherId(teacherId);
        researchApplicationMapper.insert(app);
        return Result.success();
    }
}



