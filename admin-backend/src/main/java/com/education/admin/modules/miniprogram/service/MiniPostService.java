package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import com.education.admin.modules.miniprogram.entity.ResearchPost;

import java.util.List;

public interface MiniPostService {
    Result<List<ResearchPost>> listResearchPosts();
    Result<List<EmploymentPost>> listEmploymentPosts();
    Result<Void> applyResearch(Long postId, Long teacherId);
}



