package com.education.admin.modules.system.mapper;

import com.education.admin.modules.system.entity.LessonPriceConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LessonPriceConfigMapper {
    LessonPriceConfig selectLatest();
    int insert(LessonPriceConfig cfg);
    int updatePrice(@Param("id") Long id, @Param("price") java.math.BigDecimal price, @Param("currency") String currency);
}


