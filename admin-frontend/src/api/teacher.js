import request from '@/utils/request'

// 分页查询教师列表
export function getTeacherList(params) {
  return request({
    url: '/teacher/list',
    method: 'get',
    params
  })
}

// 获取教师详情
export function getTeacherDetail(id) {
  return request({
    url: `/teacher/${id}`,
    method: 'get'
  })
}

// 获取待审核教师列表
export function getPendingAuditTeachers() {
  return request({
    url: '/teacher/pending-audit',
    method: 'get'
  })
}

// 获取风险教师列表
export function getRiskTeachers() {
  return request({
    url: '/teacher/risk-teachers',
    method: 'get'
  })
}

// 获取推荐教师列表
export function getRecommendedTeachers() {
  return request({
    url: '/teacher/recommended',
    method: 'get'
  })
}

// 磨课：获取申请列表
export function getMoocApplications(params) {
  return request({
    url: '/mooc/applications',
    method: 'get',
    params
  })
}

// 磨课：审核
export function auditMoocApplication(data) {
  return request({
    url: '/mooc/audit',
    method: 'post',
    params: data
  })
}

// 磨课：小组列表
export function getMoocGroups() {
  return request({
    url: '/mooc/groups',
    method: 'get'
  })
}

// 创建教师
export function createTeacher(data) {
  return request({
    url: '/teacher',
    method: 'post',
    data
  })
}

// 更新教师信息
export function updateTeacher(id, data) {
  return request({
    url: `/teacher/${id}`,
    method: 'put',
    data
  })
}

// 审核教师
export function auditTeacher(id, data) {
  return request({
    url: `/teacher/${id}/audit`,
    method: 'put',
    data
  })
}

// 批量操作教师
export function batchOperation(data) {
  return request({
    url: '/teacher/batch',
    method: 'post',
    data
  })
}

// 发送电子合同
export function sendContract(id) {
  return request({
    url: `/teacher/${id}/send-contract`,
    method: 'post'
  })
}

// 签署合同
export function signContract(id, contractUrl) {
  return request({
    url: `/teacher/${id}/sign-contract`,
    method: 'post',
    params: { contractUrl }
  })
}

// 更新教师风险等级
export function updateRiskLevel(id) {
  return request({
    url: `/teacher/${id}/update-risk`,
    method: 'post'
  })
}

// 增加抽查次数
export function increaseCheckCount(id) {
  return request({
    url: `/teacher/${id}/check`,
    method: 'post'
  })
}

// 雪藏/解除雪藏教师
export function toggleHidden(id) {
  return request({
    url: `/teacher/${id}/toggle-hidden`,
    method: 'post'
  })
}

// 推荐/取消推荐教师
export function toggleRecommend(id) {
  return request({
    url: `/teacher/${id}/toggle-recommend`,
    method: 'post'
  })
}

// 手动调整佣金比例
export function adjustCommissionRate(id, commissionRate) {
  return request({
    url: `/teacher/${id}/adjust-commission`,
    method: 'post',
    params: { commissionRate }
  })
}

// 删除教师
export function deleteTeacher(id) {
  return request({
    url: `/teacher/${id}`,
    method: 'delete'
  })
}

// 获取教师统计数据
export function getTeacherStatistics() {
  return request({
    url: '/teacher/statistics',
    method: 'get'
  })
}