import request from '@/utils/request'

// 分页查询分类列表
export function getCategoryList(params) {
  return request({
    url: '/course-category/list',
    method: 'get',
    params
  })
}

// 获取所有分类（树形结构）
export function getCategoryTree() {
  return request({
    url: '/course-category/tree',
    method: 'get'
  })
}

// 获取分类详情
export function getCategoryDetail(id) {
  return request({
    url: `/course-category/${id}`,
    method: 'get'
  })
}

// 根据父ID查询子分类
export function getCategoriesByParent(parentId) {
  return request({
    url: `/course-category/parent/${parentId}`,
    method: 'get'
  })
}

// 查询顶级分类列表
export function getTopLevelCategories() {
  return request({
    url: '/course-category/top-level',
    method: 'get'
  })
}

// 查询启用的分类列表
export function getEnabledCategories() {
  return request({
    url: '/course-category/enabled',
    method: 'get'
  })
}

// 查询显示的分类列表
export function getVisibleCategories() {
  return request({
    url: '/course-category/visible',
    method: 'get'
  })
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/course-category',
    method: 'post',
    data
  })
}

// 更新分类信息
export function updateCategory(id, data) {
  return request({
    url: `/course-category/${id}`,
    method: 'put',
    data
  })
}

// 更新分类状态
export function updateCategoryStatus(id, status) {
  return request({
    url: `/course-category/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// 批量更新分类状态
export function batchUpdateCategoryStatus(data) {
  return request({
    url: '/course-category/batch-status',
    method: 'post',
    data
  })
}

// 更新分类显示状态
export function updateVisibleStatus(id, isVisible) {
  return request({
    url: `/course-category/${id}/visible`,
    method: 'post',
    params: { isVisible }
  })
}

// 更新分类排序
export function updateSortOrder(id, sortOrder) {
  return request({
    url: `/course-category/${id}/sort`,
    method: 'post',
    params: { sortOrder }
  })
}

// 重新计算分类课程数量
export function recalculateCourseCount(categoryIds) {
  return request({
    url: '/course-category/recalculate-course-count',
    method: 'post',
    data: categoryIds
  })
}

// 移动分类
export function moveCategory(id, newParentId) {
  return request({
    url: `/course-category/${id}/move`,
    method: 'post',
    params: { newParentId }
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/course-category/${id}`,
    method: 'delete'
  })
}

// 批量删除分类
export function batchDeleteCategories(categoryIds) {
  return request({
    url: '/course-category/batch',
    method: 'delete',
    data: categoryIds
  })
}

// 检查分类编码是否存在
export function checkCategoryCode(categoryCode, excludeId) {
  return request({
    url: '/course-category/check-code',
    method: 'get',
    params: { categoryCode, excludeId }
  })
}

// 检查分类名称是否存在
export function checkCategoryName(categoryName, parentId, excludeId) {
  return request({
    url: '/course-category/check-name',
    method: 'get',
    params: { categoryName, parentId, excludeId }
  })
}

// 查询分类及其所有子分类的ID
export function getCategoryAndChildrenIds(id) {
  return request({
    url: `/course-category/${id}/children-ids`,
    method: 'get'
  })
}

// 查询分类的所有父分类
export function getParentCategories(id) {
  return request({
    url: `/course-category/${id}/parents`,
    method: 'get'
  })
}

// 获取分类统计数据
export function getCategoryStatistics() {
  return request({
    url: '/course-category/statistics',
    method: 'get'
  })
}

// 获取分类层级统计
export function getCategoryStatisticsByLevel() {
  return request({
    url: '/course-category/statistics/level',
    method: 'get'
  })
}

// 获取分类课程数量统计
export function getCategoryStatisticsByCourseCount() {
  return request({
    url: '/course-category/statistics/course-count',
    method: 'get'
  })
}