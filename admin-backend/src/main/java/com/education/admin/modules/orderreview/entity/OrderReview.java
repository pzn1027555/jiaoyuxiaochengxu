package com.education.admin.modules.orderreview.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderReview {
    private Long id;
    private Long orderId;
    private Long studentId;
    private Long teacherId;
    private Integer starRating;
    private String reviewContent;
    private List<String> reviewImages;
    private Integer isAnonymous;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}


