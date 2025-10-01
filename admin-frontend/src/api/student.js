import request from '@/utils/request'

// 分页查询学生列表
export function getStudentList(params) {
  return request({
    url: '/student/list',
    method: 'get',
    params
  })
}

// 获取学生详情
export function getStudentDetail(id) {
  return request({
    url: `/student/${id}`,
    method: 'get'
  })
}

// 获取需要续课提醒的学生列表
export function getStudentsNeedingRenewalReminder(reminderThreshold = 10) {
  return request({
    url: '/student/renewal-reminder',
    method: 'get',
    params: { reminderThreshold }
  })
}

// 获取紧急续课提醒的学生列表
export function getUrgentRenewalStudents() {
  return request({
    url: '/student/urgent-renewal',
    method: 'get'
  })
}

// 获取普通续课提醒的学生列表
export function getNormalRenewalStudents() {
  return request({
    url: '/student/normal-renewal',
    method: 'get'
  })
}

// 根据等级查询学生列表
export function getStudentsByLevel(level) {
  return request({
    url: `/student/level/${level}`,
    method: 'get'
  })
}

// 获取活跃学生列表
export function getActiveStudents(days = 30) {
  return request({
    url: '/student/active',
    method: 'get',
    params: { days }
  })
}

// 创建学生
export function createStudent(data) {
  return request({
    url: '/student',
    method: 'post',
    data
  })
}

// 更新学生信息
export function updateStudent(id, data) {
  return request({
    url: `/student/${id}`,
    method: 'put',
    data
  })
}

// 更新学生等级
export function updateStudentLevel(data) {
  return request({
    url: '/student/update-level',
    method: 'post',
    data
  })
}

// 批量更新学生等级
export function batchUpdateStudentLevel(data) {
  return request({
    url: '/student/batch-update-level',
    method: 'post',
    data
  })
}

// 更新剩余课程数
export function updateRemainingCourses(id, remainingCourses) {
  return request({
    url: `/student/${id}/update-courses`,
    method: 'post',
    params: { remainingCourses }
  })
}

// 发送续课提醒
export function sendRenewalReminder(data) {
  return request({
    url: '/student/send-renewal-reminder',
    method: 'post',
    data
  })
}

// 标记续课提醒已发送
export function markRenewalReminderSent(studentIds) {
  return request({
    url: '/student/mark-reminder-sent',
    method: 'post',
    data: studentIds
  })
}

// 重置续课提醒状态
export function resetRenewalReminderStatus(id) {
  return request({
    url: `/student/${id}/reset-reminder`,
    method: 'post'
  })
}

// 增加投诉次数
export function increaseComplaintCount(id) {
  return request({
    url: `/student/${id}/complaint`,
    method: 'post'
  })
}

// 增加推荐次数
export function increaseReferralCount(id) {
  return request({
    url: `/student/${id}/referral`,
    method: 'post'
  })
}

// 更新学生状态
export function updateStudentStatus(id, status) {
  return request({
    url: `/student/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// 批量更新学生状态
export function batchUpdateStudentStatus(data) {
  return request({
    url: '/student/batch-update-status',
    method: 'post',
    data
  })
}

// 删除学生
export function deleteStudent(id) {
  return request({
    url: `/student/${id}`,
    method: 'delete'
  })
}

// 获取学生统计数据
export function getStudentStatistics() {
  return request({
    url: '/student/statistics',
    method: 'get'
  })
}

// 获取学生地区分布
export function getStudentDistributionByRegion() {
  return request({
    url: '/student/distribution/region',
    method: 'get'
  })
}

// 获取学生等级分布
export function getStudentLevelDistribution() {
  return request({
    url: '/student/distribution/level',
    method: 'get'
  })
}

// 获取学生状态分布
export function getStudentStatusDistribution() {
  return request({
    url: '/student/distribution/status',
    method: 'get'
  })
}

// 获取学生消费分析
export function getStudentConsumptionAnalysis() {
  return request({
    url: '/student/analysis/consumption',
    method: 'get'
  })
}

// 自动等级升级检查
export function autoUpgradeStudentLevels() {
  return request({
    url: '/student/auto-upgrade-levels',
    method: 'post'
  })
}

// 自动发送续课提醒
export function autoSendRenewalReminders() {
  return request({
    url: '/student/auto-send-reminders',
    method: 'post'
  })
}