package com.education.admin.modules.system.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 教师等级-课时费配置
 */
@Data
public class TeacherLevelConfig {

    private Long id;

    /** 等级键：junior/intermediate/senior/expert */
    private String levelKey;

    /** 等级显示名：初级/中级/高级/专家 */
    private String displayName;

    /** 对应课时费（元） */
    private BigDecimal hourlyRate;

    /** 佣金比例（%） */
    private BigDecimal commissionRate;

    /** 是否启用：1-启用 0-禁用 */
    private Integer isEnabled;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}


