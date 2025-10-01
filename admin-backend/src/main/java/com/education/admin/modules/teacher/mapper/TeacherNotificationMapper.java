package com.education.admin.modules.teacher.mapper;

import com.education.admin.modules.teacher.entity.TeacherNotification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 教师通知Mapper接口
 *
 * @author education
 * @since 2025-08-16
 */
@Mapper
public interface TeacherNotificationMapper {
    
    /**
     * 插入通知
     */
    int insertNotification(TeacherNotification notification);
    
    /**
     * 根据教师ID查询通知列表
     */
    List<TeacherNotification> selectByTeacherId(@Param("teacherId") Long teacherId);
    
    /**
     * 根据教师ID查询未读通知数量
     */
    int countUnreadByTeacherId(@Param("teacherId") Long teacherId);
    
    /**
     * 标记通知为已读
     */
    int markAsRead(@Param("id") Long id, @Param("teacherId") Long teacherId);
    
    /**
     * 批量标记通知为已读
     */
    int markAllAsRead(@Param("teacherId") Long teacherId);
    
    /**
     * 根据ID查询通知详情
     */
    TeacherNotification selectById(@Param("id") Long id);
    
    /**
     * 删除通知
     */
    int deleteById(@Param("id") Long id);
}
