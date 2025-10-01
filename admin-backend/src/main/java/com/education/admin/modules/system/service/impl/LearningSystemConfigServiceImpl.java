package com.education.admin.modules.system.service.impl;

import com.education.admin.modules.system.entity.LearningSystemConfig;
import com.education.admin.modules.system.mapper.LearningSystemConfigMapper;
import com.education.admin.modules.system.service.LearningSystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningSystemConfigServiceImpl implements LearningSystemConfigService {

    private final LearningSystemConfigMapper mapper;

    @Override
    public List<LearningSystemConfig> listAll() {
        return mapper.selectAll();
    }

    @Override
    public List<LearningSystemConfig> listEnabled() {
        return mapper.selectEnabled();
    }

    @Override
    public LearningSystemConfig getBySystemKey(String systemKey) {
        if (systemKey == null || systemKey.isEmpty()) return null;
        return mapper.selectBySystemKey(systemKey);
    }

    @Override
    public LearningSystemConfig create(LearningSystemConfig config) {
        mapper.insert(config);
        return config;
    }

    @Override
    public LearningSystemConfig update(LearningSystemConfig config) {
        mapper.updateById(config);
        return config;
    }

    @Override
    public boolean delete(Long id) {
        return mapper.deleteById(id) > 0;
    }
}


