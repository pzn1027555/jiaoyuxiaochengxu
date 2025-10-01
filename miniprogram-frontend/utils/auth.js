// utils/auth.js - 认证相关工具函数

const auth = {
  // Token存储键
  TOKEN_KEY: 'user_token',
  USER_INFO_KEY: 'user_info',

  // 获取token
  getToken() {
    try {
      return wx.getStorageSync(this.TOKEN_KEY) || ''
    } catch (e) {
      console.error('获取token失败:', e)
      return ''
    }
  },

  // 设置token
  setToken(token) {
    try {
      wx.setStorageSync(this.TOKEN_KEY, token)
      return true
    } catch (e) {
      console.error('保存token失败:', e)
      return false
    }
  },

  // 移除token
  removeToken() {
    try {
      wx.removeStorageSync(this.TOKEN_KEY)
      return true
    } catch (e) {
      console.error('移除token失败:', e)
      return false
    }
  },

  // 获取用户信息
  getUserInfo() {
    try {
      const userInfo = wx.getStorageSync(this.USER_INFO_KEY)
      console.log('auth.getUserInfo原始数据:', userInfo)
      
      if (!userInfo) {
        return null
      }
      
      // 如果已经是对象，直接返回；否则解析JSON
      const parsedUserInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      console.log('auth.getUserInfo解析后:', parsedUserInfo)
      return parsedUserInfo
    } catch (e) {
      console.error('获取用户信息失败:', e)
      return null
    }
  },

  // 统一设置角色结构，兼容 student_info/teacher_info/parent_info
  setUserInfo(userInfo) {
    try {
      const normalized = { ...userInfo }
      // 如果没有统一 role，但包含任一信息，推断 role
      if (!normalized.role) {
        // 优先检测家长，再学生，再老师，避免多角色时误识别
        if (normalized.parent_info) normalized.role = 'parent'
        else if (normalized.student_info) normalized.role = 'student'
        else if (normalized.teacher_info) normalized.role = 'teacher'
      }
      wx.setStorageSync(this.USER_INFO_KEY, JSON.stringify(normalized))
      return true
    } catch (e) {
      console.error('保存用户信息失败:', e)
      return false
    }
  },


  // 移除用户信息
  removeUserInfo() {
    try {
      wx.removeStorageSync(this.USER_INFO_KEY)
      return true
    } catch (e) {
      console.error('移除用户信息失败:', e)
      return false
    }
  },

  // 检查是否已登录
  isLoggedIn() {
    const token = this.getToken()
    const userInfo = this.getUserInfo()
    console.log('auth.isLoggedIn检查:', {
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      userRole: userInfo ? userInfo.role : 'null'
    })
    return !!token && !!userInfo  // 需要有token和用户信息
  },

  // 检查用户角色
  getUserRole() {
    const userInfo = this.getUserInfo()
    const role = userInfo ? userInfo.role : ''
    console.log('auth.getUserRole:', role)
    return role
  },

  // 检查用户是否有特定角色
  hasRole(role) {
    return this.getUserRole() === role
  },

  // 检查是否是学生
  isStudent() {
    return this.hasRole('student')
  },

  // 检查是否是家长
  isParent() {
    return this.hasRole('parent')
  },

  // 检查是否是教师
  isTeacher() {
    return this.hasRole('teacher')
  },

  // 获取微信授权
  getWxAuth() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('微信登录成功，code:', res.code)
            resolve(res.code)
          } else {
            console.error('微信登录失败:', res.errMsg)
            reject(new Error('微信登录失败'))
          }
        },
        fail: (error) => {
          console.error('微信登录失败:', error)
          reject(error)
        }
      })
    })
  },

  // 获取微信用户信息
  getWxUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('获取微信用户信息成功:', res.userInfo)
          resolve(res.userInfo)
        },
        fail: (error) => {
          console.error('获取微信用户信息失败:', error)
          reject(error)
        }
      })
    })
  },

  // 获取手机号
  getPhoneNumber(e) {
    return new Promise((resolve, reject) => {
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        console.log('获取手机号成功:', e.detail)
        resolve(e.detail)
      } else {
        console.error('获取手机号失败:', e.detail.errMsg)
        reject(new Error('获取手机号失败'))
      }
    })
  },

  // 清除所有认证信息
  clear() {
    this.removeToken()
    this.removeUserInfo()
  },

  // 格式化用户角色显示名称
  getRoleDisplayName(role) {
    const roleMap = {
      'student': '学生',
      'parent': '家长',
      'teacher': '教师'
    }
    return roleMap[role] || '未知'
  },

  // 检查角色权限
  checkPermission(requiredRole) {
    const currentRole = this.getUserRole()
    if (!currentRole) {
      return false
    }

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentRole)
    }

    return currentRole === requiredRole
  },

  // 验证token是否过期
  isTokenExpired() {
    const userInfo = this.getUserInfo()
    if (!userInfo || !userInfo.tokenExpire) {
      return true
    }

    const now = new Date().getTime()
    const expireTime = new Date(userInfo.tokenExpire).getTime()
    
    return now >= expireTime
  }
}

module.exports = auth