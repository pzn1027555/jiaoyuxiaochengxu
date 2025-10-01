package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface RefundMapper {
    int insert(@Param("orderId") Long orderId,
               @Param("refundType") String refundType,
               @Param("reason") String reason);

    Map<String,Object> findLatestByOrderId(@Param("orderId") Long orderId);

    int revoke(@Param("orderId") Long orderId);

    // admin
    java.util.List<java.util.Map<String,Object>> adminList(@Param("status") String status,
                                                           @Param("pageSize") Integer pageSize,
                                                           @Param("offset") Integer offset);
    int adminCount(@Param("status") String status);
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    // 新增：详情与审批相关
    Map<String,Object> findById(@Param("id") Long id);
    Map<String,Object> findOrderById(@Param("orderId") Long orderId);
    Long findPrimaryParentIdByStudent(@Param("studentId") Long studentId);
    int upsertParentWallet(@Param("parentId") Long parentId, @Param("amount") java.math.BigDecimal amount);
    int insertParentWalletTxn(@Param("parentId") Long parentId,
                              @Param("amount") java.math.BigDecimal amount,
                              @Param("orderId") Long orderId,
                              @Param("title") String title);
    int updateReject(@Param("id") Long id, @Param("reason") String reason);
}


