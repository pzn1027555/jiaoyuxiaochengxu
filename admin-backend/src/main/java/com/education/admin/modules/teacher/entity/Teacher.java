package com.education.admin.modules.teacher.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 教师信息实体 - 对应teacher_info表
 */
@Data
public class Teacher {
    
    private Long id;
    
    private String teacherNo;           // 教师编号
    
    private String teacherName;         // 教师姓名
    
    private String phone;
    
    private String wxOpenid;           // 微信OpenID
    
    private String wxUnionid;          // 微信UnionID
    
    private String nickname;
    
    private String email;
    
    private String idCard;
    
    private String avatar;
    
    private Integer gender;            // 1-男 2-女
    
    private LocalDate birthDate;
    
    // 教师基本表不再存教育信息，以下为认证表派生字段
    private String certEducation;       // 学历（来自 teacher_certification 最新记录）
    private String certGraduateSchool;  // 毕业学校（来自认证表）
    private String certMajor;           // 专业（来自认证表）
    
    private Integer teachingExperience; // 教学经验(年)
    
    private String introduction;        // 个人介绍
    
    private String province;            // 省份
    
    private String city;                // 城市
    
    private String district;            // 区县
    
    private String address;             // 详细地址
    
    // 教授科目列表（存 course_category 二级ID 列表）
    private List<Long> subjects;
    // 教授科目中文名列表（后端联表填充，便于前端直接展示）
    private List<String> subjectsNameList;
    private java.util.Map<String, String> subjectsMap;
    
    private List<String> grades;        // 教授年级列表
    
    private List<String> teacherTags;   // 教师标签列表
    
    // 以下两个字段为派生字段，来源于 teacher_level_config（按 teacher_level 关联）
    private BigDecimal hourlyRate;      // 课时费（来自等级配置表）
    private BigDecimal commissionRate;  // 佣金比例（来自等级配置表）
    
    private String teacherLevel;        // 教师等级
    
    private Integer auditStatus;        // 审核状态：0-待审核 1-审核通过 2-审核拒绝
    
    private String auditReason;
    
    private LocalDateTime auditTime;
    
    private Long auditUserId;
    
    private Integer contractStatus;     // 合同状态
    
    private LocalDateTime contractSendTime;
    
    private LocalDateTime contractSignTime;
    
    private String contractUrl;
    
    private Integer riskLevel;          // 风险等级
    
    private Integer complaintCount;     // 投诉次数
    
    private BigDecimal complaintRate;   // 投诉率
    
    private BigDecimal conversionRate;  // 转化率
    
    private BigDecimal activeScore;     // 活跃度评分
    
    private Integer totalStudents;      // 累计学生数
    
    private Integer totalCourses;       // 累计课程数
    
    private BigDecimal totalIncome;     // 累计收入
    
    private BigDecimal starRating;      // 学生评价星级
    
    private Integer checkCount;         // 抽查次数
    
    private String violationContent;    // 违规内容记录
    
    private Integer isHidden;           // 是否雪藏：0-正常 1-雪藏
    
    private Integer isRecommended;      // 是否推荐：0-否 1-是
    
    private Integer recommendOrder;     // 推荐排序
    
    private String teachModePreference; // 授课方式偏好：online-线上，offline-线下，both-线上线下都可
    
    private Integer status;             // 状态：1-启用 0-禁用
    
    private String registerSource;      // 注册来源
    
    private LocalDateTime lastLoginTime;
    
    private String lastLoginIp;
    
    private Integer isFirstLogin;       // 是否首次登录
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;

    // 扩展：是否有待审核的磨课申请
    private Boolean hasMoocApply;
}