package com.education.admin.modules.finance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface FinanceOrderMapper {

    /**
     * 分页查询订单列表（真实数据）
     * 可按订单号、学生姓名、订单状态筛选
     */
    List<Map<String, Object>> findOrders(@Param("orderNo") String orderNo,
                                         @Param("studentName") String studentName,
                                         @Param("orderStatus") Integer orderStatus);
}


