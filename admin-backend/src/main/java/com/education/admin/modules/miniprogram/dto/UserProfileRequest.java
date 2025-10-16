package com.education.admin.modules.miniprogram.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 用户资料更新请求DTO
 */
@Data
public class UserProfileRequest {
    
    /**
     * 用户姓名
     */
    @NotBlank(message = "姓名不能为空")
    @Size(max = 50, message = "姓名长度不能超过50个字符")
    private String name;
    
    /**
     * 头像URL
     */
    private String avatar;
    
    /**
     * 性别：1-男，2-女
     */
    private Integer gender;

    /**
     * 出生日期：yyyy-MM-dd（学生专用）
     */
    private String birthDate;
    
    /**
     * 省份
     */
    @Size(max = 50, message = "省份长度不能超过50个字符")
    private String province;
    
    /**
     * 城市
     */
    @Size(max = 50, message = "城市长度不能超过50个字符")
    private String city;
    
    /**
     * 区县
     */
    @Size(max = 50, message = "区县长度不能超过50个字符")
    private String district;
    
    /**
     * 详细地址
     */
    @Size(max = 255, message = "详细地址长度不能超过255个字符")
    private String address;
    
    /**
     * 手机号
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    /**
     * 个人介绍
     */
    @Size(max = 500, message = "个人介绍长度不能超过500个字符")
    private String introduction;
    
    // 教师特有字段
    /**
     * 教授科目列表（教师专用）
     */
    private List<Long> subjects;
    
    /**
     * 教师标签列表（教师专用）
     */
    private List<String> teacherTags;
    
    /**
     * 学历（教师专用）
     */
    @Size(max = 50, message = "学历长度不能超过50个字符")
    private String education;
    
    /**
     * 专业（教师专用）
     */
    @Size(max = 100, message = "专业长度不能超过100个字符")
    private String major;
    
    /**
     * 毕业学校（教师专用）
     */
    @Size(max = 200, message = "毕业学校长度不能超过200个字符")
    private String graduationSchool;
    
    /**
     * 教学经验年数（教师专用）
     */
    private Integer teachingExperience;
    
    /**
     * 授课方式偏好（教师专用）：online-线上，offline-线下，both-线上线下都可
     */
    private String teachModePreference;
    
    // 学生特有字段
    /**
     * 年级（学生专用）
     */
    @Size(max = 20, message = "年级长度不能超过20个字符")
    private String grade;
    
    /**
     * 学校（学生专用）
     */
    @Size(max = 100, message = "学校长度不能超过100个字符")
    private String school;
    
    /**
     * 家长姓名（学生专用）
     */
    @Size(max = 50, message = "家长姓名长度不能超过50个字符")
    private String parentName;
    
    /**
     * 家长电话（学生专用）
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$|^$", message = "家长电话格式不正确")
    private String parentPhone;
    
    /**
     * 学生标签列表（学生专用）
     */
    private List<String> studentTags;
    
    // 家长特有字段
    /**
     * 职业（家长专用）
     */
    @Size(max = 100, message = "职业长度不能超过100个字符")
    private String occupation;
    
    /**
     * 紧急联系人（家长专用）
     */
    @Size(max = 50, message = "紧急联系人长度不能超过50个字符")
    private String emergencyContact;
    
    /**
     * 紧急联系电话（家长专用）
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$|^$", message = "紧急联系电话格式不正确")
    private String emergencyPhone;
    
    /**
     * 家长标签列表（家长专用）
     */
    private List<String> parentTags;
}
