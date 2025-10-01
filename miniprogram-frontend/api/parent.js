const request = require('../utils/request')

const parentApi = {
  getStudyStats(params = {}) {
    return request.get('/mini/parent/stats', params)
  }
}

module.exports = parentApi


