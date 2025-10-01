import request from '@/utils/request'

// === 教师推荐相关API ===

// 获取教师推荐列表
export function getRecommendationList(params) {
  return request({
    url: '/operation/recommendations',
    method: 'get',
    params
  })
}

// 获取教师推荐详情
export function getRecommendationDetail(id) {
  return request({
    url: `/operation/recommendations/${id}`,
    method: 'get'
  })
}

// 获取活跃推荐列表
export function getActiveRecommendations() {
  return request({
    url: '/operation/recommendations/active',
    method: 'get'
  })
}

// 根据类型获取推荐列表
export function getRecommendationsByType(type, limit = 10) {
  return request({
    url: `/operation/recommendations/type/${type}`,
    method: 'get',
    params: { limit }
  })
}

// 获取置顶推荐
export function getTopRecommendations(limit = 5) {
  return request({
    url: '/operation/recommendations/top',
    method: 'get',
    params: { limit }
  })
}

// 获取热门推荐排行
export function getHotRecommendations(limit = 10) {
  return request({
    url: '/operation/recommendations/hot',
    method: 'get',
    params: { limit }
  })
}

// 创建教师推荐
export function createRecommendation(data) {
  return request({
    url: '/operation/recommendations',
    method: 'post',
    data
  })
}

// 更新教师推荐
export function updateRecommendation(id, data) {
  return request({
    url: `/operation/recommendations/${id}`,
    method: 'put',
    data
  })
}

// 更新推荐状态
export function updateRecommendationStatus(id, status) {
  return request({
    url: `/operation/recommendations/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// 批量更新推荐状态
export function batchUpdateRecommendationStatus(recommendationIds, status) {
  return request({
    url: '/operation/recommendations/batch-status',
    method: 'post',
    data: { recommendationIds, status }
  })
}

// 设置推荐置顶
export function updateRecommendationTopStatus(id, isTop) {
  return request({
    url: `/operation/recommendations/${id}/top`,
    method: 'post',
    params: { isTop }
  })
}

// 删除教师推荐
export function deleteRecommendation(id) {
  return request({
    url: `/operation/recommendations/${id}`,
    method: 'delete'
  })
}

// 记录推荐展示
export function recordRecommendationDisplay(id) {
  return request({
    url: `/operation/recommendations/${id}/display`,
    method: 'post'
  })
}

// 记录推荐点击
export function recordRecommendationClick(id) {
  return request({
    url: `/operation/recommendations/${id}/click`,
    method: 'post'
  })
}

// 记录推荐转化
export function recordRecommendationConversion(id) {
  return request({
    url: `/operation/recommendations/${id}/conversion`,
    method: 'post'
  })
}

// === 裂变活动相关API ===

// 获取裂变活动列表
export function getActivityList(params) {
  return request({
    url: '/operation/activities',
    method: 'get',
    params
  })
}

// 获取活动详情
export function getActivityDetail(id) {
  return request({
    url: `/operation/activities/${id}`,
    method: 'get'
  })
}

// 获取活跃活动列表
export function getActiveActivities() {
  return request({
    url: '/operation/activities/active',
    method: 'get'
  })
}

// 获取进行中的活动
export function getOngoingActivities() {
  return request({
    url: '/operation/activities/ongoing',
    method: 'get'
  })
}

// 获取即将开始的活动
export function getUpcomingActivities(days = 7) {
  return request({
    url: '/operation/activities/upcoming',
    method: 'get',
    params: { days }
  })
}

// 获取即将结束的活动
export function getEndingSoonActivities(days = 3) {
  return request({
    url: '/operation/activities/ending-soon',
    method: 'get',
    params: { days }
  })
}

// 创建裂变活动
export function createActivity(data) {
  return request({
    url: '/operation/activities',
    method: 'post',
    data
  })
}

// 更新裂变活动
export function updateActivity(id, data) {
  return request({
    url: `/operation/activities/${id}`,
    method: 'put',
    data
  })
}

// 更新活动状态
export function updateActivityStatus(id, status) {
  return request({
    url: `/operation/activities/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// 启用/禁用活动
export function updateActivityEnabledStatus(id, isEnabled) {
  return request({
    url: `/operation/activities/${id}/enabled`,
    method: 'post',
    params: { isEnabled }
  })
}

// 删除活动
export function deleteActivity(id) {
  return request({
    url: `/operation/activities/${id}`,
    method: 'delete'
  })
}

// === 统计分析相关API ===

// 获取运营统计数据
export function getOperationStatistics() {
  return request({
    url: '/operation/statistics',
    method: 'get'
  })
}

// 获取推荐统计数据
export function getRecommendationStatistics() {
  return request({
    url: '/operation/statistics/recommendations',
    method: 'get'
  })
}

// 获取活动统计数据
export function getActivityStatistics() {
  return request({
    url: '/operation/statistics/activities',
    method: 'get'
  })
}

// 获取推荐类型分布
export function getRecommendationTypeDistribution() {
  return request({
    url: '/operation/statistics/recommendation-types',
    method: 'get'
  })
}

// 获取活动类型分布
export function getActivityTypeDistribution() {
  return request({
    url: '/operation/statistics/activity-types',
    method: 'get'
  })
}

// 获取推荐效果趋势
export function getRecommendationEffectTrend(days = 30) {
  return request({
    url: '/operation/statistics/recommendation-trend',
    method: 'get',
    params: { days }
  })
}

// 获取活动效果趋势
export function getActivityEffectTrend(days = 30) {
  return request({
    url: '/operation/statistics/activity-trend',
    method: 'get',
    params: { days }
  })
}

// 获取教师推荐排行榜
export function getTeacherRecommendationRanking(limit = 10) {
  return request({
    url: '/operation/ranking/recommendations',
    method: 'get',
    params: { limit }
  })
}

// 获取活动效果排行榜
export function getActivityRanking(orderBy = 'conversion_rate', limit = 10) {
  return request({
    url: '/operation/ranking/activities',
    method: 'get',
    params: { orderBy, limit }
  })
}

// 获取奖励发放统计
export function getRewardDistributionStatistics(activityId = null) {
  return request({
    url: '/operation/statistics/reward-distribution',
    method: 'get',
    params: activityId ? { activityId } : {}
  })
}

// === 投诉管理相关API ===

// 获取投诉列表
export function getComplaintList(params) {
  return request({
    url: '/operation/complaints',
    method: 'get',
    params
  })
}

// 获取投诉详情
export function getComplaintDetail(id) {
  return request({
    url: `/operation/complaints/${id}`,
    method: 'get'
  })
}

// 处理投诉
export function processComplaint(id, data) {
  return request({
    url: `/operation/complaints/${id}/process`,
    method: 'post',
    data
  })
}

// 更新投诉状态
export function updateComplaintStatus(id, status) {
  return request({
    url: `/operation/complaints/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// 批量更新投诉状态
export function batchUpdateComplaintStatus(complaintIds, status) {
  return request({
    url: '/operation/complaints/batch-status',
    method: 'post',
    data: { complaintIds, status }
  })
}

// 获取待处理投诉列表
export function getPendingComplaints(limit = 10) {
  return request({
    url: '/operation/complaints/pending',
    method: 'get',
    params: { limit }
  })
}

// 获取今日新增投诉列表
export function getTodayComplaints() {
  return request({
    url: '/operation/complaints/today',
    method: 'get'
  })
}

// 获取投诉统计数据
export function getComplaintStatistics() {
  return request({
    url: '/operation/statistics/complaints',
    method: 'get'
  })
}