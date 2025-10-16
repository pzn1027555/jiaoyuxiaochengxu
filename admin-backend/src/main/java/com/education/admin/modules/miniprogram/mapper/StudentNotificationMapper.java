package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface StudentNotificationMapper {
    List<Map<String,Object>> list(@Param("studentId") Long studentId,
                                  @Param("studentIds") List<Long> studentIds,
                                  @Param("userType") String userType);

    int markRead(@Param("id") Long id,
                 @Param("studentId") Long studentId,
                 @Param("studentIds") List<Long> studentIds,
                 @Param("userType") String userType);

    int markAll(@Param("studentId") Long studentId,
                @Param("studentIds") List<Long> studentIds,
                @Param("userType") String userType);

    int insert(@Param("studentId") Long studentId,
               @Param("userType") String userType,
               @Param("type") String type,
               @Param("title") String title,
               @Param("content") String content,
               @Param("relatedId") Long relatedId);
    
    /**
     * 统计未读通知数量
     */
    int countUnread(@Param("studentId") Long studentId,
                    @Param("userType") String userType);
}


