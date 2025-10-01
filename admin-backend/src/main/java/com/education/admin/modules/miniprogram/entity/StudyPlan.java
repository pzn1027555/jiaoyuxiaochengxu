package com.education.admin.modules.miniprogram.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StudyPlan {
    private Long id;
    private String planCode; // 计划编码，用于关联teacher_schedule
    private Long teacherId; // 教师ID
    private Long studentId; // 学生ID
    private String title; // 学习计划标题
    private Integer totalLessons; // 总课时数
    private BigDecimal unitPrice; // 每节课价格
    private BigDecimal totalAmount; // 总金额
    // 页面填写字段
    private Long subjectId;
    private String subjectName;
    private java.time.LocalDate startDate;
    private java.time.LocalTime startTime; // HH:mm:ss
    private Integer durationMinutes;
    private String repeatType; // daily/every3days/every5days/weekly/monthly
    private String classType;  // one_to_one/big_class
    private String teachMode;  // online/offline
    private String coverUrl;
    private String tags;       // JSON
    private String intro;      // 文本
    private String confirmationStatus; // 确认状态：unconfirmed-未确认，confirmed-已确认付款
    private Long orderId; // 关联的订单ID
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // 扩展字段（非表字段）
    private String teacherName;
}
