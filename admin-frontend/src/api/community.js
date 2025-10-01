import request from '@/utils/request'

// === 帖子管理API ===

/**
 * 分页查询帖子列表
 */
export function getPostList(query) {
  return request({
    url: '/community/posts/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询帖子详情
 */
export function getPostDetail(id) {
  return request({
    url: `/community/posts/${id}`,
    method: 'get'
  })
}

/**
 * 根据关键词搜索帖子
 */
export function searchPosts(keyword, limit = 20) {
  return request({
    url: '/community/posts/search',
    method: 'get',
    params: { keyword, limit }
  })
}

/**
 * 创建帖子
 */
export function createPost(data) {
  return request({
    url: '/community/posts/create',
    method: 'post',
    data
  })
}

/**
 * 更新帖子
 */
export function updatePost(data) {
  return request({
    url: '/community/posts/update',
    method: 'put',
    data
  })
}

/**
 * 删除帖子
 */
export function deletePost(id) {
  return request({
    url: `/community/posts/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除帖子
 */
export function batchDeletePosts(postIds) {
  return request({
    url: '/community/posts/batch',
    method: 'delete',
    params: { postIds: postIds.join(',') }
  })
}

/**
 * 审核帖子
 */
export function auditPost(id, auditStatus, auditRemark) {
  return request({
    url: `/community/posts/${id}/audit`,
    method: 'put',
    params: { auditStatus, auditRemark }
  })
}

/**
 * 批量审核帖子
 */
export function batchAuditPosts(postIds, auditStatus, auditRemark) {
  return request({
    url: '/community/posts/batch-audit',
    method: 'put',
    params: { postIds: postIds.join(','), auditStatus, auditRemark }
  })
}

/**
 * 发布帖子
 */
export function publishPost(id) {
  return request({
    url: `/community/posts/${id}/publish`,
    method: 'put'
  })
}

/**
 * 下架帖子
 */
export function takeDownPost(id, reason) {
  return request({
    url: `/community/posts/${id}/take-down`,
    method: 'put',
    params: { reason }
  })
}

/**
 * 恢复帖子
 */
export function restorePost(id) {
  return request({
    url: `/community/posts/${id}/restore`,
    method: 'put'
  })
}

/**
 * 设置置顶
 */
export function setPostTop(id, isTop) {
  return request({
    url: `/community/posts/${id}/top`,
    method: 'put',
    params: { isTop }
  })
}

/**
 * 设置精华
 */
export function setPostEssence(id, isEssence) {
  return request({
    url: `/community/posts/${id}/essence`,
    method: 'put',
    params: { isEssence }
  })
}

/**
 * 设置推荐
 */
export function setPostRecommend(id, isRecommend) {
  return request({
    url: `/community/posts/${id}/recommend`,
    method: 'put',
    params: { isRecommend }
  })
}

/**
 * 标记违规
 */
export function markPostViolation(id, violationType, violationReason) {
  return request({
    url: `/community/posts/${id}/violation`,
    method: 'put',
    params: { violationType, violationReason }
  })
}

/**
 * 获取待审核帖子列表
 */
export function getPendingAuditPosts(limit = 20) {
  return request({
    url: '/community/posts/pending-audit',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取违规帖子列表
 */
export function getViolationPosts(violationType, limit = 20) {
  return request({
    url: '/community/posts/violations',
    method: 'get',
    params: { violationType, limit }
  })
}

/**
 * 获取热门帖子列表
 */
export function getHotPosts(limit = 20) {
  return request({
    url: '/community/posts/hot',
    method: 'get',
    params: { limit }
  })
}

// === 资源管理API ===

/**
 * 分页查询资源列表
 */
export function getResourceList(query) {
  return request({
    url: '/community/resources/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询资源详情
 */
export function getResourceDetail(id, source) {
  return request({
    url: `/community/resources/${id}`,
    method: 'get',
    params: source ? { source } : undefined
  })
}

/**
 * 根据关键词搜索资源
 */
export function searchResources(keyword, limit = 20) {
  return request({
    url: '/community/resources/search',
    method: 'get',
    params: { keyword, limit }
  })
}

/**
 * 创建资源
 */
export function createResource(data) {
  return request({
    url: '/community/resources/create',
    method: 'post',
    data
  })
}

/**
 * 更新资源
 */
export function updateResource(data) {
  return request({
    url: '/community/resources/update',
    method: 'put',
    data
  })
}

/**
 * 删除资源
 */
export function deleteResource(id, source) {
  return request({
    url: `/community/resources/${id}`,
    method: 'delete',
    params: source ? { source } : undefined
  })
}

/**
 * 批量删除资源
 */
export function batchDeleteResources(resourceIds) {
  return request({
    url: '/community/resources/batch',
    method: 'delete',
    params: { resourceIds: resourceIds.join(',') }
  })
}

/**
 * 审核资源
 */
export function auditResource(id, auditStatus, auditRemark) {
  return request({
    url: `/community/resources/${id}/audit`,
    method: 'put',
    params: { auditStatus, auditRemark }
  })
}

/**
 * 批量审核资源
 */
export function batchAuditResources(resourceIds, auditStatus, auditRemark) {
  return request({
    url: '/community/resources/batch-audit',
    method: 'put',
    params: { resourceIds: resourceIds.join(','), auditStatus, auditRemark }
  })
}

/**
 * 发布资源
 */
export function publishResource(id) {
  return request({
    url: `/community/resources/${id}/publish`,
    method: 'put'
  })
}

/**
 * 下架资源
 */
export function takeDownResource(id, reason) {
  return request({
    url: `/community/resources/${id}/take-down`,
    method: 'put',
    params: { reason }
  })
}

/**
 * 恢复资源
 */
export function restoreResource(id) {
  return request({
    url: `/community/resources/${id}/restore`,
    method: 'put'
  })
}

/**
 * 设置推荐
 */
export function setResourceRecommend(id, isRecommend) {
  return request({
    url: `/community/resources/${id}/recommend`,
    method: 'put',
    params: { isRecommend }
  })
}

/**
 * 设置精选
 */
export function setResourceFeatured(id, isFeatured) {
  return request({
    url: `/community/resources/${id}/featured`,
    method: 'put',
    params: { isFeatured }
  })
}

/**
 * 设置热门
 */
export function setResourceHot(id, isHot) {
  return request({
    url: `/community/resources/${id}/hot`,
    method: 'put',
    params: { isHot }
  })
}

/**
 * 标记违规
 */
export function markResourceViolation(id, violationType, violationReason) {
  return request({
    url: `/community/resources/${id}/violation`,
    method: 'put',
    params: { violationType, violationReason }
  })
}

/**
 * 获取待审核资源列表
 */
export function getPendingAuditResources(limit = 20) {
  return request({
    url: '/community/resources/pending-audit',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取违规资源列表
 */
export function getViolationResources(violationType, limit = 20) {
  return request({
    url: '/community/resources/violations',
    method: 'get',
    params: { violationType, limit }
  })
}

/**
 * 获取热门资源列表
 */
export function getHotResources(limit = 20) {
  return request({
    url: '/community/resources/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 下载资源
 */
export function downloadResource(id, userId, source) {
  return request({
    url: `/community/resources/${id}/download`,
    method: 'get',
    params: source ? { source, userId } : { userId }
  })
}

// === 分类管理API ===

/**
 * 获取分类列表
 */
export function getCategories(categoryType) {
  return request({
    url: '/community/categories',
    method: 'get',
    params: { categoryType }
  })
}

/**
 * 获取分类树
 */
export function getCategoryTree(categoryType) {
  return request({
    url: '/community/categories/tree',
    method: 'get',
    params: { categoryType }
  })
}

/**
 * 查询分类详情
 */
export function getCategoryDetail(id) {
  return request({
    url: `/community/categories/${id}`,
    method: 'get'
  })
}

/**
 * 创建分类
 */
export function createCategory(data) {
  return request({
    url: '/community/categories/create',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 */
export function updateCategory(data) {
  return request({
    url: '/community/categories/update',
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export function deleteCategory(id) {
  return request({
    url: `/community/categories/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用分类
 */
export function toggleCategoryStatus(id, isEnabled) {
  return request({
    url: `/community/categories/${id}/toggle`,
    method: 'put',
    params: { isEnabled }
  })
}

// === 统计分析API ===

/**
 * 获取社区统计数据
 */
export function getCommunityStatistics() {
  return request({
    url: '/community/statistics',
    method: 'get'
  })
}

/**
 * 获取帖子统计数据
 */
export function getPostStatistics() {
  return request({
    url: '/community/statistics/posts',
    method: 'get'
  })
}

/**
 * 获取资源统计数据
 */
export function getResourceStatistics() {
  return request({
    url: '/community/statistics/resources',
    method: 'get'
  })
}

/**
 * 获取违规统计数据
 */
export function getViolationStatistics() {
  return request({
    url: '/community/statistics/violations',
    method: 'get'
  })
}

/**
 * 获取帖子趋势数据
 */
export function getPostTrend(days = 30) {
  return request({
    url: '/community/statistics/post-trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取资源趋势数据
 */
export function getResourceTrend(days = 30) {
  return request({
    url: '/community/statistics/resource-trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取分类统计数据
 */
export function getCategoryStatistics() {
  return request({
    url: '/community/statistics/categories',
    method: 'get'
  })
}

/**
 * 获取热门标签统计
 */
export function getHotTagStatistics(limit = 20) {
  return request({
    url: '/community/statistics/hot-tags',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取活跃用户统计
 */
export function getActiveUserStatistics(limit = 20) {
  return request({
    url: '/community/statistics/active-users',
    method: 'get',
    params: { limit }
  })
}

// === 内容审核API ===

/**
 * 手动触发自动内容审核
 */
export function triggerAutoAudit() {
  return request({
    url: '/community/tasks/auto-audit',
    method: 'post'
  })
}

/**
 * 检测敏感词
 */
export function checkSensitiveWords(content) {
  return request({
    url: '/community/check/sensitive-words',
    method: 'post',
    params: { content }
  })
}

/**
 * 检测垃圾内容
 */
export function checkSpamContent(content) {
  return request({
    url: '/community/check/spam',
    method: 'post',
    params: { content }
  })
}

/**
 * 批量处理违规内容
 */
export function batchProcessViolations() {
  return request({
    url: '/community/tasks/process-violations',
    method: 'post'
  })
}

// === 定时任务API ===

/**
 * 自动下架过期内容
 */
export function autoTakeDownExpired() {
  return request({
    url: '/community/tasks/take-down-expired',
    method: 'post'
  })
}

/**
 * 清理删除内容
 */
export function cleanupDeleted() {
  return request({
    url: '/community/tasks/cleanup-deleted',
    method: 'post'
  })
}

/**
 * 更新热门内容
 */
export function updateHotContent() {
  return request({
    url: '/community/tasks/update-hot',
    method: 'post'
  })
}

/**
 * 生成统计报告
 */
export function generateReport() {
  return request({
    url: '/community/tasks/generate-report',
    method: 'post'
  })
}