package com.education.admin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 教育小程序管理后台启动类
 */
@SpringBootApplication
@MapperScan({"com.education.admin.modules.auth.mapper",
             "com.education.admin.modules.teacher.mapper",
             "com.education.admin.modules.student.mapper",
             "com.education.admin.modules.course.mapper",
             "com.education.admin.modules.order.mapper",
             "com.education.admin.modules.community.mapper",
             "com.education.admin.modules.system.mapper",
             "com.education.admin.modules.parent.mapper",
             "com.education.admin.modules.miniprogram.mapper",
             "com.education.admin.modules.finance.mapper",
             "com.education.admin.modules.badge.mapper",
             "com.education.admin.modules.mooc.mapper",
             "com.education.admin.modules.competition.mapper",
             "com.education.admin.modules.orderreview.mapper",
             "com.education.admin.modules.dashboard.mapper",
             "com.education.admin.modules.operation.mapper"})
public class AdminBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminBackendApplication.class, args);
    }

}