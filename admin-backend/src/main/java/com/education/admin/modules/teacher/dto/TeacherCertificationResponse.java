package com.education.admin.modules.teacher.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;


/**
 * 教师认证响应DTO
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class TeacherCertificationResponse {

    /**
     * 认证ID
     */
    private Long id;

    /**
     * 教师ID
     */
    private Long teacherId;

    /**
     * 教师姓名
     */
    private String teacherName;

    /**
     * 教师手机号
     */
    private String teacherPhone;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 性别：1-男，2-女
     */
    private Integer gender;

    /**
     * 性别文本
     */
    private String genderText;

    /**
     * 身份证人像面URL
     */
    private String idCardFront;

    /**
     * 身份证国徽面URL
     */
    private String idCardBack;

    /**
     * 毕业院校
     */
    private String graduateSchool;

    /**
     * 学历
     */
    private String education;

    /**
     * 学历证书URL数组（JSON格式）
     */
    private String diplomaCerts;

    /**
     * 教师资格证URL数组（JSON格式）
     */
    private String teacherCerts;

    /**
     * 获奖认证URL数组（JSON格式）
     */
    private String awardCerts;

    /**
     * 银行卡号
     */
    private String bankCard;

    /**
     * 开户行名称
     */
    private String bankName;

    /**
     * 认证状态：0-待审核，1-审核通过，2-审核拒绝，3-待面试，4-面试通过，5-面试不通过
     */
    private Integer certificationStatus;

    /**
     * 认证状态文本
     */
    private String certificationStatusText;

    /**
     * 提交时间
     */
    private LocalDateTime submitTime;

    /**
     * 审核时间
     */
    private LocalDateTime auditTime;

    /**
     * 审核人姓名
     */
    private String auditUserName;

    /**
     * 审核意见
     */
    private String auditReason;

    /**
     * 面试时间
     */
    private LocalDateTime interviewTime;

    /**
     * 面试结果
     */
    private String interviewResult;

    /**
     * 合同状态：0-未发送，1-已发送待签，2-已签署，3-已过期
     */
     private Integer contractStatus;

    /**
     * 合同URL
     */
     private String contractUrl;

     /**
      * 教师等级：junior/intermediate/senior/expert
      */
     private String teacherLevel;

     /**
      * 课时费（已按等级配置映射）
      */
     private BigDecimal hourlyRate;
}
