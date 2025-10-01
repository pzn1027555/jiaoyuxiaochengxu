// utils/request.js - 网络请求封装
const auth = require('./auth')
const { getCurrentEnv, getApiBaseUrl } = require('../config/env')

const currentEnv = getCurrentEnv()

const request = {
  baseURL: getApiBaseUrl(),
  timeout: 10000,

  // GET请求
  get(url, params = {}) {
    return this.request('GET', url, params)
  },

  // POST请求
  post(url, data = {}) {
    return this.request('POST', url, data)
  },

  // PUT请求
  put(url, data = {}) {
    return this.request('PUT', url, data)
  },

  // DELETE请求
  delete(url, params = {}) {
    return this.request('DELETE', url, params)
  },

  // 通用请求方法 - 支持对象参数和传统参数
  request(methodOrOptions, url, data = {}) {
    // 支持对象参数形式 {url, method, data}
    if (typeof methodOrOptions === 'object' && methodOrOptions !== null) {
      const options = methodOrOptions
      const method = options.method || 'GET'
      url = options.url
      data = options.data || {}
      return this.request(method, url, data)
    }
    
    // 传统参数形式
    const method = methodOrOptions
    
    return new Promise((resolve, reject) => {
      // 全局：当用户需要选择角色时，阻止除登录/角色选择页以外的网络请求
      try{
        const ui = auth.getUserInfo()
        if (ui && ui.needRoleSelection) {
          let currentRoute = ''
          try {
            const pages = getCurrentPages()
            if (pages && pages.length) currentRoute = pages[pages.length - 1].route || ''
          } catch(_) {}
          const isLogin = currentRoute === 'pages/login/login'
          const isRoleSelect = currentRoute === 'pages/role-select/role-select'
          // 仅在非登录、非角色选择页时拦截请求
          if (!isLogin && !isRoleSelect) {
            return resolve({ success:false, message:'NEED_ROLE_SELECTION' })
          }
        }
      }catch(e){}
      // 显示加载提示
      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      // 构建完整URL
      const fullUrl = (url && url.startsWith('http')) ? url : this.baseURL + (url || '')

      // 构建请求参数
      const requestData = method === 'GET' ? {} : data
      const requestParams = method === 'GET' ? data : {}

      // 构建查询字符串
      let queryString = ''
      if (Object.keys(requestParams).length > 0) {
        queryString = '?' + Object.keys(requestParams)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(requestParams[key])}`)
          .join('&')
      }

      // 获取token
      const token = auth.getToken()

      // 构建请求头
      const header = {
        'Content-Type': 'application/json'
      }

      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      // 附加手机号，便于后端无需JWT识别用户
      try {
        const userInfo = auth.getUserInfo() || {}
        const phone = userInfo.phone || userInfo?.teacher_info?.phone || userInfo?.student_info?.phone || userInfo?.parent_info?.phone
        if (phone) {
          header['X-User-Phone'] = phone
        }
      } catch (e) {
        // 忽略读取手机号错误
      }

      // 发起请求
      wx.request({
        url: fullUrl + queryString,
        data: requestData,
        method: method,
        header: header,
        timeout: this.timeout,
        success: (res) => {
          wx.hideLoading()

          if (currentEnv.debug) {
            console.log(`[${method}] ${url}`, {
              request: data,
              response: res.data
            })
          }

          // 处理HTTP状态码
          if (res.statusCode === 200) {
            const responseData = res.data

            // 兼容 {code:200} 与 {success:true}，并对裸数组/对象兜底
            const isOk = responseData && (responseData.code === 200 || responseData.success === true)
            if (isOk) {
              const data =
                responseData.data !== undefined ? responseData.data :
                responseData.result !== undefined ? responseData.result :
                responseData.records !== undefined ? responseData.records :
                responseData
              resolve({ success: true, data, message: responseData.message || responseData.msg || 'OK' })
            } else if (Array.isArray(responseData) || (responseData && typeof responseData === 'object' && responseData.code === undefined && responseData.success === undefined)) {
              resolve({ success: true, data: responseData, message: 'OK' })
            } else {
              this.handleBusinessError(responseData)
              reject({ success: false, message: (responseData && (responseData.message || responseData.msg)) || '操作失败' })
            }
          } else if (res.statusCode === 401) {
            // 未授权，清除登录信息并跳转到登录页
            this.handleUnauthorized()
            reject({ message: '登录已过期，请重新登录' })
          } else if (res.statusCode === 403) {
            // 权限不足
            wx.showToast({
              title: '权限不足',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '权限不足' })
          } else if (res.statusCode === 404) {
            wx.showToast({
              title: '请求的资源不存在',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '请求的资源不存在' })
          } else if (res.statusCode >= 500) {
            wx.showToast({
              title: '服务器错误',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '服务器错误' })
          } else {
            wx.showToast({
              title: '网络错误',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '网络错误' })
          }
        },
        fail: (error) => {
          wx.hideLoading()

          if (currentEnv.debug) {
            console.error(`[${method}] ${url} 请求失败:`, error)
          }

          // 网络错误处理
          if (error.errMsg.includes('timeout')) {
            wx.showToast({
              title: '请求超时',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '请求超时' })
          } else if (error.errMsg.includes('fail')) {
            wx.showToast({
              title: '网络连接失败',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '网络连接失败' })
          } else {
            wx.showToast({
              title: '请求失败',
              icon: 'none',
              duration: 2000
            })
            reject({ message: '请求失败' })
          }
        }
      })
    })
  },

  // 处理业务错误
  handleBusinessError(responseData) {
    const message = responseData.message || '操作失败'
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },

  // 处理未授权错误
  handleUnauthorized() {
    // 清除登录信息
    auth.removeToken()
    auth.removeUserInfo()

    // 通知App实例更新登录状态
    const app = getApp()
    if (app && app.logout) {
      app.logout()
    } else {
      // 如果App实例不可用，直接跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  },

  // 设置基础URL
  setBaseURL(baseURL) {
    this.baseURL = baseURL
  },

  // 设置超时时间
  setTimeout(timeout) {
    this.timeout = timeout
  }
}

module.exports = request