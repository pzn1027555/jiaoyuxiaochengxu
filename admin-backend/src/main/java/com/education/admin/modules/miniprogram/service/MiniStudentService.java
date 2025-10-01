package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.List;
import java.util.Map;

public interface MiniStudentService {
    Result<List<Map<String, Object>>> getAllStudents(String keyword, Integer page, Integer size);
}


