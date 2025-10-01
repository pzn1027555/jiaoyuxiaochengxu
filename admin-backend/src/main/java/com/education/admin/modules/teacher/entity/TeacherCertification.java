package com.education.admin.modules.teacher.entity;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;


/**
 * 教师认证实体类
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class TeacherCertification implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 认证ID
     */
    private Long id;

    /**
     * 教师ID
     */
    private Long teacherId;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 性别：1-男，2-女
     */
    private Integer gender;

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
     * 学历：专科，本科，硕士，博士
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
     * 提交时间
     */
    private LocalDateTime submitTime;

    /**
     * 审核时间
     */
    private LocalDateTime auditTime;

    /**
     * 审核人ID
     */
    private Long auditUserId;

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
     * 认证评级：junior-初级，intermediate-中级，senior-高级，expert-专家
     */
    private String teacherLevel;

    /**
     * 评级时间
     */
    private LocalDateTime gradeTime;

    /**
     * 评级人ID
     */
    private Long gradeUserId;

    /**
     * 评级人姓名
     */
    private String gradeUserName;

    /**
     * 评级说明
     */
    private String gradeReason;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
