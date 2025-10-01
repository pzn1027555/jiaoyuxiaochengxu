package com.education.admin.modules.system.mapper;

import com.education.admin.modules.system.entity.LearningSystemConfig;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface LearningSystemConfigMapper {

    LearningSystemConfig selectById(@Param("id") Long id);

    LearningSystemConfig selectBySystemKey(@Param("systemKey") String systemKey);

    List<LearningSystemConfig> selectAll();

    List<LearningSystemConfig> selectEnabled();

    int insert(LearningSystemConfig config);

    int updateById(LearningSystemConfig config);

    int deleteById(@Param("id") Long id);
}


