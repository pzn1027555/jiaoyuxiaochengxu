package com.education.admin.modules.miniprogram.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TeacherResource {
    private Long id;
    private Long teacherId;
    private String type; // trial_video / material / certificate
    private String title;
    private String description;
    private String fileUrl;
    private String coverUrl;
    private Long fileSize; // 字节数
    private BigDecimal price;
    private Integer isPublished;
    private Integer likeCount;
    private Integer viewCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public String getFileSizeText() {
        if (fileSize == null || fileSize <= 0) return "";
        double size = fileSize.doubleValue();
        String[] units = {"B", "KB", "MB", "GB"};
        int idx = 0;
        while (size >= 1024 && idx < units.length - 1) {
            size /= 1024.0;
            idx++;
        }
        return String.format("%.1f %s", size, units[idx]);
    }
}


