// 账户相关API（家长余额/消费记录）
const request = require('../utils/request')

const accountApi = {
  // 家长余额汇总
  getParentBalanceSummary(params = {}) {
    return request.get('/mini/account/parent/summary', params)
  },
  // 家长消费记录（按月）
  getParentConsumption(params = {}) {
    return request.get('/mini/account/parent/consumption', params)
  },
  // 家长充值（模拟）
  parentRechargeSimulate(data = {}) {
    return request.post('/mini/account/parent/recharge/simulate', data)
  }
}

module.exports = accountApi


