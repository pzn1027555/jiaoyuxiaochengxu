package com.education.admin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${upload.base-dir:uploads}")
    private String baseDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path basePath = Paths.get(baseDir);
        if (!basePath.isAbsolute()) {
            String appDir = System.getProperty("user.dir");
            basePath = Paths.get(appDir).resolve(basePath);
        }
        String location = basePath.toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);

        // 兼容前端可能拼接为 /api/uploads/** 的情况
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }
}


