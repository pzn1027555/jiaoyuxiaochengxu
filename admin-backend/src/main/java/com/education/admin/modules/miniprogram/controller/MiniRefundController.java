package com.education.admin.modules.miniprogram.controller;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.service.MiniRefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mini/refund")
@RequiredArgsConstructor
public class MiniRefundController {

    private final MiniRefundService refundService;

    /** 提交售后申请（退款） */
    @PostMapping("/apply")
    public Result<Map<String,Object>> apply(@RequestBody Map<String,Object> payload){
        return refundService.apply(payload);
    }

    /** 查询订单售后状态 */
    @GetMapping("/status")
    public Result<Map<String,Object>> status(@RequestParam("orderId") Long orderId){
        return refundService.status(orderId);
    }

    /** 撤回售后申请 */
    @PostMapping("/{orderId}/revoke")
    public Result<String> revoke(@PathVariable("orderId") Long orderId){
        return refundService.revoke(orderId);
    }
}


