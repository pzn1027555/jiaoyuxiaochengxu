// utils/replaceUtils.js - 通用URL处理方法（全局）
const { toAbsolute, getAvatarUrl, getCoverUrl } = require('./urlUtils')

// 全局方法，供页面直接调用
global.toAbsolute = toAbsolute
global.getAvatarUrl = getAvatarUrl 
global.getCoverUrl = getCoverUrl

// 兼容方法
global.toAbs = toAbsolute
global.avatarAbs = getAvatarUrl

module.exports = {
  toAbsolute,
  getAvatarUrl,
  getCoverUrl,
  toAbs: toAbsolute,
  avatarAbs: getAvatarUrl
}
