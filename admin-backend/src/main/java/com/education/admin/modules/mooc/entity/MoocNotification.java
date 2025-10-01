package com.education.admin.modules.mooc.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 磨课通知实体
 */
@Data
public class MoocNotification {

    private Long id;

    private Long teacherId;

    /** apply | invite | group */
    private String type;

    private String title;

    private String content;

    private Long relatedId;

    private Boolean isRead;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    // 关联小组的补充信息（联表查询返回）
    private String qrcodeUrl;
    private String groupName;
}


