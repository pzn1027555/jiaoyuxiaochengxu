package com.education.admin.modules.teacher.service;

import com.education.admin.modules.teacher.entity.Teacher;
import com.github.pagehelper.PageInfo;

/**
 * 教师服务接口
 */
public interface TeacherService {
    
    /**
     * 分页查询教师列表
     */
    PageInfo<Teacher> getTeacherList(int pageNum, int pageSize, String name, Integer status, Integer risk);
    
    /**
     * 根据ID获取教师信息
     */
    Teacher getTeacherById(Long id);
    
    /**
     * 创建教师
     */
    Teacher createTeacher(Teacher teacher);
    
    /**
     * 更新教师信息
     */
    Teacher updateTeacher(Teacher teacher);
    void updateTeacherLevelOnly(Long teacherId, String level);
    
    /**
     * 审核教师
     */
    boolean auditTeacher(Long id, Integer status, String auditReason, Long auditUserId);
    
    /**
     * 删除教师
     */
    boolean deleteTeacher(Long id);

    /**
     * 增加抽查次数
     */
    boolean increaseCheckCount(Long id);

    /**
     * 标记合同已发送并设置合同URL
     */
    boolean markContractSent(Long teacherId, String contractUrl);

    /** 切换雪藏状态 */
    boolean toggleHidden(Long teacherId);

    /** 切换推荐状态 */
    boolean toggleRecommend(Long teacherId);

}