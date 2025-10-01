package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface EmploymentApplicationService {
    Result<Void> apply(Long postId, Long teacherId, String resumeUrl, String resumeName, Long resumeSize);

    com.github.pagehelper.PageInfo<java.util.Map<String, Object>> adminList(Integer page, Integer size, Long postId, Long teacherId);
}


