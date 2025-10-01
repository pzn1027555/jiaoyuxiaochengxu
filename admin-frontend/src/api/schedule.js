import request from '@/utils/request'

// 后台：课程管理-课程列表（来源于 teacher_schedule 联表）
export function getScheduleList(params) {
  return request({
    url: '/schedule/list',
    method: 'get',
    params
  })
}


// 管理端：创建班课计划（批量生成 teacher_schedule）
export function createBigClassPlan(data) {
  return request({
    url: '/admin/schedule/big-class/plan',
    method: 'post',
    data
  })
}


