package com.education.admin.modules.system.service.impl;

import com.education.admin.modules.system.entity.CourseBanner;
import com.education.admin.modules.system.mapper.CourseBannerMapper;
import com.education.admin.modules.system.service.CourseBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseBannerServiceImpl implements CourseBannerService {

    private final CourseBannerMapper bannerMapper;

    @Override
    public List<CourseBanner> listAll() {
        return bannerMapper.selectList(null);
    }

    @Override
    public List<CourseBanner> listEnabled() {
        return bannerMapper.selectList(1);
    }

    @Override
    public CourseBanner create(CourseBanner banner) {
        if (banner.getIsEnabled() == null) {
            banner.setIsEnabled(1);
        }
        if (banner.getSortOrder() == null) {
            banner.setSortOrder(0);
        }
        bannerMapper.insert(banner);
        return banner;
    }

    @Override
    public CourseBanner update(CourseBanner banner) {
        bannerMapper.update(banner);
        return bannerMapper.selectById(banner.getId());
    }

    @Override
    public boolean delete(Long id) {
        return bannerMapper.delete(id) > 0;
    }
}


