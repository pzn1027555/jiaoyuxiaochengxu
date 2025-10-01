// 学生相关API
const request = require('../utils/request')

// 获取教师的学生列表
function getTeacherStudents(params) {
  return request.get('/mini/teacher/students', params)
}

// 获取全部学生（用于排课选择器）
function getAllStudents(params) {
  // 使用 /mini/profile/students/all（已存在控制器）
  return request.get('/mini/profile/students/all', params)
}

module.exports = {
  getTeacherStudents,
  getAllStudents
}
