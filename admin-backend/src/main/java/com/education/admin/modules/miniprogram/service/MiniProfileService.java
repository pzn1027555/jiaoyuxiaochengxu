package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.dto.TeacherStudentResponse;
import com.education.admin.modules.miniprogram.dto.SubjectCategoryResponse;
import com.education.admin.modules.miniprogram.dto.UserProfileRequest;

/**
 * 小程序用户资料服务接口
 */
public interface MiniProfileService {
    
    /**
     * 获取用户资料
     */
    Result<Object> getUserProfile();

    /**
     * 仅学生资料
     */
    Result<Object> getStudentProfile();

    /**
     * 仅家长资料
     */
    Result<Object> getParentProfile();
    
    /**
     * 更新用户资料
     */
    Result<Object> updateUserProfile(UserProfileRequest request);
    
    /**
     * 获取教师的学生列表
     */
    Result<TeacherStudentResponse> getTeacherStudents();
    
    /**
     * 获取科目分类列表（两级结构）
     */
    Result<SubjectCategoryResponse> getSubjectCategories();

    // 学生账户余额功能已移除

    /** 学生关注老师数量 */
    Result<Integer> getStudentFollowedTeachersCount();

    /** 学生课程数量（按 plan_id 去重） */
    Result<Integer> getStudentCourseCount();
}
