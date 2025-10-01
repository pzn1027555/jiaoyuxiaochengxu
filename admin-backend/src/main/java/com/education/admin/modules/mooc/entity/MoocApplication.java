package com.education.admin.modules.mooc.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 磨课申请实体
 */
@Data
public class MoocApplication {

    private Long id;

    private Long teacherId;

    /** 0-待审核 1-通过 2-拒绝 */
    private Integer status;

    private Long groupId;

    private Long auditUserId;

    private String auditReason;

    private LocalDateTime applyTime;

    private LocalDateTime auditTime;

    private String remark;
}


