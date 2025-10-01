package com.education.admin.modules.system.service;

import com.education.admin.modules.system.entity.LessonPriceConfig;
import java.math.BigDecimal;

public interface LessonPriceConfigService {
    LessonPriceConfig getCurrent();
    LessonPriceConfig upsert(BigDecimal price, String currency);
}


