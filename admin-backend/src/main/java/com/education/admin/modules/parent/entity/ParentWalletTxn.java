package com.education.admin.modules.parent.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 家长钱包流水实体
 */
@Data
public class ParentWalletTxn {
    private Long id;
    private Long parentId;               // parent_info.id
    private String type;                 // recharge-充值, consume-消费, refund-退款
    private String title;                // 摘要/标题
    private BigDecimal amount;           // 金额(consume为正数代表支出)
    private Long orderId;                // 关联订单(可选)
    private String extra;                // 扩展信息JSON
    private LocalDateTime createTime;
}
