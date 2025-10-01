import request from '@/utils/request'

// 获取教师认证列表
export function getCertificationList(params) {
  return request({
    url: '/admin/teacher/certification/list',
    method: 'get',
    params
  })
}

// 获取认证详情
export function getCertificationDetail(id) {
  return request({
    url: `/admin/teacher/certification/${id}`,
    method: 'get'
  })
}

// 审核教师认证
export function auditCertification(data) {
  return request({
    url: '/admin/teacher/certification/audit',
    method: 'post',
    data
  })
}

// 更新面试结果
export function updateInterviewResult(data) {
  return request({
    url: '/admin/teacher/certification/interview-result',
    method: 'post',
    params: data
  })
}

// 获取认证统计
export function getCertificationStatistics() {
  return request({
    url: '/admin/teacher/certification/statistics',
    method: 'get'
  })
}

// 教师评级
export function gradeTeacher(data) {
  return request({
    url: '/admin/teacher/certification/grade',
    method: 'post',
    data
  })
}