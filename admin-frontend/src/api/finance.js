import request from '@/utils/request'

// === 订单管理API ===

/**
 * 分页查询订单列表
 */
export function getOrderList(query) {
  return request({
    url: '/finance/orders/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询订单详情
 */
export function getOrderDetail(id) {
  return request({
    url: `/finance/orders/${id}`,
    method: 'get'
  })
}

/**
 * 根据订单号查询订单
 */
export function getOrderByNo(orderNo) {
  return request({
    url: `/finance/orders/by-no/${orderNo}`,
    method: 'get'
  })
}

/**
 * 创建订单
 */
export function createOrder(data) {
  return request({
    url: '/finance/orders/create',
    method: 'post',
    data
  })
}

/**
 * 更新订单
 */
export function updateOrder(data) {
  return request({
    url: '/finance/orders/update',
    method: 'put',
    data
  })
}

/**
 * 更新订单状态
 */
export function updateOrderStatus(id, status) {
  return request({
    url: `/finance/orders/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 更新支付信息
 */
export function updatePaymentInfo(id, paymentMethod, transactionId) {
  return request({
    url: `/finance/orders/${id}/payment`,
    method: 'put',
    params: { paymentMethod, transactionId }
  })
}

/**
 * 更新课程进度
 */
export function updateCourseProgress(id, completedCount) {
  return request({
    url: `/finance/orders/${id}/progress`,
    method: 'put',
    params: { completedCount }
  })
}

/**
 * 取消订单
 */
export function cancelOrder(id, reason) {
  return request({
    url: `/finance/orders/${id}/cancel`,
    method: 'put',
    params: { reason }
  })
}

/**
 * 完成订单
 */
export function completeOrder(id) {
  return request({
    url: `/finance/orders/${id}/complete`,
    method: 'put'
  })
}

/**
 * 批量更新订单状态
 */
export function batchUpdateOrderStatus(orderIds, status) {
  return request({
    url: '/finance/orders/batch-status',
    method: 'put',
    params: { orderIds: orderIds.join(','), status }
  })
}

/**
 * 删除订单
 */
export function deleteOrder(id) {
  return request({
    url: `/finance/orders/${id}`,
    method: 'delete'
  })
}

// === 退款管理API ===

/**
 * 分页查询退款记录列表
 */
export function getRefundList(query) {
  return request({
    url: '/finance/refunds/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询退款记录详情
 */
export function getRefundDetail(id) {
  return request({
    url: `/finance/refunds/${id}`,
    method: 'get'
  })
}

/**
 * 申请退款
 */
export function applyRefund(orderId, refundAmount, refundReason) {
  return request({
    url: '/finance/refunds/apply',
    method: 'post',
    params: { orderId, refundAmount, refundReason }
  })
}

/**
 * 审核退款申请
 */
export function auditRefund(id, refundStatus, auditRemark) {
  return request({
    url: `/finance/refunds/${id}/audit`,
    method: 'put',
    params: { refundStatus, auditRemark }
  })
}

/**
 * 处理退款
 */
export function processRefund(id, actualRefundAmount, processingFee) {
  return request({
    url: `/finance/refunds/${id}/process`,
    method: 'put',
    params: { actualRefundAmount, processingFee }
  })
}

/**
 * 完成退款
 */
export function completeRefund(id) {
  return request({
    url: `/finance/refunds/${id}/complete`,
    method: 'put'
  })
}

/**
 * 拒绝退款
 */
export function rejectRefund(id, rejectReason) {
  return request({
    url: `/finance/refunds/${id}/reject`,
    method: 'put',
    params: { rejectReason }
  })
}

/**
 * 批量审核退款
 */
export function batchAuditRefund(refundIds, refundStatus, auditRemark) {
  return request({
    url: '/finance/refunds/batch-audit',
    method: 'put',
    params: { refundIds: refundIds.join(','), refundStatus, auditRemark }
  })
}

/**
 * 获取待审核退款列表
 */
export function getPendingAuditRefunds(limit = 20) {
  return request({
    url: '/finance/refunds/pending-audit',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取待处理退款列表
 */
export function getPendingProcessRefunds(limit = 20) {
  return request({
    url: '/finance/refunds/pending-process',
    method: 'get',
    params: { limit }
  })
}

// === 财务报表API ===

/**
 * 生成财务报表
 */
export function generateFinancialReport(reportDate, reportType) {
  return request({
    url: '/finance/reports/generate',
    method: 'post',
    params: { reportDate, reportType }
  })
}

/**
 * 获取财务报表列表
 */
export function getFinancialReports(reportType, limit = 20) {
  return request({
    url: '/finance/reports/list',
    method: 'get',
    params: { reportType, limit }
  })
}

/**
 * 查询财务报表详情
 */
export function getFinancialReportDetail(id) {
  return request({
    url: `/finance/reports/${id}`,
    method: 'get'
  })
}

/**
 * 删除财务报表
 */
export function deleteFinancialReport(id) {
  return request({
    url: `/finance/reports/${id}`,
    method: 'delete'
  })
}

/**
 * 重新生成财务报表
 */
export function regenerateFinancialReport(reportDate, reportType) {
  return request({
    url: '/finance/reports/regenerate',
    method: 'post',
    params: { reportDate, reportType }
  })
}

// === 财务统计API ===

/**
 * 获取财务统计数据
 */
export function getFinancialStatistics() {
  return request({
    url: '/finance/statistics',
    method: 'get'
  })
}

/**
 * 获取订单统计数据
 */
export function getOrderStatistics() {
  return request({
    url: '/finance/statistics/orders',
    method: 'get'
  })
}

/**
 * 获取退款统计数据
 */
export function getRefundStatistics() {
  return request({
    url: '/finance/statistics/refunds',
    method: 'get'
  })
}

/**
 * 获取收入趋势数据
 */
export function getRevenueTrend(days = 30) {
  return request({
    url: '/finance/statistics/revenue-trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取订单趋势数据
 */
export function getOrderTrend(days = 30) {
  return request({
    url: '/finance/statistics/order-trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取退款趋势数据
 */
export function getRefundTrend(days = 30) {
  return request({
    url: '/finance/statistics/refund-trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取支付方式分布
 */
export function getPaymentMethodDistribution() {
  return request({
    url: '/finance/statistics/payment-methods',
    method: 'get'
  })
}

/**
 * 获取课程类型收入分布
 */
export function getCourseTypeRevenue() {
  return request({
    url: '/finance/statistics/course-types',
    method: 'get'
  })
}

/**
 * 获取教师收入排行
 */
export function getTeacherRevenueRanking(limit = 10) {
  return request({
    url: '/finance/statistics/teacher-revenue-ranking',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取学生消费排行
 */
export function getStudentConsumptionRanking(limit = 10) {
  return request({
    url: '/finance/statistics/student-consumption-ranking',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取月度收入对比
 */
export function getMonthlyRevenueComparison(months = 12) {
  return request({
    url: '/finance/statistics/monthly-comparison',
    method: 'get',
    params: { months }
  })
}

/**
 * 获取指定时间范围的收入统计
 */
export function getRevenueStatistics(startTime, endTime) {
  return request({
    url: '/finance/statistics/revenue-by-period',
    method: 'get',
    params: { startTime, endTime }
  })
}

/**
 * 获取客单价统计
 */
export function getOrderAmountStatistics(startTime, endTime) {
  return request({
    url: '/finance/statistics/order-amount',
    method: 'get',
    params: { startTime, endTime }
  })
}

/**
 * 获取退款率统计
 */
export function getRefundRateStatistics() {
  return request({
    url: '/finance/statistics/refund-rate',
    method: 'get'
  })
}

/**
 * 获取支付成功率统计
 */
export function getPaymentSuccessRateStatistics() {
  return request({
    url: '/finance/statistics/payment-success-rate',
    method: 'get'
  })
}

// === 财务分析API ===

/**
 * 分析收入趋势
 */
export function analyzeRevenueTrend() {
  return request({
    url: '/finance/analysis/revenue-trend',
    method: 'get'
  })
}

/**
 * 分析用户价值
 */
export function analyzeCustomerValue() {
  return request({
    url: '/finance/analysis/customer-value',
    method: 'get'
  })
}

/**
 * 分析课程盈利能力
 */
export function analyzeCourseProfit() {
  return request({
    url: '/finance/analysis/course-profit',
    method: 'get'
  })
}

/**
 * 分析教师贡献度
 */
export function analyzeTeacherContribution() {
  return request({
    url: '/finance/analysis/teacher-contribution',
    method: 'get'
  })
}

/**
 * 预测收入
 */
export function predictRevenue(futureDays = 30) {
  return request({
    url: '/finance/analysis/revenue-prediction',
    method: 'get',
    params: { futureDays }
  })
}

// === 定时任务API ===

/**
 * 手动生成日报
 */
export function generateDailyReport() {
  return request({
    url: '/finance/tasks/generate-daily-report',
    method: 'post'
  })
}

/**
 * 手动生成周报
 */
export function generateWeeklyReport() {
  return request({
    url: '/finance/tasks/generate-weekly-report',
    method: 'post'
  })
}

/**
 * 手动生成月报
 */
export function generateMonthlyReport() {
  return request({
    url: '/finance/tasks/generate-monthly-report',
    method: 'post'
  })
}

/**
 * 手动生成年报
 */
export function generateYearlyReport() {
  return request({
    url: '/finance/tasks/generate-yearly-report',
    method: 'post'
  })
}

/**
 * 手动取消超时订单
 */
export function cancelTimeoutOrders() {
  return request({
    url: '/finance/tasks/cancel-timeout-orders',
    method: 'post'
  })
}

/**
 * 清理过期数据
 */
export function cleanupExpiredData() {
  return request({
    url: '/finance/tasks/cleanup-expired-data',
    method: 'post'
  })
}