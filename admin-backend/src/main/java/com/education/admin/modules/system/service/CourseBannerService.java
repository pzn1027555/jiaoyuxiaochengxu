package com.education.admin.modules.system.service;

import com.education.admin.modules.system.entity.CourseBanner;

import java.util.List;

public interface CourseBannerService {

    List<CourseBanner> listAll();

    List<CourseBanner> listEnabled();

    CourseBanner create(CourseBanner banner);

    CourseBanner update(CourseBanner banner);

    boolean delete(Long id);
}


