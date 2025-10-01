import request from '@/utils/request'

// 教研活动
export function researchList() {
  return request({ url: '/admin/research-post/list', method: 'get' })
}

export function researchCreate(data) {
  return request({ url: '/admin/research-post/create', method: 'post', data })
}

export function researchUpdate(id, data) {
  return request({ url: `/admin/research-post/${id}`, method: 'put', data })
}

export function researchDelete(id) {
  return request({ url: `/admin/research-post/${id}`, method: 'delete' })
}

// 就业服务
export function employmentList() {
  return request({ url: '/admin/employment-post/list', method: 'get' })
}

export function employmentCreate(data) {
  return request({ url: '/admin/employment-post/create', method: 'post', data })
}

export function employmentUpdate(id, data) {
  return request({ url: `/admin/employment-post/${id}`, method: 'put', data })
}

export function employmentDelete(id) {
  return request({ url: `/admin/employment-post/${id}`, method: 'delete' })
}

// 应聘申请管理
export function employmentApplicationList(params) {
  return request({ url: '/admin/employment-application/list', method: 'get', params })
}



