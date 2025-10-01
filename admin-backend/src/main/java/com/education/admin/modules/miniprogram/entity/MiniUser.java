package com.education.admin.modules.miniprogram.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 小程序用户实体
 */
@Data
public class MiniUser {
    
    private Long id;
    private String openid;
    private String unionid;
    private String sessionKey;
    private String nickname;
    private String avatar;
    private String phone;
    private Integer userType;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}