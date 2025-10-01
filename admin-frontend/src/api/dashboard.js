import request from '@/utils/request'

// 获取仪表盘统计数据
export function getDashboardStatistics() {
  return request({
    url: '/dashboard/statistics',
    method: 'get'
  })
}

// 获取实时数据看板
export function getRealtimeData() {
  return request({
    url: '/dashboard/realtime',
    method: 'get'
  })
}

// 获取用户增长趋势
export function getUserGrowthTrend(startDate, endDate) {
  return request({
    url: '/dashboard/trend/user-growth',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取收入趋势
export function getRevenueTrend(startDate, endDate) {
  return request({
    url: '/dashboard/trend/revenue',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取客单价趋势
export function getOrderAmountTrend(startDate, endDate) {
  return request({
    url: '/dashboard/trend/order-amount',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取地区分布数据
export function getRegionDistribution() {
  return request({
    url: '/dashboard/distribution/region',
    method: 'get'
  })
}

// 获取城市渗透率分析
export function getCityPenetrationAnalysis() {
  return request({
    url: '/dashboard/analysis/city-penetration',
    method: 'get'
  })
}

// 获取教师审核面板数据
export function getTeacherAuditPanelData() {
  return request({
    url: '/dashboard/panel/teacher-audit',
    method: 'get'
  })
}

// 获取投诉处理面板数据
export function getComplaintPanelData() {
  return request({
    url: '/dashboard/panel/complaint',
    method: 'get'
  })
}

// 获取课程销售排行
export function getCourseRanking(limit = 10) {
  return request({
    url: '/dashboard/ranking/course',
    method: 'get',
    params: { limit }
  })
}

// 获取教师排行
export function getTeacherRanking(limit = 10) {
  return request({
    url: '/dashboard/ranking/teacher',
    method: 'get',
    params: { limit }
  })
}

// 获取学生等级分布
export function getStudentLevelDistribution() {
  return request({
    url: '/dashboard/distribution/student-level',
    method: 'get'
  })
}

// 获取订单状态分布
export function getOrderStatusDistribution() {
  return request({
    url: '/dashboard/distribution/order-status',
    method: 'get'
  })
}

// 获取用户活跃度分析
export function getUserActivityAnalysis() {
  return request({
    url: '/dashboard/analysis/user-activity',
    method: 'get'
  })
}

// 获取预测分析数据
export function getPredictionAnalysis() {
  return request({
    url: '/dashboard/analysis/prediction',
    method: 'get'
  })
}

// 刷新缓存数据
export function refreshCacheData() {
  return request({
    url: '/dashboard/refresh-cache',
    method: 'post'
  })
}