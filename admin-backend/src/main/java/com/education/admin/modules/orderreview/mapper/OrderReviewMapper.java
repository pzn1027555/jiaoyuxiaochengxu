package com.education.admin.modules.orderreview.mapper;

import com.education.admin.modules.orderreview.entity.OrderReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderReviewMapper {
    OrderReview findByStudentAndOrder(@Param("studentId") Long studentId, @Param("orderId") Long orderId);
    int insert(OrderReview review);
}


