// app.js
const api = require('./utils/api')
const auth = require('./utils/auth')

App({
  onLaunch(options) {
    console.log('小程序启动', options)
    
    // 检查更新
    this.checkUpdate()
    
    // 初始化全局数据
    this.initGlobalData()
    // 安装全局页面守卫
    this.installPageGuard()
    
    // 检查登录状态和角色路由
    this.checkLoginStatusAndRoute()
  },

  onShow(options) {
    console.log('小程序显示', options)
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(error) {
    console.error('小程序错误', error)
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本')
        }
      })

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: '更新失败',
          content: '新版本下载失败，请检查网络后重试',
          showCancel: false
        })
      })
    }
  },

  // 初始化全局数据
  initGlobalData() {
    this.globalData = {
      userInfo: null,
      token: '',
      userRole: '', // student, parent, teacher
      isLogin: false,
      systemInfo: null,
      apiBaseUrl: require('./config/env').getStaticBaseUrl()
    }

    // 获取系统信息 - 使用新的API替代已弃用的wx.getSystemInfo
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.globalData.systemInfo = systemInfo
      console.log('系统信息', systemInfo)
    } catch (error) {
      console.error('获取系统信息失败', error)
    }
  },

  // 全局页面守卫：包装 Page 构造，注入 onShow 校验
  onLaunchGuardInstalled: false,
  installPageGuard(){
    if (this.onLaunchGuardInstalled) return
    this.onLaunchGuardInstalled = true
    const origPage = Page
    const auth = require('./utils/auth')
    // 包装 Page
    // eslint-disable-next-line no-global-assign
    Page = function(def){
      const originalOnShow = def.onShow
      def.onShow = function(){
        try{
          const ui = auth.getUserInfo()
          const tInfo = (()=>{ try{ return wx.getStorageSync('teacher_info') }catch(e){ return null } })()
          const sInfo = (()=>{ try{ return wx.getStorageSync('student_info') }catch(e){ return null } })()
          const pInfo = (()=>{ try{ return wx.getStorageSync('parent_info') }catch(e){ return null } })()
          const route = '/' + (this.route || '')
          const isLoginPage = route === '/pages/login/login'
          const isRoleSelectPage = route === '/pages/role-select/role-select'

          // 若需要选择角色，统一跳转角色选择页，阻止页面继续执行
          if (ui && ui.needRoleSelection && !isRoleSelectPage){
            wx.reLaunch({ url: '/pages/role-select/role-select' })
            return
          }
          // 在非登录页、非角色选择页：若无任一角色信息，则去登录
          if (!isLoginPage && !isRoleSelectPage){
            const hasRoleInfo = !!(ui && (ui.student_info || ui.teacher_info || ui.parent_info || ui.role)) || !!tInfo || !!sInfo || !!pInfo
            if (!hasRoleInfo){ wx.reLaunch({ url: '/pages/login/login' }); return }
          } else {
            // 在登录页：若已有任一信息，直达默认页
            const hasAny = !!(ui && (ui.student_info || ui.teacher_info || ui.parent_info || ui.role)) || !!tInfo || !!sInfo || !!pInfo
            if (hasAny){
              const role = (ui && ui.role) || (ui && ui.student_info && 'student') || (ui && ui.teacher_info && 'teacher') || (ui && ui.parent_info && 'parent') || (tInfo && 'teacher') || (sInfo && 'student') || (pInfo && 'parent') || ''
              if (role){ this.getApp().routeByRole(role); return }
            }
          }
        }catch(e){}
        if (typeof originalOnShow === 'function') return originalOnShow.apply(this, arguments)
      }
      return origPage(def)
    }
  },

  // 检查登录状态和角色路由
  checkLoginStatusAndRoute() {
    const token = auth.getToken()
    const userInfo = auth.getUserInfo()
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      // 若存在多角色字段，优先识别家长，其次教师，其次学生，最后使用 role 字段
      const resolvedRole = (userInfo && userInfo.parent_info && 'parent')
        || (userInfo && userInfo.teacher_info && 'teacher')
        || (userInfo && userInfo.student_info && 'student')
        || userInfo.role
      this.globalData.userRole = resolvedRole
      this.globalData.isLogin = true
      
      console.log('用户已登录，角色:', userInfo.role)
      
      // 如果用户需要角色选择，跳转到角色选择页面
      if (userInfo.needRoleSelection) {
        console.log('用户需要角色选择')
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/role-select/role-select'
          })
        }, 100)
        return
      }
      
      // 根据角色跳转到对应的默认页面
      if (userInfo.role) {
        this.routeByRole(userInfo.role)
        
        // 验证token有效性（静默验证，失败不强制登出）
       api.verifyToken().then(res => {
          if (!res.success) {
            console.log('Token验证失败，但不强制登出')
            // 可以在这里标记token可能已过期，但不强制登出
          }
        }).catch(error => {
          console.log('Token验证网络错误，忽略:', error)
          // 网络错误不应该导致登出
        }).finally(() => { try { wx.hideLoading() } catch(_) {} })
      }
    } else {
      console.log('用户未登录，跳转到登录页面')
      // 延迟跳转到登录页面，避免在启动时立即跳转
      setTimeout(() => {
        try { wx.showLoading({ title: '跳转登录...', mask: true }) } catch(_) {}
        wx.reLaunch({
          url: '/pages/login/login'
        })
        setTimeout(() => { try { wx.hideLoading() } catch(_) {} }, 500)
      }, 100)
    }
  },

  // 根据角色路由到对应页面（默认：教师->工作台；学生/家长->课程）
  routeByRole(role) {
    console.log('根据角色路由:', role)
    
    let targetUrl = ''
    switch (role) {
      case 'teacher':
        targetUrl = '/pages/teacher/workspace/workspace'
        break
      case 'student':
      case 'parent':
        targetUrl = '/pages/courses/courses'
        break
      default:
        // 未识别角色：若 needRoleSelection=true 则去角色选择，否则去登录
        try{
          const ui = require('./utils/auth').getUserInfo()
          if (ui && ui.needRoleSelection){ targetUrl = '/pages/role-select/role-select'; break }
        }catch(_){ }
        targetUrl = '/pages/login/login'
    }
    
    console.log('目标页面:', targetUrl)
    
    // 获取当前页面
    const pages = getCurrentPages()
    const currentPage = pages.length > 0 ? pages[pages.length - 1] : null
    const currentPath = currentPage ? '/' + currentPage.route : ''
    
    // 如果当前页面不是目标页面，则跳转
    if (currentPath !== targetUrl) {
      try { wx.showLoading({ title: '加载中...', mask: true }) } catch(_) {}
      console.log('从', currentPath, '跳转到', targetUrl)
      wx.reLaunch({ url: targetUrl })
      setTimeout(() => { try { wx.hideLoading() } catch(_) {} }, 600)
    } else {
      console.log('已在目标页面，无需跳转')
    }
  },

  // 登录
  login(userInfo) {
    console.log('app.login被调用，userInfo:', userInfo)
    this.globalData.userInfo = userInfo
    this.globalData.token = userInfo.token
    // 登录时同样优先识别家长，其次教师、学生
    const resolvedRole = (userInfo && userInfo.parent_info && 'parent')
      || (userInfo && userInfo.teacher_info && 'teacher')
      || (userInfo && userInfo.student_info && 'student')
      || userInfo.role
    this.globalData.userRole = resolvedRole
    this.globalData.isLogin = true
    
    console.log('设置后的globalData:', this.globalData)
    
    // 保存到本地存储
    auth.setToken(userInfo.token)
    auth.setUserInfo(userInfo)
    
    // 通知自定义tabBar更新
    console.log('调用updateTabBar')
    this.updateTabBar()
    
    // 根据角色跳转到对应页面
    if (resolvedRole) {
      console.log('登录后根据角色跳转')
      this.routeByRole(resolvedRole)
    }
  },

  // 登出
  logout() {
    this.globalData.userInfo = null
    this.globalData.token = ''
    this.globalData.userRole = ''
    this.globalData.isLogin = false
    
    // 清除本地存储
    auth.removeToken()
    auth.removeUserInfo()
    
    // 更新TabBar
    this.updateTabBar()
    
    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  // 全局错误处理
  handleError(error, showToast = true) {
    console.error('应用错误:', error)
    
    if (showToast) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 检查网络状态
  checkNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            wx.showToast({
              title: '网络连接失败',
              icon: 'none'
            })
            resolve(false)
          } else {
            resolve(true)
          }
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  },

  // 更新自定义tabBar
  updateTabBar() {
    console.log('app.updateTabBar被调用')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      console.log('调用TabBar的onRoleChange')
      this.getTabBar().onRoleChange()
    } else {
      console.log('TabBar组件未找到，延迟重试')
      // 如果TabBar还没加载完成，延迟重试
      setTimeout(() => {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
          console.log('延迟调用TabBar的onRoleChange')
          this.getTabBar().onRoleChange()
        }
      }, 200)
    }
  }
})