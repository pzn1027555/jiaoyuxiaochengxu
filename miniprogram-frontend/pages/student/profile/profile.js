// pages/student/profile/profile.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const profileApi = require('../../../api/profile')
const badgeManager = require('../../../utils/badgeManager')

Page({
  data: {
    // 用户个人资料（对齐教师端结构）
    userProfile: {
      avatar: '',
      name: '',
      gender: '',
      certification: '',
      examiner: '',
      subjects: '',
      myCourses: 0,
      followedTeachers: 0,
      bio: '',
      teacherTags: [],
      province: '',
      city: '',
      district: ''
    },
    
    // 去除余额
    
    // 我的功能（学生）
    myFunctions: [
      { id: 1, name: '个人信息', iconClass: 'personal-info', iconSrc: '/images/student/gerenxinxi.png', action: 'personalInfo' },
      { id: 2, name: '我的收藏', iconClass: 'favorites', iconSrc: '/images/student/shoucang.png', action: 'favorites' },
      { id: 3, name: '我的订单', iconClass: 'orders', iconSrc: '/images/student/dingdan.png', action: 'orders' },
      { id: 4, name: '消息通知', iconClass: 'notifications', iconSrc: '/images/student/xiaoxitongzhi.png', action: 'notifications' }
    ],
    
    // 学生服务
    studentServices: [
      { id: 1, name: '家长绑定', iconClass: 'parent-bind', iconSrc: '/images/student/jiazhangbangding.png', action: 'parentBind' },
      { id: 2, name: '班主任', iconClass: 'head-teacher', iconSrc: '/images/student/banzhuren.png', action: 'headTeacher' },
      { id: 3, name: '邀请好友', iconClass: 'invite', iconSrc: '/images/student/yaoqing.png', action: 'invite' }
    ],
    
    // 红点状态数据
    badgeStatus: {},
    
    // 定时器ID
    badgeRefreshTimer: null,
    
    loading: false
  },

  onLoad() {
    console.log('学生个人中心页面加载')
    this.initPage()
  },

  onShow() {
    const app = getApp()
    if (app.globalData.profileUpdated) {
      app.globalData.profileUpdated = false
      wx.showLoading({ title: '更新中...' })
      this.loadUserProfile().then(() => {
        wx.hideLoading()
        wx.showToast({ title: '资料已更新', icon: 'success', duration: 2000 })
      }).catch(() => wx.hideLoading())
    }
    this.loadData()
    this.initBadgeSystem()
    this.startBadgeRefreshTimer()
    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2)
    }
  },
  
  onHide() {
    // 页面隐藏时清除定时器
    this.stopBadgeRefreshTimer()
  },
  
  onUnload() {
    // 页面卸载时清除定时器
    this.stopBadgeRefreshTimer()
  },

  // 初始化页面
  initPage() {
    this.checkAuth()
    this.loadUserProfile()
  },

  // 检查权限（学生）
  checkAuth() {
    const app = getApp()
    if (app.globalData.isLogin && app.globalData.userRole === 'student') {
      return true
    }
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role === 'student') {
      return true
    }
    wx.showToast({ title: '请先登录学生账号', icon: 'none' })
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/login/login' })
    }, 2000)
    return false
  },

  // 加载用户资料（student_info 专用接口，并显式传 phone）
  async loadUserProfile() {
    try {
      const storageUserStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const storageUser = typeof storageUserStr === 'string' ? JSON.parse(storageUserStr) : storageUserStr
      const phone = storageUser.phone || storageUser?.student_info?.phone || storageUser?.parent_info?.phone || storageUser?.teacher_info?.phone
      const response = await profileApi.getStudentProfile(phone ? { phone } : {})
      if (response.success) {
        const profile = response.data
        const subjectsText = Array.isArray(profile.subjects) ? profile.subjects.join('    ') : (profile.subjects || '')
        const certification = Array.isArray(profile.studentTags) && profile.studentTags.length > 0 ? profile.studentTags[0] : '学生'
        const locationText = this.buildLocationText(profile.province, profile.city, profile.district)
        const userProfile = {
          avatar: profile.avatar || '/images/workspace/default-avatar.png',
          name: profile.name || '未设置姓名',
          gender: this.convertGenderToSymbol(profile.gender),
          certification: certification,
          examiner: '',
          subjects: subjectsText,
          myCourses: this.data.userProfile.myCourses,
          followedTeachers: this.data.userProfile.followedTeachers,
          bio: profile.introduction || '暂无个人介绍',
          teacherTags: profile.studentTags || [],
          location: locationText
        }
        this.setData({ userProfile })
        const app = getApp()
        if (!app.globalData.userInfo) app.globalData.userInfo = {}
        app.globalData.userInfo.id = profile.id
        app.globalData.userInfo.name = profile.name
        app.globalData.userInfo.avatar = profile.avatar
      } else {
        wx.showToast({ title: '获取资料失败', icon: 'none' })
      }
    } catch (error) {
      console.error('加载用户资料出错:', error)
    }
  },

  // 加载数据（学生端不请求收入接口）
  async loadData() {
    this.setData({ loading: true })
    try {
      await this.loadUserStats()
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 用户统计（示例占位）
  async loadUserStats() {
    try {
      const storageUserStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const storageUser = typeof storageUserStr === 'string' ? JSON.parse(storageUserStr) : storageUserStr
      const phone = storageUser.phone || storageUser?.student_info?.phone || storageUser?.parent_info?.phone || storageUser?.teacher_info?.phone

      // 关注老师数量
      try {
        const fRes = await profileApi.getStudentFollowedCount(phone ? { phone } : {})
        if (fRes && fRes.success) {
          this.setData({ 'userProfile.followedTeachers': fRes.data || 0 })
        }
      } catch (e) {}

      // 我的课程数量（按 plan_id 去重）
      try {
        const cRes = await profileApi.getStudentCourseCount(phone ? { phone } : {})
        if (cRes && cRes.success) {
          this.setData({ 'userProfile.myCourses': cRes.data || 0 })
        }
      } catch (e) {}

      const userProfile = { ...this.data.userProfile }
      this.setData({ userProfile })
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  },

  goMyCourses(){
    wx.navigateTo({ url: '/pages/parent/study-plan/study-plan?role=student' })
  },

  // 我的功能点击（避免跳转到不存在页面）
  async onFunctionTap(e) {
    const action = e.currentTarget.dataset.action
    
    // 进入消息通知前清除红点
    if (action === 'notifications') {
      await this.hideBadgeForModule('notifications')
    }
    
    switch (action) {
      case 'personalInfo':
        wx.navigateTo({ url: '/pages/student/edit-profile/edit-profile' })
        break
      case 'favorites':
        wx.navigateTo({ url: '/pages/student/favorites/favorites' })
        break
      case 'orders':
        wx.navigateTo({ url: '/pages/orders/orders' })
        break
      case 'notifications':
        wx.navigateTo({ url: '/pages/student/notifications/notifications' })
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  // 服务点击
  onServiceTap(e) {
    const action = e.currentTarget.dataset.action
    switch (action) {
      case 'parentBind':
        wx.navigateTo({ url: '/pages/student/parent-bind/parent-bind' })
        break
      case 'headTeacher':
        wx.navigateTo({ url: '/pages/student/head-teacher/head-teacher' })
        break
      case 'invite':
        wx.navigateTo({ url: '/pages/student/invite/invite' })
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  // 设置 / 帮助 / 关于（保留占位）
  showSettings() { wx.showToast({ title: '功能开发中', icon: 'none' }) },
  showHelp() { wx.showToast({ title: '功能开发中', icon: 'none' }) },
  showAbout() { wx.showToast({ title: '功能开发中', icon: 'none' }) },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.logout()
        }
      }
    })
  },

  // 转换性别数字为符号
  convertGenderToSymbol(gender) {
    switch (gender) {
      case 1: return '♂'
      case 2: return '♀'
      default: return ''
    }
  },

  // 构建地区显示文本
  buildLocationText(province, city, district) {
    let text = ''
    if (province && province !== city) text += province
    if (city) text += city
    if (district) text += district
    return text
  },

  // 初始化红点系统（学生）
  async initBadgeSystem() {
    try {
      const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
      const userId = userInfo.id
      if (!userId) return
      
      // 学生端固定使用 'student' 作为 userType
      const userType = 'student'
      console.log('学生端初始化红点系统，userId:', userId, 'userType:', userType)
      
      await badgeManager.initUserBadges(userId, userType)
      const allBadges = badgeManager.getAllBadgeStatus(userId, userType)
      this.setData({ badgeStatus: allBadges })
      badgeManager.addListener(userId, userType, null, (badgeStatus) => {
        this.setData({ badgeStatus })
      })
    } catch (error) {
      console.error('初始化红点系统失败:', error)
    }
  },
  
  // 启动红点刷新定时器（每30秒刷新一次）
  startBadgeRefreshTimer() {
    // 先清除已有的定时器
    this.stopBadgeRefreshTimer()
    
    // 设置30秒刷新一次
    this.data.badgeRefreshTimer = setInterval(() => {
      console.log('定时刷新红点状态')
      this.refreshBadgeStatus()
    }, 30000)
  },
  
  // 停止红点刷新定时器
  stopBadgeRefreshTimer() {
    if (this.data.badgeRefreshTimer) {
      clearInterval(this.data.badgeRefreshTimer)
      this.setData({ badgeRefreshTimer: null })
    }
  },
  
  // 刷新红点状态
  async refreshBadgeStatus() {
    try {
      const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
      const userId = userInfo.id
      
      if (!userId) {
        return
      }
      
      // 学生端固定使用 'student' 作为 userType
      const userType = 'student'
      console.log('学生端刷新红点状态，userId:', userId, 'userType:', userType)
      
      // 重新拉取红点状态
      await badgeManager.initUserBadges(userId, userType)
      const allBadges = badgeManager.getAllBadgeStatus(userId, userType)
      this.setData({
        badgeStatus: allBadges
      })
    } catch (error) {
      console.error('刷新红点状态失败:', error)
    }
  },
  
  // 清除指定模块的红点（进入notifications页面时调用）
  async hideBadgeForModule(badgeKey) {
    try {
      const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
      const userId = userInfo.id
      
      if (!userId) {
        return
      }
      
      // 学生端固定使用 'student' 作为 userType
      const userType = 'student'
      console.log('学生端隐藏红点，userId:', userId, 'userType:', userType, 'badgeKey:', badgeKey)
      
      await badgeManager.hideBadge(userId, userType, badgeKey)
      const allBadges = badgeManager.getAllBadgeStatus(userId, userType)
      this.setData({
        badgeStatus: allBadges
      })
    } catch (error) {
      console.error('清除红点失败:', error)
    }
  },

  // 页面分享
  onShareAppMessage() {
    return { title: '新文枢教育 - 学生中心', path: '/pages/student/profile/profile' }
  }
})