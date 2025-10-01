package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface MiniTeacherResourceService {
    Result<Object> list(String type, Integer page, Integer size, Long teacherId);
    Result<Object> create(Map<String, Object> payload);
    Result<Object> update(Long id, Map<String, Object> payload);
    Result<Object> detail(Long id);
    Result<Object> delete(Long id);
}


