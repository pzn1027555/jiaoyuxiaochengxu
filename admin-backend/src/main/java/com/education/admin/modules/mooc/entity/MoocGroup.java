package com.education.admin.modules.mooc.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 磨课小组实体
 */
@Data
public class MoocGroup {

    private Long id;

    private String groupName;

    /** 二维码URL */
    private String qrcodeUrl;

    /** 派遣点评老师（JSON字符串） */
    private String dispatchTeachers;

    private Long creatorUserId;

    /** 安排时间 */
    private java.time.LocalDateTime scheduleTime;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}


