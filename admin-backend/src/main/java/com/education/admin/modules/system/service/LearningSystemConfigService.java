package com.education.admin.modules.system.service;

import com.education.admin.modules.system.entity.LearningSystemConfig;

import java.util.List;

public interface LearningSystemConfigService {
    List<LearningSystemConfig> listAll();
    List<LearningSystemConfig> listEnabled();
    LearningSystemConfig getBySystemKey(String systemKey);
    LearningSystemConfig create(LearningSystemConfig config);
    LearningSystemConfig update(LearningSystemConfig config);
    boolean delete(Long id);
}


