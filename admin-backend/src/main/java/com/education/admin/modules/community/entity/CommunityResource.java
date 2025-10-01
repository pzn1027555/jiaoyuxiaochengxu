package com.education.admin.modules.community.entity;

import lombok.Data;

@Data
public class CommunityResource {
    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private String coverUrl;
    private String fileType; // doc/docx/pdf/mp4
    private Integer status;  // 1-上架 0-下架
}


