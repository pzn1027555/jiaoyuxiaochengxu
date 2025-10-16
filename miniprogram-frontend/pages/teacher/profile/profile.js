// pages/teacher/profile/profile.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const profileApi = require('../../../api/profile')
const badgeManager = require('../../../utils/badgeManager')
const { getAvatarUrl } = require('../../../utils/urlUtils')

Page({
  data: {
    // 用户个人资料
    userProfile: {
      avatar: '',
      name: '',
      gender: '',
      certification: '',
      examiner: '',
      subjects: '',
      followers: 0,
      likes: 0,
      bio: '',
      teacherTags: [],
      province: '',
      city: '',
      district: ''
    },
    
    // 收入数据
    incomeData: {
      month: '0.00',
      total: '0.00'
    },
    
    // 定时器ID
    badgeRefreshTimer: null,
    
    // 我的功能
    myFunctions: [
      {
        id: 1,
        name: '个人信息',
        iconClass: 'personal-info',
        iconSrc: '/images/profile/profile.png',
        action: 'personalInfo'
      },
      {
        id: 2,
        name: '我的主页',
        iconClass: 'my-homepage',
        iconSrc: '/images/profile/HomePage.png',
        action: 'homepage'
      }
    ],
    
    // 老师服务
    teacherServices: [
      {
        id: 1,
        name: '排课安排',
        iconClass: 'schedule',
        iconSrc: '/images/profile/paike.png',
        action: 'schedule'
      },
      {
        id: 2,
        name: '课程预约',
        iconClass: 'booking',
        iconSrc: '/images/profile/yuyue.png',
        action: 'booking'
      },
      {
        id: 3,
        name: '我的学生',
        iconClass: 'students',
        iconSrc: '/images/profile/mystudent.png',
        action: 'students'
      },
      {
        id: 4,
        name: '教师认证',
        iconClass: 'certification',
        iconSrc: '/images/profile/renzheng.png',
        action: 'certification'
      },
      {
        id: 5,
        name: '教研活动',
        iconClass: 'research',
        iconSrc: '/images/profile/jiaoyanhuodong.png',
        action: 'research'
      },
      {
        id: 6,
        name: '就业服务',
        iconClass: 'employment',
        iconSrc: '/images/profile/jiuye.png',
        action: 'employment'
      },
      {
        id: 7,
        name: '磨课',
        iconClass: 'mooc',
        iconSrc: '/images/profile/mooc.png',
        action: 'mooc'
      }
    ],
    
    // 红点状态数据
    badgeStatus: {},
    
    loading: false
  },

  onLoad() {
    console.log('教师个人中心页面加载')
    this.initPage()
  },

  onShow() {
    // 检查是否需要刷新数据
    const app = getApp()
    if (app.globalData.profileUpdated) {
      app.globalData.profileUpdated = false // 重置标志
      console.log('检测到资料更新，重新加载数据')
      wx.showLoading({ title: '更新中...' })
      this.loadUserProfile().then(() => {
        wx.hideLoading()
        wx.showToast({
          title: '资料已更新',
          icon: 'success',
          duration: 2000
        })
      }).catch(() => {
        wx.hideLoading()
      })
    }
    
    this.loadData()
    this.initBadgeSystem()
    this.startBadgeRefreshTimer()
    
    // 设置TabBar选中状态（我的是第2个）
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

  // 检查权限
  checkAuth() {
    const app = getApp()
    
    // 首先检查app.globalData
    if (app.globalData.isLogin && app.globalData.userRole === 'teacher') {
      console.log('教师已登录，继续页面操作')
      return true
    }
    
    // 备用检查：检查本地存储
    const auth = require('../../../utils/auth')
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role === 'teacher') {
      console.log('从本地存储确认教师身份')
      return true
    }
    
    // 都没有则需要登录
    console.log('教师身份验证失败，跳转登录')
    wx.showToast({
      title: '请先登录教师账号',
      icon: 'none'
    })
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }, 2000)
    return false
  },

  // 加载用户资料
  async loadUserProfile() {
    try {
      const response = await profileApi.getUserProfile()
      wx.setStorageSync("teacher_info",response.data)
      if (response.success) {
        const profile = response.data
        
        // 处理科目显示
        const subjectsText = Array.isArray(profile.subjectsNameList) 
          ? profile.subjectsNameList.join('  |  ') 
          : profile.subjectsMap && typeof profile.subjectsMap === 'object'
            ? Object.values(profile.subjectsMap).join('  |  ')
            : Array.isArray(profile.subjects)
              ? profile.subjects.join('  |  ')
              : (profile.subjectsNameList || '')
        
        // 处理标签显示
        const certification = Array.isArray(profile.teacherTags) && profile.teacherTags.length > 0
          ? profile.teacherTags[0] 
          : '认证教师'
        
        const examiner = Array.isArray(profile.teacherTags) && profile.teacherTags.length > 1
          ? profile.teacherTags[1] 
          : ''
        
        // 处理地区显示
        const locationText = this.buildLocationText(profile.province, profile.city, profile.district)
        
        const avatar = getAvatarUrl(profile.avatar)

        const userProfile = {
          avatar: avatar,
          name: profile.name || '未设置姓名',
          gender: this.convertGenderToSymbol(profile.gender),
          certification: certification,
          examiner: examiner,
          subjects: subjectsText,
          followers: this.data.userProfile.followers, // 暂时保持模拟数据
          likes: this.data.userProfile.likes, // 暂时保持模拟数据
          bio: profile.introduction || '暂无个人介绍',
          teacherTags: profile.teacherTags || [],
          location: locationText
        }
        
        this.setData({ userProfile })
        
        // 更新全局用户信息（包含教师ID）
        const app = getApp()
        if (!app.globalData.userInfo) app.globalData.userInfo = {}
        app.globalData.userInfo.id = profile.id
        app.globalData.userInfo.name = profile.name
        app.globalData.userInfo.avatar = avatar
      } else {
        console.error('获取用户资料失败:', response.message)
        wx.showToast({
          title: '获取资料失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载用户资料出错:', error)
      // 保持默认数据，不显示错误提示
    }
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true })
    
    try {
      await Promise.all([
        this.loadIncomeData(),
        this.loadUserStats()
      ])
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载收入数据
  async loadIncomeData() {
    try {
      const ym = (() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      })()
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: require('../../../config/env').getApiBaseUrl() + '/mini/income/summary',
          method: 'GET',
          data: { yearMonth: ym },
          header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + wx.getStorageSync('token')
          },
          success: (r) => r.statusCode === 200 ? resolve(r.data) : reject(new Error('网络错误')),
          fail: reject
        })
      })
      if (res && res.code === 200) {
        const month = (res.data && res.data.month != null) ? Number(res.data.month).toFixed(2) : '0.00'
        const total = (res.data && res.data.total != null) ? Number(res.data.total).toFixed(2) : '0.00'
        this.setData({ incomeData: { month, total } })
      }
    } catch (error) {
      console.error('加载收入数据失败:', error)
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    try {
      // 模拟API调用
      // const userStats = await api.teacher.getUserStats()
      
      // 使用模拟数据
      const userProfile = {
        ...this.data.userProfile,
        followers: 236,
        likes: 4832
      }
      
      this.setData({ userProfile })
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  },

  // 显示菜单
  showMenu() {
    wx.showActionSheet({
      itemList: ['设置', '帮助与反馈', '关于我们'],
      success: (res) => {
        console.log('菜单选择:', res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            this.showSettings()
            break
          case 1:
            this.showHelp()
            break
          case 2:
            this.showAbout()
            break
        }
      }
    })
  },

  // 切换身份
  switchIdentity() {
    wx.showActionSheet({
      itemList: ['学生身份', '家长身份'],
      success: (res) => {
        console.log('切换身份:', res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            this.switchToStudent()
            break
          case 1:
            this.switchToParent()
            break
        }
      }
    })
  },

  // 切换到学生身份
  switchToStudent() {
    const app = getApp()
    app.globalData.role = 'student'
    wx.showToast({
      title: '已切换到学生身份',
      icon: 'success'
    })
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/courses/courses'
      })
    }, 1500)
  },

  // 切换到家长身份
  switchToParent() {
    const app = getApp()
    app.globalData.role = 'parent'
    wx.showToast({
      title: '已切换到家长身份',
      icon: 'success'
    })
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/courses/courses'
      })
    }, 1500)
  },

  // 查看收入详情
  viewIncomeDetails() {
    wx.navigateTo({
      url: '/pages/teacher/income-overview/income-overview'
    })
  },

  // 我的功能点击
  onFunctionTap(e) {
    const action = e.currentTarget.dataset.action
    
    switch (action) {
      case 'personalInfo':
        wx.navigateTo({
          url: '/pages/teacher/edit-profile/edit-profile'
        })
        break
      case 'homepage':
        wx.navigateTo({ url: '/pages/teacher/homepage/homepage' })
        break
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
    }
  },

  // 老师服务点击
  async onServiceTap(e) {
    const action = e.currentTarget.dataset.action
    
    // 进入页面前清除对应的红点
    if (action === 'booking' || action === 'certification') {
      await this.hideBadgeForModule(action)
    }
    
    switch (action) {
      case 'schedule':
        wx.navigateTo({
          url: '/pages/teacher/schedule/schedule'
        })
        break
      case 'booking':
        wx.navigateTo({
          url: '/pages/teacher/booking/booking'
        })
        break
      case 'students':
        wx.navigateTo({
          url: '/pages/teacher/my-students/my-students'
        })
        break
      case 'certification':
        wx.navigateTo({
          url: '/pages/teacher/certification/certification'
        })
        break
      case 'research':
        wx.navigateTo({
          url: '/pages/teacher/research/research'
        })
        break
      case 'employment':
        wx.navigateTo({
          url: '/pages/teacher/employment/employment'
        })
        break
      case 'mooc':
        wx.navigateTo({ url: '/pages/teacher/mooc/mooc' })
        break
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
    }
  },

  // 设置
  showSettings() {
    wx.navigateTo({
      url: '/pages/teacher/settings/settings'
    })
  },

  // 帮助与反馈
  showHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    })
  },

  // 关于我们
  showAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

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
      case 1:
        return '♂'
      case 2:
        return '♀'
      default:
        return ''
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

  // 初始化红点系统
  async initBadgeSystem() {
    try {
      const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
      const userId = userInfo.id
      
      if (!userId) {
        console.log('用户ID不存在，无法初始化红点系统')
        return
      }

      // 教师端固定使用 'teacher' 作为 userType
      const userType = 'teacher'
      console.log('教师端初始化红点系统，userId:', userId, 'userType:', userType)

      // 初始化红点状态
      await badgeManager.initUserBadges(userId, userType)
      
      // 获取所有红点状态
      const allBadges = badgeManager.getAllBadgeStatus(userId, userType)
      console.log("allBadges1",JSON.stringify(allBadges));
      this.setData({
        badgeStatus: allBadges
      })

      // 添加全局监听器，当红点状态变化时自动更新
      badgeManager.addListener(userId, userType, null, (badgeStatus) => {
        console.log("allBadges2",allBadges);
        this.setData({
          badgeStatus: badgeStatus
        })
      })

      console.log('红点系统初始化成功:', allBadges)
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
      
      // 教师端固定使用 'teacher' 作为 userType
      const userType = 'teacher'
      console.log('教师端刷新红点状态，userId:', userId, 'userType:', userType)
      
      // 重新拉取红点状态
      await badgeManager.initUserBadges(userId, userType)
      const allBadges = badgeManager.getAllBadgeStatus(userId, userType)
      console.log("allBadges3",allBadges);
      this.setData({
        badgeStatus: allBadges
      })
    } catch (error) {
      console.error('刷新红点状态失败:', error)
    }
  },

  // 获取指定模块的红点状态（供WXML使用）
  getBadgeForModule(badgeKey) {
    const badge = this.data.badgeStatus[badgeKey]
    console.log(`getBadgeForModule(${badgeKey}):`, badge)
    return badge || { visible: false, count: 0 }
  },
  
  // WXS辅助函数：获取红点可见性
  getBadgeVisible(badgeKey) {
    const status = this.data.badgeStatus
    if (!status || !status[badgeKey]) {
      return false
    }
    return status[badgeKey].visible === true
  },
  
  // WXS辅助函数：获取红点数量
  getBadgeCount(badgeKey) {
    const status = this.data.badgeStatus
    if (!status || !status[badgeKey]) {
      return 0
    }
    return status[badgeKey].count || 0
  },

  // 隐藏指定模块的红点
  async hideBadgeForModule(badgeKey) {
    const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
    const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
    const userId = userInfo.id
    
    // 教师端固定使用 'teacher' 作为 userType
    const userType = 'teacher'
    
    if (userId) {
      console.log('教师端隐藏红点，userId:', userId, 'userType:', userType, 'badgeKey:', badgeKey)
      await badgeManager.hideBadge(userId, userType, badgeKey)
    }
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '新文枢教育 - 教师中心',
      path: '/pages/teacher/profile/profile'
    }
  }
})