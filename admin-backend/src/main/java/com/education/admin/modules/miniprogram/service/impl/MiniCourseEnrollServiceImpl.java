package com.education.admin.modules.miniprogram.service.impl;

import com.education.admin.common.Result;
import com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleStudentMapper;
import com.education.admin.modules.miniprogram.service.MiniCourseEnrollService;
import com.education.admin.modules.order.entity.OrderInfo;
import com.education.admin.modules.order.service.OrderService;
import com.education.admin.modules.student.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniCourseEnrollServiceImpl implements MiniCourseEnrollService {

    private final TeacherScheduleStudentMapper scheduleStudentMapper;
    private final OrderService orderService;
    private final StudentMapper studentMapper;

    @Override
    @Transactional
    public Result<Object> enrollCourse(Map<String, Object> payload) {
        try {
            // 获取当前学生ID
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) {
                return Result.error("未登录学生");
            }

            // 获取参数
            Long courseId = asLong(payload.get("courseId"));
            Long scheduleId = asLong(payload.get("scheduleId"));
            Long teacherId = asLong(payload.get("teacherId"));
            Long parentId = asLong(payload.get("parentId"));
            String amount = String.valueOf(payload.get("amount"));

            if (scheduleId == null) {
                return Result.error("排课ID不能为空");
            }

            // 检查是否已经报名
            int existingEnrollment = scheduleStudentMapper.checkEnrollment(scheduleId, studentId);
            if (existingEnrollment > 0) {
                return Result.error("您已经报名了该课程");
            }

            // 创建订单记录
            OrderInfo orderInfo = new OrderInfo();
            orderInfo.setStudentId(studentId);
            orderInfo.setScheduleId(scheduleId);
            orderInfo.setTeacherId(teacherId);
            orderInfo.setCourseName("班课报名");
            orderInfo.setCourseType("small_class"); // 班课类型
            orderInfo.setLessonCount(1);
            
            try {
                BigDecimal actualAmount = new BigDecimal(amount);
                orderInfo.setUnitPrice(actualAmount);
                orderInfo.setTotalAmount(actualAmount);
                orderInfo.setActualAmount(actualAmount);
            } catch (Exception e) {
                log.warn("解析金额失败: {}", amount);
                orderInfo.setUnitPrice(new BigDecimal("0.00"));
                orderInfo.setTotalAmount(new BigDecimal("0.00"));
                orderInfo.setActualAmount(new BigDecimal("0.00"));
            }
            
            orderInfo.setOrderStatus(1); // 待支付
            orderInfo.setPaymentStatus(0); // 未支付
            orderInfo.setRemark("家长代付 - parentId: " + parentId);

            OrderInfo createdOrder = orderService.createOrder(orderInfo);

            // 添加学生到课程
            TeacherScheduleStudent enrollment = new TeacherScheduleStudent();
            enrollment.setScheduleId(scheduleId);
            enrollment.setStudentId(studentId);
            
            int insertResult = scheduleStudentMapper.insertEnrollment(enrollment);
            if (insertResult <= 0) {
                throw new RuntimeException("添加学生到课程失败");
            }

            // 返回成功结果
            Map<String, Object> result = new HashMap<>();
            result.put("orderId", createdOrder.getId());
            result.put("orderNo", createdOrder.getOrderNo());
            result.put("enrollmentId", enrollment.getId());
            result.put("message", "报名成功，代付请求已发送");

            log.info("学生 {} 成功报名课程，scheduleId: {}, orderId: {}", 
                     studentId, scheduleId, createdOrder.getId());

            return Result.success("报名成功", result);

        } catch (Exception e) {
            log.error("课程报名失败", e);
            return Result.error("报名失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Object> cancelEnrollment(Long scheduleId) {
        try {
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) {
                return Result.error("未登录学生");
            }

            if (scheduleId == null) {
                return Result.error("排课ID不能为空");
            }

            // 检查是否已报名
            int existingEnrollment = scheduleStudentMapper.checkEnrollment(scheduleId, studentId);
            if (existingEnrollment == 0) {
                return Result.error("您尚未报名该课程");
            }

            // 删除报名记录
            int deleteResult = scheduleStudentMapper.deleteEnrollment(scheduleId, studentId);
            if (deleteResult <= 0) {
                return Result.error("取消报名失败");
            }

            log.info("学生 {} 取消了课程报名，scheduleId: {}", studentId, scheduleId);
            return Result.success("取消报名成功");

        } catch (Exception e) {
            log.error("取消课程报名失败", e);
            return Result.error("取消报名失败");
        }
    }

    @Override
    public Result<Object> checkEnrollmentStatus(Long scheduleId) {
        try {
            Long studentId = resolveCurrentStudentId();
            if (studentId == null) {
                return Result.error("未登录学生");
            }

            if (scheduleId == null) {
                return Result.error("排课ID不能为空");
            }

            int enrollmentCount = scheduleStudentMapper.checkEnrollment(scheduleId, studentId);
            boolean isEnrolled = enrollmentCount > 0;

            Map<String, Object> result = new HashMap<>();
            result.put("isEnrolled", isEnrolled);
            result.put("scheduleId", scheduleId);
            result.put("studentId", studentId);

            return Result.success(result);

        } catch (Exception e) {
            log.error("检查课程报名状态失败", e);
            return Result.error("检查报名状态失败");
        }
    }

    private Long resolveCurrentStudentId() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String phone = request.getHeader("X-User-Phone");
            if (phone != null) {
                com.education.admin.modules.student.entity.Student student = studentMapper.findByPhone(phone);
                return student != null ? student.getId() : null;
            }
            return null;
        } catch (Exception e) {
            log.warn("获取当前学生ID失败", e);
            return null;
        }
    }

    private Long asLong(Object o) {
        try {
            return o == null ? null : Long.valueOf(String.valueOf(o));
        } catch (Exception e) {
            return null;
        }
    }
}
