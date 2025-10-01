// utils/badgeApi.js
const { getApiBaseUrl } = require('../config/env')
const BASE_URL = getApiBaseUrl()

/**
 * 红点通知API工具类
 */
class BadgeApi {
  
  /**
   * 获取用户红点状态
   */
  static async getBadgeStatus(userId, userType) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/mini/badge/status`,
        method: 'GET',
        data: { userId, userType },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }

  /**
   * 隐藏指定红点
   */
  static async hideBadge(userId, userType, badgeKey) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/mini/badge/hide`,
        method: 'POST',
        data: { userId, userType, badgeKey },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }

  /**
   * 批量隐藏红点
   */
  static async batchHideBadges(userId, userType, badgeKeys) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/mini/badge/batch-hide`,
        method: 'POST',
        data: badgeKeys,
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }
}

module.exports = BadgeApi

