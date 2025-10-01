package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.dto.TeacherStudentResponse;

public interface MiniTeacherStudentService {
    Result<TeacherStudentResponse> getMyStudents();
    Result<TeacherStudentResponse> getStudentsByTeacherId(Long teacherId);
}


