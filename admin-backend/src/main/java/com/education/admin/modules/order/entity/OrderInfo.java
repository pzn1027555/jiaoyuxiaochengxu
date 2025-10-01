package com.education.admin.modules.order.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单信息实体类 - 对应 order_info 表
 */
@Data
public class OrderInfo {
    
    private Long id;                        // 订单ID
    private String orderNo;                 // 订单号
    private String parentOrderNo;           // 父订单号（分期订单）
    private Long studentId;                 // 学生ID
    private Long scheduleId;                // 排课ID（teacher_schedule表）
    private Long teacherId;                 // 教师ID
    private String courseName;              // 课程名称
    private String courseType;              // 课程类型
    private Integer lessonCount;            // 购买课时数
    private BigDecimal unitPrice;           // 单价
    private BigDecimal totalAmount;         // 订单总金额
    private BigDecimal discountAmount;      // 优惠金额
    private BigDecimal actualAmount;        // 实际支付金额
    private BigDecimal commissionAmount;    // 平台佣金
    private BigDecimal teacherIncome;       // 教师收入
    private String paymentMethod;           // 支付方式：wechat-微信，alipay-支付宝，bank-银行卡
    private Integer orderStatus;            // 订单状态：1-待支付，2-已支付，3-已完成，4-已取消，5-已退款
    private Integer paymentStatus;          // 支付状态：0-未支付，1-已支付，2-部分退款，3-全额退款
    private String orderSource;             // 订单来源：miniprogram-小程序，web-网页，app-APP
    private String transactionId;           // 第三方交易号
    private LocalDateTime payTime;          // 支付时间
    private LocalDateTime completeTime;     // 完成时间
    private LocalDateTime cancelTime;       // 取消时间
    private String cancelReason;            // 取消原因
    private BigDecimal refundAmount;        // 退款金额
    private String refundReason;            // 退款原因
    private LocalDateTime refundTime;       // 退款时间
    private Long surveyId;                  // 关联的预约调查ID（student_survey表）
    private String remark;                  // 订单备注
    private LocalDateTime createTime;       // 创建时间
    private LocalDateTime updateTime;       // 更新时间
    
    // 扩展字段 - 用于关联查询
    private String studentName;             // 学生姓名
    private String teacherName;             // 教师姓名
    private String teacherAvatar;           // 教师头像
}
