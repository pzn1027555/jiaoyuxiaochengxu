package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Insert;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper
public interface ParentAccountMapper {

    @Select("SELECT balance FROM parent_wallet WHERE parent_id = #{parentId} LIMIT 1")
    BigDecimal getBalanceByParentId(@Param("parentId") Long parentId);

    @Select("SELECT COALESCE(SUM(amount),0) FROM parent_wallet_txn WHERE parent_id = #{parentId} AND type = 'consume'")
    BigDecimal getTotalConsumedByParentId(@Param("parentId") Long parentId);

    @Select("SELECT id, type, title, create_time AS time, amount FROM parent_wallet_txn " +
            "WHERE parent_id = #{parentId} AND type = 'consume' AND create_time BETWEEN #{startDate} AND #{endDate} " +
            "ORDER BY create_time DESC")
    List<Map<String, Object>> findMonthlyConsumption(@Param("parentId") Long parentId,
                                                     @Param("startDate") String startDate,
                                                     @Param("endDate") String endDate);

    @Insert("INSERT INTO parent_wallet_txn(parent_id, type, title, amount, order_id, extra, create_time) " +
            "VALUES(#{parentId}, 'recharge', #{title}, #{amount}, NULL, NULL, NOW())")
    int insertRecharge(@Param("parentId") Long parentId, @Param("amount") BigDecimal amount, @Param("title") String title);

    @Update("INSERT INTO parent_wallet(parent_id, balance, create_time, update_time) VALUES(#{parentId}, #{amount}, NOW(), NOW()) " +
            "ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance), update_time = NOW()")
    int addBalance(@Param("parentId") Long parentId, @Param("amount") BigDecimal amount);
}


