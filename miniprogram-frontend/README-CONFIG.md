# 统一配置管理使用说明

## 概述

项目已完成后端地址的统一管理，所有接口地址、静态资源地址等都通过统一配置文件管理，方便环境切换。

## 环境配置

### 配置文件: `config/env.js`

```javascript
// 当前环境变量（修改这里来切换环境）
const CURRENT_ENV = 'development' // development | testing | production
```

**只需修改这一行即可切换环境！**

### 支持的环境

1. **development** - 开发环境 (`http://localhost:8080`)
2. **testing** - 测试环境 (`https://test-api.your-domain.com`) 
3. **production** - 生产环境 (`https://api.your-domain.com`)

## 使用方法

### 1. 基础配置获取

```javascript
const { getApiBaseUrl, getStaticBaseUrl } = require('../config/env')

// 获取API基础地址
const apiUrl = getApiBaseUrl() // http://localhost:8080/api

// 获取静态资源基础地址  
const staticUrl = getStaticBaseUrl() // http://localhost:8080
```

### 2. URL工具函数 (`utils/urlUtils.js`)

```javascript
const { getApiUrl, getStaticUrl, getAvatarUrl, getCoverUrl } = require('../utils/urlUtils')

// API地址
const loginUrl = getApiUrl('/mini/auth/wx-login')

// 静态资源地址
const imageUrl = getStaticUrl('/uploads/avatar.jpg')

// 头像地址（自动处理默认头像）
const avatarUrl = getAvatarUrl(user.avatar)

// 课程封面地址
const coverUrl = getCoverUrl(course.coverUrl)
```

### 3. 网络请求 (`utils/request.js`)

请求模块已自动使用统一配置，无需修改：

```javascript
const request = require('../utils/request')

// 自动使用配置的API地址
request.get('/mini/user/info')
request.post('/mini/auth/login', data)
```

### 4. API接口 (`utils/api.js`)

API模块已自动使用统一配置：

```javascript
const api = require('../utils/api')

// 所有API调用都会使用统一配置的地址
api.wxLogin(data)
api.survey.save(data)
```

## 迁移完成的功能

### 已更新的文件

✅ **配置文件**
- `config/env.js` - 环境配置
- `utils/urlUtils.js` - URL工具函数
- `utils/request.js` - 网络请求
- `utils/api.js` - API接口

✅ **核心页面**
- `app.js` - 全局配置
- `pages/teacher/schedule/schedule.js`
- `pages/teacher/schedule-plan/schedule-plan.js`
- `pages/teacher/profile/profile.js`
- `pages/teacher/income-overview/income-overview.js`
- `pages/teacher/certification/certification.js`
- `pages/teacher/teaching-records/teaching-records.js`
- `pages/teacher/schedule-edit/schedule-edit.js`
- `pages/student/teaching-records/teaching-records.js`
- `pages/student/head-teacher/head-teacher.js`
- `pages/parent/head-teacher/head-teacher.js`
- `pages/index/index.js`

✅ **功能说明**
- 所有硬编码的 `http://localhost:8080` 已替换
- 统一使用配置文件管理地址
- 支持一键环境切换
- 兼容原有的URL处理方法

## 环境切换步骤

### 切换到测试环境

1. 修改 `config/env.js`:
   ```javascript
   const CURRENT_ENV = 'testing'
   ```

2. 更新测试环境域名:
   ```javascript
   testing: {
     apiBaseUrl: 'https://test-api.your-domain.com/api',
     uploadBaseUrl: 'https://test-api.your-domain.com',
     staticBaseUrl: 'https://test-api.your-domain.com'
   }
   ```

### 切换到生产环境

1. 修改 `config/env.js`:
   ```javascript  
   const CURRENT_ENV = 'production'
   ```

2. 更新生产环境域名:
   ```javascript
   production: {
     apiBaseUrl: 'https://api.your-domain.com/api',
     uploadBaseUrl: 'https://api.your-domain.com', 
     staticBaseUrl: 'https://api.your-domain.com'
   }
   ```

## 注意事项

1. **环境切换后需要重新编译小程序**
2. **确保后端服务器支持对应的域名访问**
3. **生产环境需要在小程序管理后台配置服务器域名**
4. **静态资源路径以 `/images/` 开头的本地图片不受影响**

## 兼容性

- ✅ 向后兼容原有的 `toAbsolute()`、`getAvatarUrl()` 等方法
- ✅ 保持原有的API调用方式不变
- ✅ 自动处理相对路径和绝对路径
- ✅ 支持默认头像和封面图片

## 未来扩展

可以根据需要添加更多环境配置：

```javascript
// 可添加更多环境
staging: {
  apiBaseUrl: 'https://staging-api.your-domain.com/api',
  uploadBaseUrl: 'https://staging-api.your-domain.com',
  staticBaseUrl: 'https://staging-api.your-domain.com',
  debug: true,
  mockData: false
}
```

---

**现在只需要修改 `config/env.js` 中的 `CURRENT_ENV` 一个地方，就能切换整个项目的环境！** 🎉
