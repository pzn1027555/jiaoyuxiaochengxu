package com.education.admin.modules.order.controller;

import com.education.admin.modules.order.entity.OrderInfo;
import com.education.admin.modules.order.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 订单控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/mini/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * 获取学生的订单列表
     */
    @GetMapping("/list")
    public Map<String, Object> getOrderList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        
        log.info("Getting order list, pageNum: {}, pageSize: {}", pageNum, pageSize);
        
        try {
            Map<String, Object> result = orderService.getStudentOrders(pageNum, pageSize);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", result);
            response.put("message", "获取订单列表成功");
            
            return response;
        } catch (Exception e) {
            log.error("Error getting order list", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return response;
        }
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> getOrderDetail(@PathVariable Long id) {
        log.info("Getting order detail for id: {}", id);
        
        try {
            OrderInfo order = orderService.getOrderById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (order != null) {
                response.put("success", true);
                response.put("data", order);
                response.put("message", "获取订单详情成功");
            } else {
                response.put("success", false);
                response.put("message", "订单不存在");
            }
            
            return response;
        } catch (Exception e) {
            log.error("Error getting order detail", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return response;
        }
    }

    /**
     * 创建订单
     */
    @PostMapping("/create")
    public Map<String, Object> createOrder(@RequestBody OrderInfo orderInfo) {
        log.info("Creating order: {}", orderInfo);
        
        try {
            OrderInfo createdOrder = orderService.createOrder(orderInfo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", createdOrder);
            response.put("message", "创建订单成功");
            
            return response;
        } catch (Exception e) {
            log.error("Error creating order", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return response;
        }
    }

    /**
     * 取消订单
     */
    @PostMapping("/{id}/cancel")
    public Map<String, Object> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String cancelReason = request.get("cancelReason");
        log.info("Canceling order id: {}, reason: {}", id, cancelReason);
        
        try {
            boolean success = orderService.cancelOrder(id, cancelReason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "取消订单成功" : "取消订单失败");
            
            return response;
        } catch (Exception e) {
            log.error("Error canceling order", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return response;
        }
    }

    /**
     * 更新订单状态
     */
    @PostMapping("/{id}/status")
    public Map<String, Object> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer orderStatus = request.get("orderStatus");
        Integer paymentStatus = request.get("paymentStatus");
        log.info("Updating order status for id: {}, orderStatus: {}, paymentStatus: {}", id, orderStatus, paymentStatus);
        
        try {
            boolean success = orderService.updateOrderStatus(id, orderStatus, paymentStatus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "更新订单状态成功" : "更新订单状态失败");
            
            return response;
        } catch (Exception e) {
            log.error("Error updating order status", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return response;
        }
    }
}
