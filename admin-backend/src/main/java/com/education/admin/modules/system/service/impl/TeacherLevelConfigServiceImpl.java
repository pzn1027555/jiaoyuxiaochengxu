package com.education.admin.modules.system.service.impl;

import com.education.admin.modules.system.entity.TeacherLevelConfig;
import com.education.admin.modules.system.mapper.TeacherLevelConfigMapper;
import com.education.admin.modules.system.service.TeacherLevelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherLevelConfigServiceImpl implements TeacherLevelConfigService {

    private final TeacherLevelConfigMapper mapper;

    @Override
    public List<TeacherLevelConfig> listAll() {
        return mapper.selectAll();
    }

    @Override
    public TeacherLevelConfig getByLevelKey(String levelKey) {
        if (levelKey == null || levelKey.isEmpty()) return null;
        return mapper.selectByLevelKey(levelKey);
    }

    @Override
    public TeacherLevelConfig create(TeacherLevelConfig config) {
        mapper.insert(config);
        return config;
    }

    @Override
    public TeacherLevelConfig update(TeacherLevelConfig config) {
        mapper.updateById(config);
        return config;
    }

    @Override
    public boolean delete(Long id) {
        return mapper.deleteById(id) > 0;
    }

    @Override
    public BigDecimal getHourlyRateByLevel(String levelKey) {
        TeacherLevelConfig cfg = getByLevelKey(levelKey);
        return cfg == null ? null : cfg.getHourlyRate();
    }
}


