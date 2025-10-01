package com.education.admin.modules.system.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 统一课时价格配置（仅一条记录生效）
 */
@Data
public class LessonPriceConfig {
    private Long id;
    /** 统一课时价格(元/课时) */
    private BigDecimal price;
    /** 币种，默认 CNY */
    private String currency;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


