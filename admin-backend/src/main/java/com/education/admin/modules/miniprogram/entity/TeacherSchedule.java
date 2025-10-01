package com.education.admin.modules.miniprogram.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class TeacherSchedule {
    private Long id;
    private Long teacherId;
    private Long courseId; // 可为空
    private Long subjectId; // 科目分类ID（关联course_category.id）
    private String subjectName; // 科目名称（便于查询显示）
    private String title;  // 课程标题/名称
    private String classType; // one_to_one / small_class / big_class
    private Integer totalLessons; // 课时数
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String coverUrl;
    private Integer studentCount; // 预计/报名人数
    private String remark; // 单节课备注
    private String intro; // 课程介绍
    private String courseTags; // 课程标签(JSON数组字符串)
    private Integer status; // 1-正常 0-取消
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer durationMinutes; // 时长（分钟）
    private String teachMode; // online/offline
    private String address;
    private String province;
    private String city;
    private String district;
    private String detailAddress;
    private String contactPhone;

    // 学习计划扩展字段
    private Integer lessonNumber; // 第几节课（期）
    private String planId;        // 学习计划ID

    // 班课费用（元/课时）
    private BigDecimal lessonPrice;

    // 学生端展示扩展字段（非表字段）
    private String teacherName;

    // 确认状态
    private String confirmationStatus; // unconfirmed-未确认，confirmed-已确认付款
}


