package com.education.admin.modules.system.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 学习体系配置
 */
@Data
public class LearningSystemConfig {

    private Long id;

    /** 体系键，例如：gaokao/ap/alevel/ib/competition */
    private String systemKey;

    /** 显示名称，例如：国内中考/高考、AP、A-Level、IB、竞赛 */
    private String displayName;

    /** 是否启用：1-启用 0-禁用 */
    private Integer isEnabled;

    /** 排序（升序） */
    private Integer sortOrder;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}


