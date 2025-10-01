package com.education.admin.modules.order.mapper;

import com.education.admin.modules.order.entity.OrderInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 订单信息Mapper接口
 */
@Mapper
public interface OrderMapper {

    /**
     * 获取学生的订单列表
     * @param studentId 学生ID
     * @param pageSize 页面大小
     * @param offset 偏移量
     * @return 订单列表
     */
    List<Map<String, Object>> getStudentOrders(@Param("studentId") Long studentId, 
                                               @Param("pageSize") Integer pageSize, 
                                               @Param("offset") Integer offset);

    /**
     * 统计学生订单总数
     * @param studentId 学生ID
     * @return 订单总数
     */
    int countStudentOrders(@Param("studentId") Long studentId);

    /**
     * 根据多个学生ID获取订单列表（家长聚合）
     */
    List<Map<String, Object>> getOrdersByStudentIds(@Param("studentIds") List<Long> studentIds,
                                                    @Param("pageSize") Integer pageSize,
                                                    @Param("offset") Integer offset);

    /**
     * 统计多个学生的订单总数（家长聚合）
     */
    int countOrdersByStudentIds(@Param("studentIds") List<Long> studentIds);

    /**
     * 根据订单号查询订单详情
     * @param orderNo 订单号
     * @return 订单详情
     */
    OrderInfo getOrderByNo(@Param("orderNo") String orderNo);

    /**
     * 根据ID查询订单详情
     * @param id 订单ID
     * @return 订单详情
     */
    OrderInfo getOrderById(@Param("id") Long id);

    /**
     * 创建订单
     * @param orderInfo 订单信息
     * @return 插入行数
     */
    int insertOrder(OrderInfo orderInfo);

    /**
     * 更新订单状态
     * @param id 订单ID
     * @param orderStatus 订单状态
     * @param paymentStatus 支付状态
     * @return 更新行数
     */
    int updateOrderStatus(@Param("id") Long id, 
                         @Param("orderStatus") Integer orderStatus, 
                         @Param("paymentStatus") Integer paymentStatus);

    /**
     * 更新订单的survey_id
     * @param orderId 订单ID
     * @param surveyId 预约调查ID
     * @return 影响行数
     */
    int updateOrderSurveyId(@Param("orderId") Long orderId, @Param("surveyId") Long surveyId);

    /**
     * 取消订单
     * @param id 订单ID
     * @param cancelReason 取消原因
     * @return 更新行数
     */
    int cancelOrder(@Param("id") Long id, @Param("cancelReason") String cancelReason);

    /**
     * 判断订单是否已被指定学生评价
     */
    Boolean existsOrderReview(@Param("orderId") Long orderId, @Param("studentId") Long studentId);
}
