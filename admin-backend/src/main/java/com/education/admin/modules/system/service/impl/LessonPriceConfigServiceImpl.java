package com.education.admin.modules.system.service.impl;

import com.education.admin.modules.system.entity.LessonPriceConfig;
import com.education.admin.modules.system.mapper.LessonPriceConfigMapper;
import com.education.admin.modules.system.service.LessonPriceConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class LessonPriceConfigServiceImpl implements LessonPriceConfigService {

    private final LessonPriceConfigMapper mapper;

    @Override
    public LessonPriceConfig getCurrent() {
        LessonPriceConfig cfg = mapper.selectLatest();
        return cfg;
    }

    @Override
    public LessonPriceConfig upsert(BigDecimal price, String currency) {
        LessonPriceConfig current = mapper.selectLatest();
        if (current == null) {
            LessonPriceConfig cfg = new LessonPriceConfig();
            cfg.setPrice(price);
            cfg.setCurrency(currency);
            mapper.insert(cfg);
            return cfg;
        } else {
            mapper.updatePrice(current.getId(), price, currency);
            current.setPrice(price);
            current.setCurrency(currency);
            return current;
        }
    }
}


