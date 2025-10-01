const request = require('../utils/request')

function getCategoryTree() {
  return request.get('/mini/course-category/tree')
}

function getCategoryList() {
  return request.get('/mini/course-category/list')
}

module.exports = {
  getCategoryTree,
  getCategoryList
}
