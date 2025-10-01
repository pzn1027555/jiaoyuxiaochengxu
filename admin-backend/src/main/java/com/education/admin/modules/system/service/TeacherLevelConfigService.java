package com.education.admin.modules.system.service;

import com.education.admin.modules.system.entity.TeacherLevelConfig;

import java.math.BigDecimal;
import java.util.List;

public interface TeacherLevelConfigService {

    List<TeacherLevelConfig> listAll();

    TeacherLevelConfig getByLevelKey(String levelKey);

    TeacherLevelConfig create(TeacherLevelConfig config);

    TeacherLevelConfig update(TeacherLevelConfig config);

    boolean delete(Long id);

    /** 根据等级返回课时费（未配置返回null） */
    BigDecimal getHourlyRateByLevel(String levelKey);
}


