package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 小程序教师通知Mapper接口
 */
@Mapper
public interface MiniTeacherNotificationMapper {

    /**
     * 插入新的通知
     * @param params 通知参数
     * @return 插入行数
     */
    int insertNotification(Map<String, Object> params);

    /**
     * 根据教师ID获取通知列表
     * @param teacherId 教师ID
     * @param pageSize 页面大小
     * @param offset 偏移量
     * @return 通知列表
     */
    List<Map<String, Object>> getNotificationsByTeacherId(@Param("teacherId") Long teacherId,
                                                          @Param("pageSize") Integer pageSize,
                                                          @Param("offset") Integer offset);

    /**
     * 统计教师未读通知数量
     * @param teacherId 教师ID
     * @return 未读通知数量
     */
    int countUnreadNotifications(@Param("teacherId") Long teacherId);

    /**
     * 标记通知为已读
     * @param id 通知ID
     * @param teacherId 教师ID
     * @return 更新行数
     */
    int markAsRead(@Param("id") Long id, @Param("teacherId") Long teacherId);

    /**
     * 批量标记通知为已读
     * @param teacherId 教师ID
     * @return 更新行数
     */
    int markAllAsRead(@Param("teacherId") Long teacherId);
}
