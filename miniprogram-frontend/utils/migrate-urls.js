// utils/migrate-urls.js - URL迁移脚本（开发时使用）
// 这个文件用于批量替换硬编码的URL，完成后可以删除

const fs = require('fs')
const path = require('path')

// 需要替换的文件和对应的替换规则
const replacements = [
  // 通用的toAbsolute方法替换
  {
    pattern: /toAbs?\(url\)\s*\{\s*try\s*\{\s*if\s*\(\s*!?url\s*\)\s*return\s*[^}]+\s*if\s*\(.*?startsWith\('http'\).*?\)\s*return\s*url[^}]+const\s+app\s*=\s*getApp\(\)[^}]+http:\/\/localhost:8080[^}]+return[^}]+\}\s*catch[^}]+\}/g,
    replacement: `toAbs(url) {
    const { toAbsolute } = require('../../../utils/urlUtils')
    return toAbsolute(url, 'static')
  }`
  },
  
  // 头像处理方法替换
  {
    pattern: /avatarAbs?\(url\)\s*\{\s*try\s*\{[^}]+default-avatar\.png[^}]+http:\/\/localhost:8080[^}]+\}\s*catch[^}]+default-avatar\.png[^}]+\}/g,
    replacement: `avatarAbs(url) {
    const { getAvatarUrl } = require('../../../utils/urlUtils')
    return getAvatarUrl(url)
  }`
  },
  
  // 直接的localhost:8080替换
  {
    pattern: /'http:\/\/localhost:8080'/g,
    replacement: "require('../../../utils/urlUtils').getStaticUrl('')"
  },
  
  // API地址替换
  {
    pattern: /url:\s*'http:\/\/localhost:8080\/api\//g,
    replacement: "url: require('../../../config/env').getApiBaseUrl() + '/"
  }
]

console.log('URL迁移脚本 - 仅供参考，实际替换请手动进行')
console.log('主要替换规则:')
replacements.forEach((rule, index) => {
  console.log(`${index + 1}. ${rule.pattern} -> ${rule.replacement}`)
})

module.exports = replacements
