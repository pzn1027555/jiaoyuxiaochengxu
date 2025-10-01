// config/env.js - 环境配置
const env = {
  // 开发环境配置
  development: {
    // API基础地址
    apiBaseUrl: 'http://localhost:8080/api',
    // 文件上传/下载基础地址
    uploadBaseUrl: 'http://localhost:8080/api',
    // 静态资源基础地址
    staticBaseUrl: 'http://localhost:8080/api',
    // 调试模式
    debug: true,
    // 模拟数据
    mockData: true
  },
  
  // 测试环境配置
  testing: {
    apiBaseUrl: 'http://localhost:8080/api',
    uploadBaseUrl: 'http://localhost:8080/api',
    staticBaseUrl: 'http://localhost:8080/api',
    debug: true,
    mockData: false
  },
  
  // 生产环境配置  
  production: {
    apiBaseUrl: 'https://www.xwsedumatch.cn/api',
    uploadBaseUrl: 'https://www.xwsedumatch.cn/api',
    staticBaseUrl: 'https://www.xwsedumatch.cn/api', 
    debug: false,
    mockData: false
  }
}

// 当前环境变量（修改这里来切换环境）
const CURRENT_ENV = 'development' // development | testing | production

// 获取当前环境配置
function getCurrentEnv() {
  return env[CURRENT_ENV] || env.development
}

// 获取API基础地址
function getApiBaseUrl() {
  return getCurrentEnv().apiBaseUrl
}

// 获取上传基础地址
function getUploadBaseUrl() {
  return getCurrentEnv().uploadBaseUrl
}

// 获取静态资源基础地址
function getStaticBaseUrl() {
  return getCurrentEnv().staticBaseUrl
}

// 判断是否为开发环境
function isDevelopment() {
  return CURRENT_ENV === 'development'
}

// 判断是否为生产环境
function isProduction() {
  return CURRENT_ENV === 'production'
}

// 获取完整URL（自动拼接基础地址）
function getFullUrl(path, type = 'api') {
  if (!path) return ''
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  let baseUrl = ''
  switch (type) {
    case 'api':
      baseUrl = getApiBaseUrl()
      break
    case 'upload':
    case 'static':
      baseUrl = getStaticBaseUrl()
      break
    default:
      baseUrl = getApiBaseUrl()
  }
  
  // 确保路径以 / 开头
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  
  return baseUrl + path
}

module.exports = {
  env,
  CURRENT_ENV,
  getCurrentEnv,
  getApiBaseUrl,
  getUploadBaseUrl, 
  getStaticBaseUrl,
  isDevelopment,
  isProduction,
  getFullUrl
