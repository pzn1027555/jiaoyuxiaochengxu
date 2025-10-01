package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

public interface MiniNotificationService {
    Result<java.util.List<java.util.Map<String,Object>>> list();
    Result<Object> markRead(Long id);
    Result<Object> markAll();
}


