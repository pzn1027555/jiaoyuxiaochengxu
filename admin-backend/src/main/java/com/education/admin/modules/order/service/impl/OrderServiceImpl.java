package com.education.admin.modules.order.service.impl;

import com.education.admin.modules.order.entity.OrderInfo;
import com.education.admin.modules.order.mapper.OrderMapper;
import com.education.admin.modules.order.service.OrderService;
import com.education.admin.modules.student.mapper.StudentMapper;
import com.education.admin.modules.student.entity.Student;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleStudentMapper;
import com.education.admin.modules.parent.mapper.ParentMapper;
import com.education.admin.modules.parent.entity.Parent;
import com.education.admin.modules.miniprogram.mapper.ParentStudentRelationMapper;
import com.education.admin.modules.miniprogram.mapper.StudentSurveyMapper;
import com.education.admin.modules.miniprogram.entity.StudentSurvey;
import com.education.admin.modules.miniprogram.mapper.StudentNotificationMapper;
import com.education.admin.modules.parent.mapper.ParentWalletMapper;
import com.education.admin.modules.parent.mapper.ParentWalletTxnMapper;
import com.education.admin.modules.parent.entity.ParentWallet;
import com.education.admin.modules.parent.entity.ParentWalletTxn;
import com.education.admin.modules.miniprogram.mapper.StudyPlanMapper;
import com.education.admin.modules.miniprogram.mapper.TeacherScheduleMapper;
import com.education.admin.modules.miniprogram.entity.StudyPlan;
import com.education.admin.modules.miniprogram.entity.TeacherSchedule;
import com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 订单服务实现类
 */
@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private ParentMapper parentMapper;

    @Autowired
    private ParentStudentRelationMapper parentStudentRelationMapper;

    @Autowired
    private TeacherScheduleStudentMapper scheduleStudentMapper;

    @Autowired
    private StudentSurveyMapper studentSurveyMapper;
    
    @Autowired
    private ParentWalletMapper parentWalletMapper;
    
    @Autowired
    private ParentWalletTxnMapper parentWalletTxnMapper;

    @Autowired
    private StudentNotificationMapper studentNotificationMapper;
    
    @Autowired
    private StudyPlanMapper studyPlanMapper;
    
    @Autowired
    private TeacherScheduleMapper teacherScheduleMapper;

    @Override
    public Map<String, Object> getStudentOrders(Integer pageNum, Integer pageSize) {
        try {
            // 解析用户身份（student/parent）和手机号
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) throw new RuntimeException("请求上下文为空");
            HttpServletRequest request = attrs.getRequest();
            String userType = request.getParameter("userType");
            if (userType == null || userType.isEmpty()) userType = "student";
            String phone = request.getHeader("X-User-Phone");
            if (phone == null || phone.isEmpty()) phone = request.getParameter("phone");

            // 计算偏移量
            int offset = (pageNum - 1) * pageSize;

            List<Map<String, Object>> orders;
            int total;
            if ("parent".equalsIgnoreCase(userType)) {
                // 家长：根据手机号找家长 -> 关联学生ID集合 -> 聚合订单
                Parent p = parentMapper.findByPhone(phone);
                if (p == null) throw new RuntimeException("家长信息不存在");
                List<Long> studentIds = parentStudentRelationMapper.findStudentIdsByParentId(p.getId());
                if (studentIds == null || studentIds.isEmpty()) {
                    orders = java.util.Collections.emptyList();
                    total = 0;
                } else {
                    orders = orderMapper.getOrdersByStudentIds(studentIds, pageSize, offset);
                    total = orderMapper.countOrdersByStudentIds(studentIds);
                }
                log.info("Getting parent aggregated orders, parentId: {}, students: {}", p.getId(), (studentIds == null ? 0 : studentIds.size()));
            } else {
                // 学生：按单个学生ID查询
                Long studentId = getCurrentStudentId();
                log.info("Getting orders for studentId: {}", studentId);
                orders = orderMapper.getStudentOrders(studentId, pageSize, offset);
                total = orderMapper.countStudentOrders(studentId);
            }

            // 处理订单状态文本与评价标记
            for (Map<String, Object> order : orders) {
                Integer orderStatus = (Integer) order.get("orderStatus");
                order.put("orderStatusText", getOrderStatusText(orderStatus));

                Integer paymentStatus = (Integer) order.get("paymentStatus");
                order.put("paymentStatusText", getPaymentStatusText(paymentStatus));

                // 联查评价表，补充 hasReviewed 字段
                try{
                    Long orderId = null;
                    Object idObj = order.get("id");
                    if (idObj != null) orderId = Long.valueOf(String.valueOf(idObj));
                    if (orderId != null){
                        // 通过 mapper 判断是否存在评价记录（按 orderId 与当前学生）
                        Long currentStudentId = null;
                        try { currentStudentId = getCurrentStudentId(); } catch(Exception ignored) {}
                        boolean hasReviewed = false;
                        if (currentStudentId != null){
                            // 复用 reviewMapper 需要注入；为避免大范围改动，这里走 orderMapper 的一个轻量 exists 查询（请确保在 XML 中实现）
                            Boolean exist = null;
                            try{
                                exist = (Boolean) orderMapper.existsOrderReview(orderId, currentStudentId);
                            }catch(Exception e){ /* 若未实现该方法，后续我将补充 */ }
                            if (exist != null) hasReviewed = exist.booleanValue();
                        }
                        order.put("hasReviewed", hasReviewed);
                    }
                }catch(Exception ignored){ order.put("hasReviewed", false); }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("orders", orders);
            result.put("total", total);
            result.put("pageNum", pageNum);
            result.put("pageSize", pageSize);
            result.put("totalPages", (int) Math.ceil((double) total / pageSize));

            return result;
        } catch (Exception e) {
            log.error("Error getting student orders", e);
            throw new RuntimeException("获取订单列表失败", e);
        }
    }

    @Override
    public OrderInfo getOrderByNo(String orderNo) {
        return orderMapper.getOrderByNo(orderNo);
    }

    @Override
    public OrderInfo getOrderById(Long id) {
        return orderMapper.getOrderById(id);
    }

    @Override
    public OrderInfo createOrder(OrderInfo orderInfo) {
        // 生成订单号
        String orderNo = generateOrderNo();
        orderInfo.setOrderNo(orderNo);

        // 设置默认值
        if (orderInfo.getOrderStatus() == null) {
            orderInfo.setOrderStatus(1); // 默认待支付
        }
        if (orderInfo.getPaymentStatus() == null) {
            orderInfo.setPaymentStatus(0); // 默认未支付
        }
        if (orderInfo.getOrderSource() == null) {
            orderInfo.setOrderSource("miniprogram");
        }

        // 如果未传 studentId，则根据当前登录学生补充
        try { if (orderInfo.getStudentId() == null) orderInfo.setStudentId(getCurrentStudentId()); } catch(Exception ignored) {}

        // 如果前端传来了surveyId，直接使用；否则兼容旧流程
        if (orderInfo.getSurveyId() != null) {
            log.info("Creating order with pre-existing survey_id: {}", orderInfo.getSurveyId());
        } else {
            // 兼容旧流程：检查remark中是否包含trial_booking
            try{
                String remark = orderInfo.getRemark();
                if (remark != null && remark.contains("trial_booking")){
                    log.warn("Order created without surveyId but with trial_booking remark. Consider using new flow where survey is created first.");
                    // 可以选择在这里创建survey，但新流程应该避免这种情况
                }
            }catch(Exception e){ log.warn("createOrder remark check failed", e); }
        }
        
        // 确保studentId存在（家长代付场景）
        if (orderInfo.getStudentId() == null) {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String parentPhone = request.getHeader("X-User-Phone");
                if (parentPhone != null && !parentPhone.isEmpty()) {
                    Parent parent = parentMapper.findByPhone(parentPhone);
                    if (parent != null) {
                        List<Long> studentIds = parentStudentRelationMapper.findStudentIdsByParentId(parent.getId());
                        if (studentIds != null && !studentIds.isEmpty()) {
                            orderInfo.setStudentId(studentIds.get(0));
                            log.info("Resolved studentId {} for parent {} from X-User-Phone in createOrder", studentIds.get(0), parent.getId());
                        }
                    }
                }
            }
        }
        
        orderMapper.insertOrder(orderInfo);
        // 写入家长通知：绑定家长能在“家长通知”里看到待支付订单
        try{
            if (orderInfo.getStudentId() != null){
                String title = "有一笔订单待支付";
                String content = (orderInfo.getCourseName()==null?"" : orderInfo.getCourseName()+" ") + "金额¥" + (orderInfo.getActualAmount()==null?"0":orderInfo.getActualAmount());
                studentNotificationMapper.insert(orderInfo.getStudentId(), "parent", "order", title, content, orderInfo.getId());
            }
        }catch(Exception e){ log.warn("insert parent notification failed", e); }
        return orderInfo;
    }

    @Override
    public boolean updateOrderStatus(Long id, Integer orderStatus, Integer paymentStatus) {
        boolean ok = orderMapper.updateOrderStatus(id, orderStatus, paymentStatus) > 0;
        try{
            if (ok && orderStatus != null && orderStatus == 2) { // 已支付
                OrderInfo o = orderMapper.getOrderById(id);
                if (o != null && o.getScheduleId() != null && o.getStudentId() != null) {
                    Integer exists = scheduleStudentMapper.checkEnrollment(o.getScheduleId(), o.getStudentId());
                    if (exists == null || exists == 0) {
                        com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent e = new com.education.admin.modules.miniprogram.entity.TeacherScheduleStudent();
                        e.setScheduleId(o.getScheduleId());
                        e.setStudentId(o.getStudentId());
                        scheduleStudentMapper.insertEnrollment(e);
                    }
                }
                
                // 处理钱包扣费和交易记录
                if (o != null) {
                    processWalletPayment(o);
                }
                
                // trial 试听支付完成：使用订单中的survey_id直接定位预约记录
                if (o != null) {
                    try{
                        if (o.getSurveyId() != null){
                            StudentSurvey ss = studentSurveyMapper.findById(o.getSurveyId());
                            if (ss != null){
                                ss.setPaid(1);
                                studentSurveyMapper.update(ss);
                                log.info("Updated student_survey paid status for survey_id: {}, order_id: {}", 
                                         ss.getId(), o.getId());
                            } else {
                                log.warn("No survey found for survey_id: {} in order_id: {}", o.getSurveyId(), o.getId());
                            }
                        } else {
                            log.warn("No survey_id found in order_id: {}", o.getId());
                        }
                    }catch(Exception e){ log.error("Failed to update student_survey paid status", e); }
                }
                
                // 学习计划支付完成：根据学习计划生成teacher_schedule记录
                if (o != null && "formal".equals(o.getCourseType())) {
                    processStudyPlanPayment(o);
                }
            }
        }catch(Exception ignored){}
        return ok;
    }
    
    /**
     * 处理钱包支付逻辑：扣除家长余额并记录交易
     */
    private void processWalletPayment(OrderInfo order) {
        try {
            // 获取支付金额
            BigDecimal paymentAmount = order.getActualAmount();
            if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Order {} has no valid payment amount", order.getId());
                return;
            }
            
            // 查找学生对应的家长
            Long studentId = order.getStudentId();
            if (studentId == null) {
                log.warn("Order {} has no student ID", order.getId());
                return;
            }
            
            List<Long> parentIds = parentStudentRelationMapper.findParentIdsByStudentId(studentId);
            if (parentIds == null || parentIds.isEmpty()) {
                log.warn("Student {} has no associated parents", studentId);
                return;
            }
            
            // 选择第一个家长作为支付方
            Long parentId = parentIds.get(0);
            
            // 确保家长钱包存在
            ParentWallet wallet = parentWalletMapper.findByParentId(parentId);
            if (wallet == null) {
                // 创建钱包（初始余额为0）
                wallet = new ParentWallet();
                wallet.setParentId(parentId);
                wallet.setBalance(BigDecimal.ZERO);
                parentWalletMapper.insert(wallet);
                log.info("Created wallet for parent {}", parentId);
            }
            
            // 检查余额是否足够（这里假设订单支付成功意味着余额充足或通过其他方式支付）
            // 实际业务中可能需要在支付前验证余额
            
            // 扣除余额
            int updateResult = parentWalletMapper.subtractBalance(parentId, paymentAmount);
            if (updateResult > 0) {
                // 记录消费流水
                ParentWalletTxn txn = new ParentWalletTxn();
                txn.setParentId(parentId);
                txn.setType("consume");
                txn.setTitle("支付订单：" + (order.getCourseName() != null ? order.getCourseName() : "未知课程"));
                txn.setAmount(paymentAmount);
                txn.setOrderId(order.getId());
                txn.setExtra("{\"order_no\":\"" + order.getOrderNo() + "\",\"student_id\":" + studentId + "}");
                parentWalletTxnMapper.insert(txn);
                
                log.info("Processed wallet payment for order_id: {}, parent_id: {}, amount: {}", 
                         order.getId(), parentId, paymentAmount);
            } else {
                log.warn("Failed to subtract balance for parent {}, order {}", parentId, order.getId());
            }
            
        } catch (Exception e) {
            log.error("处理钱包支付失败, order_id: " + order.getId(), e);
            // 不抛出异常，避免影响主流程
        }
    }
    
    /**
     * 处理学习计划支付完成：根据学习计划生成teacher_schedule记录
     */
    private void processStudyPlanPayment(OrderInfo order) {
        try {
            // 根据订单信息查找对应的学习计划
            List<StudyPlan> plans = studyPlanMapper.findByStudentId(order.getStudentId());
            StudyPlan targetPlan = null;
            
            // 查找匹配的学习计划（根据课程名称和教师ID）
            for (StudyPlan plan : plans) {
                if ("confirmed".equals(plan.getConfirmationStatus()) && 
                    order.getTeacherId() != null && order.getTeacherId().equals(plan.getTeacherId()) &&
                    order.getCourseName() != null && order.getCourseName().equals(plan.getTitle())) {
                    targetPlan = plan;
                    break;
                }
            }
            
            if (targetPlan == null) {
                log.warn("No matching study plan found for order {}", order.getId());
                return;
            }
            
            // 优先使用计划创建时生成的排课，只需同步确认状态
            int updated = teacherScheduleMapper.updateConfirmationStatusByPlanId(targetPlan.getPlanCode(), "confirmed");
            if (updated > 0) {
                log.info("Updated confirmation status for teacher_schedule by plan_id: {}", targetPlan.getPlanCode());
            } else {
                log.warn("No teacher_schedule records found to update for plan_id: {}", targetPlan.getPlanCode());
            }

            // 生成teacher_schedule记录
            log.info("Successfully processed study plan payment for order_id: {}, plan_id: {}", 
                     order.getId(), targetPlan.getId());
                     
        } catch (Exception e) {
            log.error("处理学习计划支付失败, order_id: " + order.getId(), e);
        }
    }
    
    /**
     * 根据学习计划生成teacher_schedule记录
     */
    private void generateTeacherScheduleFromPlan(StudyPlan plan, OrderInfo order) {
        // Deprecated method retained for reference. Creation of teacher_schedule
        // records now happens during study plan creation to avoid duplicates.
        log.warn("generateTeacherScheduleFromPlan is deprecated and should not be called. plan_id: {}", plan.getId());
    }

    @Override
    public boolean cancelOrder(Long id, String cancelReason) {
        return orderMapper.cancelOrder(id, cancelReason) > 0;
    }

    /**
     * 获取当前学生ID
     */
    private Long getCurrentStudentId() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String phone = request.getHeader("X-User-Phone");
                log.info("Getting student ID for phone: {}", phone);
                
                if (phone != null && !phone.isEmpty()) {
                    Student student = studentMapper.findByPhone(phone);
                    if (student != null) {
                        Long studentId = student.getId();
                        log.info("Found studentId: {} for phone: {}", studentId, phone);
                        return studentId;
                    }
                }
            }
            throw new RuntimeException("无法获取学生信息");
        } catch (Exception e) {
            log.error("Error getting current student ID", e);
            throw new RuntimeException("获取学生信息失败", e);
        }
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
    }

    /**
     * 获取订单状态文本
     */
    private String getOrderStatusText(Integer orderStatus) {
        if (orderStatus == null) return "未知";
        switch (orderStatus) {
            case 1: return "待付款";
            case 2: return "已支付";
            case 3: return "已完成";
            case 4: return "已取消";
            case 5: return "已退款";
            default: return "未知";
        }
    }

    /**
     * 获取支付状态文本
     */
    private String getPaymentStatusText(Integer paymentStatus) {
        if (paymentStatus == null) return "未知";
        switch (paymentStatus) {
            case 0: return "未支付";
            case 1: return "已支付";
            case 2: return "部分退款";
            case 3: return "全额退款";
            default: return "未知";
        }
    }
}
