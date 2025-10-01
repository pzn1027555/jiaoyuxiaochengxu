package com.education.admin.modules.order.service;

import com.education.admin.modules.order.entity.OrderInfo;

import java.util.Map;

/**
 * 订单服务接口
 */
public interface OrderService {

    /**
     * 获取学生的订单列表
     * @param pageNum 页码
     * @param pageSize 页面大小
     * @return 分页结果
     */
    Map<String, Object> getStudentOrders(Integer pageNum, Integer pageSize);

    /**
     * 根据订单号获取订单详情
     * @param orderNo 订单号
     * @return 订单详情
     */
    OrderInfo getOrderByNo(String orderNo);

    /**
     * 根据ID获取订单详情
     * @param id 订单ID
     * @return 订单详情
     */
    OrderInfo getOrderById(Long id);

    /**
     * 创建订单
     * @param orderInfo 订单信息
     * @return 创建的订单
     */
    OrderInfo createOrder(OrderInfo orderInfo);

    /**
     * 更新订单状态
     * @param id 订单ID
     * @param orderStatus 订单状态
     * @param paymentStatus 支付状态
     * @return 是否成功
     */
    boolean updateOrderStatus(Long id, Integer orderStatus, Integer paymentStatus);

    /**
     * 取消订单
     * @param id 订单ID
     * @param cancelReason 取消原因
     * @return 是否成功
     */
    boolean cancelOrder(Long id, String cancelReason);
}
