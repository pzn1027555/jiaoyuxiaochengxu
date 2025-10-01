import request from '@/utils/request'

// 分页查询课程列表
export function getCourseList(params) {
  return request({
    url: '/course/list',
    method: 'get',
    params
  })
}

// 获取课程详情
export function getCourseDetail(id) {
  return request({
    url: `/course/${id}`,
    method: 'get'
  })
}

// 根据分类ID查询课程列表
export function getCoursesByCategory(categoryId) {
  return request({
    url: `/course/category/${categoryId}`,
    method: 'get'
  })
}

// 获取待审核的课程列表
export function getPendingAuditCourses() {
  return request({
    url: '/course/pending-audit',
    method: 'get'
  })
}

// 获取热门课程列表
export function getHotCourses(limit = 10) {
  return request({
    url: '/course/hot',
    method: 'get',
    params: { limit }
  })
}

// 获取推荐课程列表
export function getRecommendedCourses(limit = 10) {
  return request({
    url: '/course/recommended',
    method: 'get',
    params: { limit }
  })
}

// 根据教师ID查询课程列表
export function getCoursesByTeacher(teacherId) {
  return request({
    url: `/course/teacher/${teacherId}`,
    method: 'get'
  })
}

// 搜索课程
export function searchCourses(keyword, limit = 20) {
  return request({
    url: '/course/search',
    method: 'get',
    params: { keyword, limit }
  })
}

// 创建课程
export function createCourse(data) {
  return request({
    url: '/course',
    method: 'post',
    data
  })
}

// 更新课程信息
export function updateCourse(id, data) {
  return request({
    url: `/course/${id}`,
    method: 'put',
    data
  })
}

// 审核课程
export function auditCourse(data) {
  return request({
    url: '/course/audit',
    method: 'post',
    data
  })
}

// 批量操作课程
export function batchOperationCourse(data) {
  return request({
    url: '/course/batch',
    method: 'post',
    data
  })
}

// 更新课程状态（上架/下架）
export function updateCourseStatus(id, status) {
  return request({
    url: `/course/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// 设置课程热门状态
export function updateHotStatus(id, isHot) {
  return request({
    url: `/course/${id}/hot`,
    method: 'post',
    params: { isHot }
  })
}

// 设置课程推荐状态
export function updateRecommendStatus(id, isRecommended) {
  return request({
    url: `/course/${id}/recommend`,
    method: 'post',
    params: { isRecommended }
  })
}

// 更新课程分类
export function updateCourseCategory(id, categoryId) {
  return request({
    url: `/course/${id}/category`,
    method: 'post',
    params: { categoryId }
  })
}

// 增加课程浏览数
export function increaseViewCount(id) {
  return request({
    url: `/course/${id}/view`,
    method: 'post'
  })
}

// 增加课程收藏数
export function increaseFavoriteCount(id) {
  return request({
    url: `/course/${id}/favorite`,
    method: 'post'
  })
}

// 减少课程收藏数
export function decreaseFavoriteCount(id) {
  return request({
    url: `/course/${id}/favorite`,
    method: 'delete'
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/course/${id}`,
    method: 'delete'
  })
}

// 获取课程统计数据
export function getCourseStatistics() {
  return request({
    url: '/course/statistics',
    method: 'get'
  })
}

// 获取分类课程统计
export function getCourseStatisticsByCategory() {
  return request({
    url: '/course/statistics/category',
    method: 'get'
  })
}

// 获取课程类型统计
export function getCourseStatisticsByType() {
  return request({
    url: '/course/statistics/type',
    method: 'get'
  })
}

// 获取热门课程排行
export function getHotCoursesRanking(limit = 10) {
  return request({
    url: '/course/ranking/hot',
    method: 'get',
    params: { limit }
  })
}

// 获取课程销量排行
export function getCourseSalesRanking(limit = 10) {
  return request({
    url: '/course/ranking/sales',
    method: 'get',
    params: { limit }
  })
}