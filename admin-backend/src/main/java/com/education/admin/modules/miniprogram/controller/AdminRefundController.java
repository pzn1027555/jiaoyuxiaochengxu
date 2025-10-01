package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/refund")
@RequiredArgsConstructor
public class AdminRefundController {

    private final com.education.admin.modules.miniprogram.mapper.RefundMapper refundMapper;

    @GetMapping("/list")
    public Result<java.util.Map<String,Object>> list(@RequestParam(value="status", required=false) String status,
                                                     @RequestParam(value="page", defaultValue="1") Integer page,
                                                     @RequestParam(value="size", defaultValue="10") Integer size){
        int offset = (page-1)*size;
        java.util.List<java.util.Map<String,Object>> items = refundMapper.adminList(status, size, offset);
        int total = refundMapper.adminCount(status);
        java.util.Map<String,Object> data = new java.util.HashMap<>();
        data.put("items", items); data.put("total", total);
        return Result.success(data);
    }

    @PostMapping("/{id}/status")
    public Result<String> status(@PathVariable("id") Long id, @RequestBody java.util.Map<String,Object> body){
        String status = String.valueOf(body.get("status"));
        int n = refundMapper.updateStatus(id, status);
        return n>0 ? Result.success("OK") : Result.error("更新失败");
    }

    /** 同意退款：完成流程，退款至家长余额，并更新状态为 completed */
    @PostMapping("/{id}/approve")
    public Result<String> approve(@PathVariable("id") Long id){
        java.util.Map<String,Object> r = refundMapper.findById(id);
        if (r == null) return Result.error("记录不存在");
        Long orderId = r.get("orderId") == null ? null : Long.valueOf(String.valueOf(r.get("orderId")));
        if (orderId == null) return Result.error("订单缺失");
        java.util.Map<String,Object> o = refundMapper.findOrderById(orderId);
        if (o == null) return Result.error("订单不存在");
        Long studentId = o.get("studentId") == null ? null : Long.valueOf(String.valueOf(o.get("studentId")));
        if (studentId == null) return Result.error("订单缺少学生");
        Long parentId = refundMapper.findPrimaryParentIdByStudent(studentId);
        if (parentId == null) return Result.error("未找到家长");

        java.math.BigDecimal amount = java.math.BigDecimal.ZERO;
        Object amt = o.get("actualAmount");
        if (amt != null) amount = new java.math.BigDecimal(String.valueOf(amt));

        // 加钱到家长钱包并记录流水
        refundMapper.upsertParentWallet(parentId, amount);
        refundMapper.insertParentWalletTxn(parentId, amount, orderId, "订单退款");

        // 更新退款单状态
        refundMapper.updateStatus(id, "completed");
        return Result.success("已退款至余额");
    }

    /** 驳回退款：需填写驳回理由，状态置为 revoked */
    @PostMapping("/{id}/reject")
    public Result<String> reject(@PathVariable("id") Long id, @RequestBody java.util.Map<String,Object> body){
        String reason = body == null ? null : String.valueOf(body.get("reason"));
        if (reason == null || reason.trim().isEmpty()) return Result.error("请填写驳回理由");
        int n = refundMapper.updateReject(id, reason.trim());
        return n>0 ? Result.success("已驳回") : Result.error("驳回失败");
    }
}


