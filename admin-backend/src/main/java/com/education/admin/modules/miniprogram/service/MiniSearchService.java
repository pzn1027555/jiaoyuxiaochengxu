package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

public interface MiniSearchService {
    Result<Object> searchTeachers(String keyword, Integer page, Integer size, Long subjectId, String province, String city, String district);
}


