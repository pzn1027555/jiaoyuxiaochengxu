const request = require('../utils/request')

module.exports = {
  list(params = {}) { return request.get('/mini/notification/list', params) },
  markRead(params = {}) { return request.post('/mini/notification/read', params) },
  markAll(params = {}) { return request.post('/mini/notification/read/all', params) }
}
