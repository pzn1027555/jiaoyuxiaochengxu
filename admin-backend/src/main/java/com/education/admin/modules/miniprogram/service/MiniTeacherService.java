package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

public interface MiniTeacherService {
    Result<Object> recommended(Integer limit);
    Result<Object> recommendedList();
    Result<Object> favorite(Long teacherId, String action);
    Result<Object> favoriteStatus(Long teacherId);
}



