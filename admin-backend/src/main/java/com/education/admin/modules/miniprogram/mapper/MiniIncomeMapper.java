package com.education.admin.modules.miniprogram.mapper;

import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface MiniIncomeMapper {

    BigDecimal sumTodayIncome(@Param("teacherId") Long teacherId);

    BigDecimal sumTotalIncome(@Param("teacherId") Long teacherId);
    
    BigDecimal sumMonthlyIncome(@Param("teacherId") Long teacherId,
                                @Param("yearMonth") String yearMonth);

    List<Map<String, Object>> listMonthlyOrderIncome(@Param("teacherId") Long teacherId,
                                                     @Param("yearMonth") String yearMonth);

    List<Map<String, Object>> listMonthlySettlementPayout(@Param("teacherId") Long teacherId,
                                                          @Param("yearMonth") String yearMonth);
}


