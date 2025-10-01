package com.education.admin.modules.parent.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 家长实体
 */
@Data
public class Parent {
    
    private Long id;
    private String parentNo;
    private String parentName;
    private String phone;
    private String wxOpenid;
    private String wxUnionid;
    private String nickname;
    private String email;
    private String avatar;
    private Integer gender;               // 1-男，2-女
    private LocalDate birthDate;
    private String idCard;
    private String occupation;
    private String education;
    private String address;
    private String province;
    private String city;
    private String district;
    private String emergencyContact;
    private String emergencyPhone;
    private String introduction;              // 个人介绍
    private List<String> parentTags;          // 家长标签列表
    private LocalDateTime lastLoginTime;
    private String lastLoginIp;
    private Boolean isFirstLogin;
    private String registerSource;
    private Integer status;               // 1-正常，0-禁用
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}