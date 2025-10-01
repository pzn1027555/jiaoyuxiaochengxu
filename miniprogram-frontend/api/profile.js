// 用户资料相关API
const request = require('../utils/request')

const profileApi = {
  /**
   * 获取用户资料
   */
  getUserProfile() {
    return request.get('/mini/profile/info')
  },

  /**
   * 获取学生资料（仅 student_info）
   */
  getStudentProfile(params = {}) {
    return request.get('/mini/profile/student', params)
  },

  /**
   * 获取家长资料（仅 parent_info）
   */
  getParentProfile(params = {}) {
    return request.get('/mini/profile/parent', params)
  },

  /** 学生余额 */
  // 已移除

  /** 学生关注老师数量 */
  getStudentFollowedCount(params = {}) {
    return request.get('/mini/profile/student/followed/count', params)
  },

  /** 学生课程数量 */
  getStudentCourseCount(params = {}) {
    return request.get('/mini/profile/student/course/count', params)
  },

  /**
   * 更新用户资料
   */
  updateUserProfile(data) {
    return request.post('/mini/profile/update', data)
  }
}

module.exports = profileApi
