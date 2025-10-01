package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniRefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniRefundServiceImpl implements MiniRefundService {

    private final com.education.admin.modules.order.mapper.OrderMapper orderMapper;
    private final com.education.admin.modules.miniprogram.mapper.RefundMapper refundMapper;
    private final com.education.admin.modules.miniprogram.mapper.TeacherScheduleStudentMapper scheduleStudentMapper;

    @Override
    public Result<Map<String, Object>> apply(Map<String, Object> payload) {
        Long orderId = payload.get("orderId") == null ? null : Long.valueOf(String.valueOf(payload.get("orderId")));
        String refundType = payload.get("refundType") == null ? "refund" : String.valueOf(payload.get("refundType"));
        String reason = payload.get("reason") == null ? null : String.valueOf(payload.get("reason"));
        if (orderId == null || reason == null || reason.trim().isEmpty()) {
            return Result.error("参数不完整");
        }
        
        // 插入退款申请记录
        refundMapper.insert(orderId, refundType, reason);
        
        // 更新订单状态为6（售后中）
        try {
            orderMapper.updateOrderStatus(orderId, 6, null); // 只更新orderStatus，paymentStatus保持不变
            log.info("Updated order status to 6 (refunding) for orderId: {}", orderId);
        } catch (Exception e) {
            log.error("Failed to update order status for orderId: " + orderId, e);
            // 不影响主流程，但应该记录错误
        }
        
        // 暂时移除课程绑定
        try{
            com.education.admin.modules.order.entity.OrderInfo o = orderMapper.getOrderById(orderId);
            if(o!=null && o.getScheduleId()!=null && o.getStudentId()!=null){
                scheduleStudentMapper.deleteEnrollment(o.getScheduleId(), o.getStudentId());
            }
        }catch(Exception ignored){}
        
        Map<String,Object> data = new HashMap<>();
        data.put("orderId", orderId);
        data.put("status", "applied");
        return Result.success(data);
    }

    @Override
    public Result<Map<String, Object>> status(Long orderId) {
        Map<String,Object> s = refundMapper.findLatestByOrderId(orderId);
        if (s == null) return Result.success(new HashMap<>());
        return Result.success(s);
    }

    @Override
    public Result<String> revoke(Long orderId) {
        int n = refundMapper.revoke(orderId);
        
        // 撤回成功后，将订单状态从6（售后中）恢复为2（已支付）
        if (n > 0) {
            try {
                orderMapper.updateOrderStatus(orderId, 2, null); // 恢复为已支付状态
                log.info("Revoked refund and restored order status to 2 (paid) for orderId: {}", orderId);
            } catch (Exception e) {
                log.error("Failed to restore order status for orderId: " + orderId, e);
                // 不影响主流程，但应该记录错误
            }
        }
        
        // 撤回后恢复课程绑定
        try{
            com.education.admin.modules.order.entity.OrderInfo o = orderMapper.getOrderById(orderId);
            if(o!=null && o.getScheduleId()!=null && o.getStudentId()!=null){
                Integer exists = scheduleStudentMapper.checkEnrollment(o.getScheduleId(), o.getStudentId());
                if (exists==null || exists==0){
                    com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent e = new com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent();
                    e.setScheduleId(o.getScheduleId());
                    e.setStudentId(o.getStudentId());
                    scheduleStudentMapper.insertEnrollment(e);
                }
            }
        }catch(Exception ignored){}
        return n>0 ? Result.success("撤回成功") : Result.error("撤回失败");
    }
}


