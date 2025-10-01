package com.education.admin.modules.system.mapper;

import com.education.admin.modules.system.entity.TeacherLevelConfig;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface TeacherLevelConfigMapper {

    TeacherLevelConfig selectById(@Param("id") Long id);

    TeacherLevelConfig selectByLevelKey(@Param("levelKey") String levelKey);

    List<TeacherLevelConfig> selectAll();

    int insert(TeacherLevelConfig config);

    int updateById(TeacherLevelConfig config);

    int deleteById(@Param("id") Long id);
}


