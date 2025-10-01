package com.education.admin.modules.miniprogram.service;

import com.education.admin.common.Result;
import java.util.Map;

/**
 * 学生收藏服务接口
 */
public interface MiniStudentFavoriteService {
    
    /**
     * 获取学生收藏的教师列表
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 教师列表分页结果
     */
    Result<Map<String, Object>> getFavoriteTeachers(Integer pageNum, Integer pageSize);
    
    /**
     * 获取学生点赞的帖子列表
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 帖子列表分页结果
     */
    Result<Map<String, Object>> getLikedPosts(Integer pageNum, Integer pageSize);
}
