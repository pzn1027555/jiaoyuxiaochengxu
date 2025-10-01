package com.education.admin.modules.miniprogram.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudentNotification {
    private Long id;
    private Long studentId;
    private String userType; // student/parent
    private String type; // order-订单，system-系统，activity-活动，schedule-学习计划
    private String title;
    private String content;
    private Long relatedId; // 关联ID（如订单ID、学习计划ID）
    private Integer isRead; // 0-未读，1-已读
    private LocalDateTime readTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
