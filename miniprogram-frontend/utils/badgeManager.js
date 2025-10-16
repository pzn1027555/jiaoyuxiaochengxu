// utils/badgeManager.js
const BadgeApi = require('./badgeApi')

/**
 * 红点管理器 - 全局红点状态管理
 */
class BadgeManager {
  
  constructor() {
    // 红点状态缓存
    this.badgeCache = new Map()
    // 监听器列表
    this.listeners = new Map()
  }

  /**
   * 后端badgeKey到前端key的映射
   * 
   * 映射规则说明：
   * - 学生端：message_center → notifications (消息通知)
   * - 教师端：booking → booking (课程预约)
   * - 教师端：certification → certification (教师认证)
   * - 家长端：message_center → notifications (消息通知)
   */
  getBadgeKeyMapping() {
    return {
      // 学生/家长的消息通知
      'message_center': 'notifications',
      // 教师的课程预约和认证（保持一致）
      'booking': 'booking',
      'certification': 'certification'
    }
  }

  /**
   * 将后端badgeKey映射到前端使用的key
   */
  mapBadgeKey(backendKey) {
    const mapping = this.getBadgeKeyMapping()
    return mapping[backendKey] || backendKey
  }

  /**
   * 初始化用户红点状态
   */
  async initUserBadges(userId, userType) {
    try {
      const response = await BadgeApi.getBadgeStatus(userId, userType)
      if (response.code === 200 && response.data) {
        // 将红点状态存入缓存
        const cacheKey = `${userId}_${userType}`
        const badgeMap = new Map()
        
        response.data.forEach(badge => {
          // 映射后端key到前端key
          const frontendKey = this.mapBadgeKey(badge.badgeKey)
          
          badgeMap.set(frontendKey, {
            visible: badge.isVisible,
            count: badge.badgeCount,
            moduleName: badge.moduleName,
            originalKey: badge.badgeKey // 保存原始key用于反向查找
          })
        })
        
        this.badgeCache.set(cacheKey, badgeMap)
        
        // 通知所有监听器
        this.notifyListeners(userId, userType)
        
        console.log('初始化红点状态成功 (映射后):', Array.from(badgeMap.entries()))
        return response.data
      }
    } catch (error) {
      console.error('初始化红点状态失败:', error)
    }
    return []
  }

  /**
   * 获取指定红点状态
   */
  getBadgeStatus(userId, userType, badgeKey) {
    const cacheKey = `${userId}_${userType}`
    const userBadges = this.badgeCache.get(cacheKey)
    
    if (userBadges && userBadges.has(badgeKey)) {
      return userBadges.get(badgeKey)
    }
    
    return { visible: false, count: 0, moduleName: '' }
  }

  /**
   * 获取所有红点状态
   */
  getAllBadgeStatus(userId, userType) {
    const cacheKey = `${userId}_${userType}`
    const userBadges = this.badgeCache.get(cacheKey)
    
    if (userBadges) {
      const result = {}
      userBadges.forEach((value, key) => {
        result[key] = value
      })
      return result
    }
    
    return {}
  }

  /**
   * 获取原始的后端badgeKey
   */
  getOriginalBadgeKey(userId, userType, frontendKey) {
    const cacheKey = `${userId}_${userType}`
    const userBadges = this.badgeCache.get(cacheKey)
    
    if (userBadges && userBadges.has(frontendKey)) {
      const badge = userBadges.get(frontendKey)
      return badge.originalKey || frontendKey
    }
    
    return frontendKey
  }

  /**
   * 隐藏指定红点
   */
  async hideBadge(userId, userType, frontendKey) {
    try {
      // 获取原始的后端key
      const backendKey = this.getOriginalBadgeKey(userId, userType, frontendKey)
      
      const response = await BadgeApi.hideBadge(userId, userType, backendKey)
      if (response.code === 200) {
        // 更新缓存（使用前端key）
        this.updateBadgeCache(userId, userType, frontendKey, false, 0)
        
        // 通知监听器
        this.notifyListeners(userId, userType, frontendKey)
        
        console.log('隐藏红点成功:', frontendKey, '(后端key:', backendKey, ')')
        return true
      }
    } catch (error) {
      console.error('隐藏红点失败:', error)
    }
    return false
  }

  /**
   * 批量隐藏红点
   */
  async batchHideBadges(userId, userType, badgeKeys) {
    try {
      const response = await BadgeApi.batchHideBadges(userId, userType, badgeKeys)
      if (response.code === 200) {
        // 批量更新缓存
        badgeKeys.forEach(badgeKey => {
          this.updateBadgeCache(userId, userType, badgeKey, false, 0)
        })
        
        // 通知监听器
        this.notifyListeners(userId, userType)
        
        console.log('批量隐藏红点成功:', badgeKeys)
        return true
      }
    } catch (error) {
      console.error('批量隐藏红点失败:', error)
    }
    return false
  }

  /**
   * 更新红点缓存
   */
  updateBadgeCache(userId, userType, badgeKey, visible, count) {
    const cacheKey = `${userId}_${userType}`
    let userBadges = this.badgeCache.get(cacheKey)
    
    if (!userBadges) {
      userBadges = new Map()
      this.badgeCache.set(cacheKey, userBadges)
    }
    
    const currentBadge = userBadges.get(badgeKey) || {}
    userBadges.set(badgeKey, {
      ...currentBadge,
      visible,
      count
    })
  }

  /**
   * 添加监听器
   */
  addListener(userId, userType, badgeKey, callback) {
    const listenerKey = `${userId}_${userType}_${badgeKey || 'all'}`
    
    if (!this.listeners.has(listenerKey)) {
      this.listeners.set(listenerKey, [])
    }
    
    this.listeners.get(listenerKey).push(callback)
  }

  /**
   * 移除监听器
   */
  removeListener(userId, userType, badgeKey, callback) {
    const listenerKey = `${userId}_${userType}_${badgeKey || 'all'}`
    const callbacks = this.listeners.get(listenerKey)
    
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 通知监听器
   */
  notifyListeners(userId, userType, badgeKey = null) {
    // 通知特定红点的监听器
    if (badgeKey) {
      const specificKey = `${userId}_${userType}_${badgeKey}`
      const specificCallbacks = this.listeners.get(specificKey)
      if (specificCallbacks) {
        const badgeStatus = this.getBadgeStatus(userId, userType, badgeKey)
        specificCallbacks.forEach(callback => {
          try {
            callback(badgeStatus, badgeKey)
          } catch (error) {
            console.error('监听器回调执行失败:', error)
          }
        })
      }
    }
    
    // 通知全局监听器
    const globalKey = `${userId}_${userType}_all`
    const globalCallbacks = this.listeners.get(globalKey)
    if (globalCallbacks) {
      const allBadges = this.getAllBadgeStatus(userId, userType)
      globalCallbacks.forEach(callback => {
        try {
          callback(allBadges)
        } catch (error) {
          console.error('全局监听器回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 清除用户缓存
   */
  clearUserCache(userId, userType) {
    const cacheKey = `${userId}_${userType}`
    this.badgeCache.delete(cacheKey)
    
    // 清除相关监听器
    const keysToDelete = []
    this.listeners.forEach((value, key) => {
      if (key.startsWith(`${userId}_${userType}_`)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      this.listeners.delete(key)
    })
  }
}

// 创建单例实例
const badgeManager = new BadgeManager()

module.exports = badgeManager

