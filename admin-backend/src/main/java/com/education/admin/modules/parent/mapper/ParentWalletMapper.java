package com.education.admin.modules.parent.mapper;

import com.education.admin.modules.parent.entity.ParentWallet;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;

@Mapper
public interface ParentWalletMapper {
    
    /**
     * 根据家长ID查询钱包
     */
    ParentWallet findByParentId(@Param("parentId") Long parentId);
    
    /**
     * 插入钱包记录
     */
    int insert(ParentWallet wallet);
    
    /**
     * 更新余额
     */
    int updateBalance(@Param("parentId") Long parentId, @Param("balance") BigDecimal balance);
    
    /**
     * 增加余额（退款等）
     */
    int addBalance(@Param("parentId") Long parentId, @Param("amount") BigDecimal amount);
    
    /**
     * 减少余额（消费等）
     */
    int subtractBalance(@Param("parentId") Long parentId, @Param("amount") BigDecimal amount);
}
