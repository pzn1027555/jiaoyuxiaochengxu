// 科目相关API（统一为 utils/request 的使用方式）
const request = require('../utils/request')

// 获取科目分类列表（两级结构）
function getSubjectCategories() {
  // 基础URL由 request 内部拼接，无需再带 /api 前缀
  return request.get('/mini/profile/subjects')
}

module.exports = {
  getSubjectCategories
}
