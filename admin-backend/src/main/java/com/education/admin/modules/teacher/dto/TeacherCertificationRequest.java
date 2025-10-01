package com.education.admin.modules.teacher.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


/**
 * 教师认证提交请求DTO
 *
 * @author education
 * @since 2025-08-16
 */
@Data
public class TeacherCertificationRequest {

    /**
     * 真实姓名
     */
    @NotBlank(message = "真实姓名不能为空")
    private String realName;

    /**
     * 性别：1-男，2-女
     */
    @NotNull(message = "性别不能为空")
    private Integer gender;

    /**
     * 身份证人像面URL
     */
    @NotBlank(message = "身份证人像面不能为空")
    private String idCardFront;

    /**
     * 身份证国徽面URL
     */
    @NotBlank(message = "身份证国徽面不能为空")
    private String idCardBack;

    /**
     * 毕业院校
     */
    @NotBlank(message = "毕业院校不能为空")
    private String graduateSchool;

    /**
     * 学历
     */
    @NotBlank(message = "学历不能为空")
    private String education;

    /**
     * 学历证书URL数组（JSON格式）
     */
    @NotBlank(message = "学历证书不能为空")
    private String diplomaCerts;

    /**
     * 教师资格证URL数组（JSON格式）
     */
    @NotBlank(message = "教师资格证不能为空")
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
}
