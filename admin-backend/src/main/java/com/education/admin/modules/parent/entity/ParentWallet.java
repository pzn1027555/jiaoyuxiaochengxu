package com.education.admin.modules.parent.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 家长钱包实体
 */
@Data
public class ParentWallet {
    private Long id;
    private Long parentId;                // parent_info.id
    private BigDecimal balance;           // 当前可用余额
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
