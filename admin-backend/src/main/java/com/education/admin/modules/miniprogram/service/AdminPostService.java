package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.EmploymentPost;
import com.education.admin.modules.miniprogram.entity.ResearchPost;

import java.util.List;

public interface AdminPostService {
    // Employment
    Result<List<EmploymentPost>> employmentList();
    Result<Void> employmentCreate(EmploymentPost post);
    Result<Void> employmentUpdate(EmploymentPost post);
    Result<Void> employmentDelete(Long id);

    // Research
    Result<List<ResearchPost>> researchList();
    Result<Void> researchCreate(ResearchPost post);
    Result<Void> researchUpdate(ResearchPost post);
    Result<Void> researchDelete(Long id);
}



