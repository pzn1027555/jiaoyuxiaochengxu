import request from '@/utils/request'

export function listTeacherLevels() {
  return request({ url: '/system/teacher-level/list', method: 'get' })
}

export function getTeacherLevel(levelKey) {
  return request({ url: `/system/teacher-level/${levelKey}`, method: 'get' })
}

export function createTeacherLevel(data) {
  return request({ url: '/system/teacher-level', method: 'post', data })
}

export function updateTeacherLevel(id, data) {
  return request({ url: `/system/teacher-level/${id}`, method: 'put', data })
}

export function deleteTeacherLevel(id) {
  return request({ url: `/system/teacher-level/${id}`, method: 'delete' })
}


// 学习体系管理
export const learningSystemApi = {
  list() { return request({ url: '/system/learning-system/list', method: 'get' }) },
  create(data) { return request({ url: '/system/learning-system', method: 'post', data }) },
  update(id, data) { return request({ url: `/system/learning-system/${id}`, method: 'put', data }) },
  remove(id) { return request({ url: `/system/learning-system/${id}`, method: 'delete' }) },
}

// 统一课时价格配置
export const lessonPriceApi = {
  current() { return request({ url: '/system/lesson-price/current', method: 'get' }) },
  save(data) { return request({ url: '/system/lesson-price/save', method: 'post', data }) }
}

// 课程轮播图管理
export const courseBannerApi = {
  list(params) { return request({ url: '/system/course-banner/list', method: 'get', params }) },
  create(data) { return request({ url: '/system/course-banner', method: 'post', data }) },
  update(id, data) { return request({ url: `/system/course-banner/${id}`, method: 'put', data }) },
  remove(id) { return request({ url: `/system/course-banner/${id}`, method: 'delete' }) }
}

// 课程分类（科目）管理
export const courseCategoryApi = {
  list(params) { return request({ url: '/course-category/list', method: 'get', params }) },
  tree() { return request({ url: '/course-category/tree', method: 'get' }) },
  topLevel() { return request({ url: '/course-category/top-level', method: 'get' }) },
  detail(id) { return request({ url: `/course-category/${id}`, method: 'get' }) },
  create(data) { return request({ url: '/course-category', method: 'post', data }) },
  update(id, data){ return request({ url: `/course-category/${id}`, method: 'put', data }) },
  updateStatus(id, status){ return request({ url: `/course-category/${id}/status`, method: 'post', params: { status } }) },
  updateSort(id, sortOrder){ return request({ url: `/course-category/${id}/sort`, method: 'post', params: { sortOrder } }) },
  move(id, newParentId){ return request({ url: `/course-category/${id}/move`, method: 'post', params: { newParentId } }) },
  delete(id){ return request({ url: `/course-category/${id}`, method: 'delete' }) },
  batchDelete(ids){ return request({ url: '/course-category/batch', method: 'delete', data: ids }) },
  checkCode(categoryCode, excludeId){ return request({ url: '/course-category/check-code', method: 'get', params: { categoryCode, excludeId } }) },
  checkName(categoryName, parentId, excludeId){ return request({ url: '/course-category/check-name', method: 'get', params: { categoryName, parentId, excludeId } }) },
}

