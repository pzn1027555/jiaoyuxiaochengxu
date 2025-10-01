package com.education.admin.modules.parent.mapper;

import com.education.admin.modules.parent.entity.ParentWalletTxn;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ParentWalletTxnMapper {
    
    /**
     * 插入交易记录
     */
    int insert(ParentWalletTxn txn);
    
    /**
     * 根据家长ID查询交易记录
     */
    List<ParentWalletTxn> findByParentId(@Param("parentId") Long parentId);
    
    /**
     * 根据订单ID查询交易记录
     */
    List<ParentWalletTxn> findByOrderId(@Param("orderId") Long orderId);
}
