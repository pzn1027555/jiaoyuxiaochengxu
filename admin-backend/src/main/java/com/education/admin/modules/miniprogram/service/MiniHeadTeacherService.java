package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

public interface MiniHeadTeacherService {
    Result<java.util.Map<String,Object>> getCurrent();
    Result<java.util.Map<String,Object>> my();
}


