package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;

import java.util.Map;

public interface MiniInviteService {
    Result<Map<String, Object>> generateStudentInviteCode();
    Result<Map<String, Object>> generateStudentBindCode();
    Result<Map<String, Object>> generateParentInviteCode();
    Result<Map<String, Object>> generateParentBindCode();
    Result<String> acceptInviteCode(String code);
    Result<String> acceptBindCode(String code);
    Result<java.util.List<java.util.Map<String,Object>>> listInvited();
}


