package com.education.admin.modules.student.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 学生信息实体 - 对应student_info表
 */
@Data
public class Student {
    
    private Long id;
    
    private String studentNo;          // 学生编号
    
    private String studentName;        // 学生姓名
    
    private String phone;
    
    private String wxOpenid;          // 微信OpenID
    
    private String wxUnionid;         // 微信UnionID
    
    private String nickname;
    
    private String email;
    
    private String avatar;
    
    private Integer gender;           // 1-男 2-女
    
    private LocalDate birthDate;
    
    private String school;            // 学校
    
    private String province;
    
    private String city;
    
    private String district;
    
    private String address;
    
    private String introduction;      // 个人介绍
    
    private List<String> studentTags; // 学生标签列表
    
    private List<String> subjects;    // 感兴趣的科目列表
    
    private String grade;             // 年级
    
    // 家长姓名/电话不再存基础表，通过 parent_student_relation 关联查询
    private String parentName;
    private String parentPhone;
    
    private String studentLevel;      // 学生等级：bronze-铜牌，silver-银牌，gold-金牌
    
    // 注意：totalCourses/remainingCourses 不再是表字段，由查询动态计算
    private Integer totalCourses;     
    private Integer remainingCourses; 
    
    private BigDecimal totalAmount;   // 累计消费金额
    
    private BigDecimal avgUnitPrice;  // 平均客单价
    
    private LocalDateTime lastCourseTime; // 最后上课时间
    
    private Integer renewalReminderSent; // 续课提醒是否已发送
    
    private LocalDateTime renewalReminderTime; // 续课提醒时间
    
    private Integer complaintCount;   // 投诉次数
    
    // 满意度评分字段已移除
    
    private Integer referralCount;    // 推荐新学生数量
    
    private LocalDateTime lastLoginTime;
    
    private String lastLoginIp;
    
    private Integer isFirstLogin;     // 是否首次登录：1-是 0-否
    
    // status 字段已从表中移除
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}