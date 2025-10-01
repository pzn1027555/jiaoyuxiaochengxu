package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.order.mapper.OrderMapper;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.orderreview.entity.OrderReview;
import com.education.admin.modules.orderreview.mapper.OrderReviewMapper;
import com.education.admin.modules.miniprogram.service.MiniReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MiniReviewServiceImpl implements MiniReviewService {

    @Autowired
    private OrderReviewMapper reviewMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private StudentMapper studentMapper;

    @Override
    public Result<Map<String, Object>> checkReviewStatus(Long orderId) {
        try {
            // 解析当前学生ID
            Long studentId = resolveCurrentStudentId();
            boolean hasReviewed = false;
            if (studentId != null) {
                OrderReview exist = reviewMapper.findByStudentAndOrder(studentId, orderId);
                hasReviewed = (exist != null);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("hasReviewed", hasReviewed);
            result.put("orderId", orderId);

            return Result.success(result);
        } catch (Exception e) {
            log.error("检查评价状态失败", e);
            return Result.error("检查评价状态失败");
        }
    }

    @Override
    public Result<String> submitReview(Map<String, Object> params) {
        try {
            // 获取当前学生ID
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) {
                return Result.error("学生信息获取失败");
            }

            // 解析参数
            Long orderId = Long.valueOf(params.get("orderId").toString());
            Long teacherId = Long.valueOf(params.get("teacherId").toString());
            Integer starRating = Integer.valueOf(params.get("starRating").toString());
            String reviewContent = params.get("reviewContent").toString();
            Integer isAnonymous = Integer.valueOf(params.getOrDefault("isAnonymous", 0).toString());

            // 获取图片列表
            @SuppressWarnings("unchecked")
            List<String> reviewImages = (List<String>) params.get("reviewImages");

            // 检查是否已经评价过
            OrderReview existed = reviewMapper.findByStudentAndOrder(studentId, orderId);
            if (existed != null) {
                return Result.error("该订单已评价，无法重复评价");
            }

            // 获取订单信息以获取schedule_id
            com.education.admin.modules.order.entity.OrderInfo orderInfo = orderMapper.getOrderById(orderId);
            if (orderInfo == null) {
                return Result.error("订单信息不存在");
            }

            // 创建评价记录（新表）
            OrderReview review = new OrderReview();
            review.setStudentId(studentId);
            review.setTeacherId(teacherId);
            review.setOrderId(orderId);
            review.setStarRating(starRating);
            review.setReviewContent(reviewContent);
            review.setIsAnonymous(isAnonymous);
            review.setStatus(1);
            if (reviewImages != null) {
                review.setReviewImages(reviewImages);
            }

            // 设置schedule_id（如果订单中有）
            // 旧版实体未含scheduleId字段，这里沿用orderId字段保存订单ID（用于回查）

            // 设置course_id（保持兼容性，订单表已经没有course_id字段了）
            // review.setCourseId(null);

            // 插入评价记录（新表）
            int result = reviewMapper.insert(review);
            if (result > 0) {
                try{
                    // 评价完成：将订单状态更新为已完成(3)，支付状态保持已支付(1)
                    orderMapper.updateOrderStatus(orderId, 3, 1);
                }catch(Exception ignore){ }
                return Result.success("评价提交成功");
            } else {
                return Result.error("评价提交失败");
            }

        } catch (Exception e) {
            log.error("提交评价失败", e);
            return Result.error("提交评价失败：" + e.getMessage());
        }
    }

    @Override
    public Result<Map<String, Object>> getReviewDetail(Long orderId) {
        try {
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) {
                return Result.error("学生信息获取失败");
            }

            OrderReview review = reviewMapper.findByStudentAndOrder(studentId, orderId);
            if (review == null) {
                return Result.success(new java.util.HashMap<>());
            }

            Map<String, Object> data = new java.util.HashMap<>();
            data.put("orderId", review.getOrderId());
            data.put("teacherId", review.getTeacherId());
            data.put("starRating", review.getStarRating());
            data.put("reviewContent", review.getReviewContent());
            data.put("reviewImages", review.getReviewImages());
            data.put("isAnonymous", review.getIsAnonymous());
            data.put("createTime", review.getCreateTime());

            return Result.success(data);
        } catch (Exception e) {
            log.error("获取评价详情失败", e);
            return Result.error("获取评价详情失败");
        }
    }

    /**
     * 解析当前学生ID
     */
    private Long resolveCurrentStudentId() {
        try {
            // 从存储中获取用户信息
            String userPhone = getCurrentUserPhone();
            if (userPhone == null) {
                return null;
            }

            // 根据手机号查询学生信息
            Object student = studentMapper.findByPhone(userPhone);
            if (student != null && student instanceof com.education.admin.modules.student.entity.Student) {
                return ((com.education.admin.modules.student.entity.Student) student).getId();
            }
            return null;
        } catch (Exception e) {
            log.error("解析学生ID失败", e);
            return null;
        }
    }

    /**
     * 获取当前用户手机号
     */
    private String getCurrentUserPhone() {
        // 从请求头获取用户手机号
        try {
            org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes();
            jakarta.servlet.http.HttpServletRequest request = ((org.springframework.web.context.request.ServletRequestAttributes) 
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest();
            return request.getHeader("X-User-Phone");
        } catch (Exception e) {
            log.error("获取用户手机号失败", e);
            return null;
        }
    }
}
