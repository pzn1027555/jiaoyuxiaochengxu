package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

public interface MiniCourseService {
    Result<Object> list(Integer page, Integer size, String keyword, Long subjectId);
    Result<Object> detail(Long id);
}



