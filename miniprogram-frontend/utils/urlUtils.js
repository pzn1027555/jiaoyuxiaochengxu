// utils/urlUtils.js - URL地址统一管理工具
const { getApiBaseUrl, getStaticBaseUrl, getFullUrl } = require('../config/env')

/**
 * URL工具类
 */
const urlUtils = {
  
  /**
   * 获取完整的API地址
   * @param {string} path API路径
   * @returns {string} 完整URL
   */
  getApiUrl(path) {
    return getFullUrl(path, 'api')
  },

  /**
   * 获取完整的静态资源地址
   * @param {string} path 资源路径
   * @returns {string} 完整URL
   */
  getStaticUrl(path) {
    return getFullUrl(path, 'static')
  },

  /**
   * 转换为绝对URL（兼容旧方法名）
   * @param {string} url 相对或绝对URL
   * @param {string} type URL类型：'api' | 'static' | 'upload'
   * @returns {string} 绝对URL
   */
  toAbsolute(url, type = 'static') {
    if (!url) return ''
    
    // 如果已经是绝对URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // 如果是本地图片路径（以/images开头），直接返回
    if (url.startsWith('/images/') || url.startsWith('images/')) {
      return url
    }

    return getFullUrl(url, type)
  },

  /**
   * 获取头像完整地址
   * @param {string} avatarUrl 头像相对路径
   * @returns {string} 头像完整URL或默认头像
   */
  getAvatarUrl(avatarUrl) {
    if (!avatarUrl) {
      return '/images/workspace/default-avatar.png'
    }
    
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl
    }

    if (avatarUrl.startsWith('/images/') || avatarUrl.startsWith('images/')) {
      return avatarUrl
    }

    try {
      return getStaticBaseUrl() + (avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl)
    } catch (e) {
      return '/images/workspace/default-avatar.png'
    }
  },

  /**
   * 获取课程封面完整地址
   * @param {string} coverUrl 封面相对路径
   * @returns {string} 封面完整URL或空字符串
   */
  getCoverUrl(coverUrl) {
    if (!coverUrl) return ''
    
    if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
      return coverUrl
    }

    if (coverUrl.startsWith('/images/') || coverUrl.startsWith('images/')) {
      return coverUrl
    }

    try {
      return getStaticBaseUrl() + (coverUrl.startsWith('/') ? coverUrl : '/' + coverUrl)
    } catch (e) {
      return ''
    }
  },

  /**
   * 获取上传文件完整地址
   * @param {string} filePath 文件相对路径
   * @returns {string} 文件完整URL
   */
  getUploadUrl(filePath) {
    return this.toAbsolute(filePath, 'upload')
  },

  /**
   * 兼容旧的全局方法（用于渐进式迁移）
   */
  
  // 兼容原有的 toAbsolute 方法
  toAbs: function(url) {
    return this.toAbsolute(url, 'static')
  },

  // 兼容原有的 getFullUrl 方法
  getFullImageUrl: function(url) {
    return this.toAbsolute(url, 'static')
  },

  // 兼容原有的 avatarAbs 方法
  avatarAbs: function(url) {
    return this.getAvatarUrl(url)
  }
}

/**
 * 全局函数（向后兼容）
 */

// 导出兼容的全局函数
function toAbsolute(url, type = 'static') {
  return urlUtils.toAbsolute(url, type)
}

function getFullImageUrl(url) {
  return urlUtils.getCoverUrl(url)
}

function getAvatarUrl(url) {
  return urlUtils.getAvatarUrl(url)
}

module.exports = {
  urlUtils,
  toAbsolute,
  getFullImageUrl, 
  getAvatarUrl,
  // 以下是主要导出的方法
  getApiUrl: urlUtils.getApiUrl.bind(urlUtils),
  getStaticUrl: urlUtils.getStaticUrl.bind(urlUtils),
  getCoverUrl: urlUtils.getCoverUrl.bind(urlUtils),
  getUploadUrl: urlUtils.getUploadUrl.bind(urlUtils)
}
