package com.education.admin.modules.order.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单信息实体
 */
@Data
public class Order {
    
    private Long id;
    
    private String orderNo;      // 订单号
    
    private Long userId;         // 用户ID
    
    private String userName;     // 用户姓名
    
    private String userPhone;    // 用户电话
    
    private Long courseId;       // 课程ID
    
    private String courseTitle;  // 课程标题
    
    private BigDecimal originalPrice; // 原价
    
    private BigDecimal actualPrice;   // 实付金额
    
    private BigDecimal discountAmount; // 优惠金额
    
    private Integer paymentMethod;     // 支付方式 1-微信 2-支付宝
    
    private Integer status;            // 订单状态 0-待支付 1-已支付 2-已取消 3-已退款
    
    private LocalDateTime payTime;     // 支付时间
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}