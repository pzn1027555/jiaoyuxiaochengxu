// pages/parent/profile/profile.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const profileApi = require('../../../api/profile')
const badgeManager = require('../../../utils/badgeManager')
const accountApi = require('../../../api/account')
const { getAvatarUrl } = require('../../../utils/urlUtils')

Page({
  data: {
    // 用户个人资料（对齐学生端结构）
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
    
    myFunctions: [
      { id: 1, name: '个人信息', iconClass: 'personal-info', iconSrc: '/images/student/gerenxinxi.png', action: 'personalInfo' },
      // { id: 2, name: '我的收藏', iconClass: 'favorites', iconSrc: '/images/student/shoucang.png', action: 'favorites' },
      { id: 3, name: '我的订单', iconClass: 'orders', iconSrc: '/images/student/dingdan.png', action: 'orders' },
      { id: 4, name: '消息通知', iconClass: 'notifications', iconSrc: '/images/student/xiaoxitongzhi.png', action: 'notifications' }
    ],
    
    parentServices: [
      { id: 1, name: '子女绑定', iconClass: 'child-bind', iconSrc: '/images/student/jiazhangbangding.png', action: 'childBind' },
      { id: 2, name: '班主任', iconClass: 'head-teacher', iconSrc: '/images/student/banzhuren.png', action: 'headTeacher' },
      { id: 3, name: '留学', iconClass: 'study-abroad', iconSrc: '/images/parent/liuxue.png', action: 'studyAbroad' },
      { id: 4, name: '学习计划', iconClass: 'study-plan', iconSrc: '/images/parent/xuexijihua.png', action: 'studyPlan' },
      { id: 5, name: '咨询', iconClass: 'consult', iconSrc: '/images/parent/zixun.png', action: 'consult' },
      { id: 6, name: '邀请好友', iconClass: 'invite', iconSrc: '/images/student/yaoqing.png', action: 'invite' }
    ],
    
    // 余额数据
    balanceData: {
      available: '0.00',
      totalConsumed: '0.00'
    },
    
    badgeStatus: {},
    loading: false
  },

  onLoad() {
    console.log('家长个人中心页面加载')
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2)
    }
  },

  initPage() {
    this.checkAuth()
    this.loadUserProfile()
    this.loadBalance()
  },

  // 检查权限（家长）
  checkAuth() {
    const app = getApp()
    if (app.globalData.isLogin && app.globalData.userRole === 'parent') {
      return true
    }
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role === 'parent') {
      return true
    }
    wx.showToast({ title: '请先登录家长账号', icon: 'none' })
    setTimeout(() => { wx.reLaunch({ url: '/pages/login/login' }) }, 2000)
    return false
  },

  // 加载用户资料（parent_info 专用接口，并显式传 phone）
  async loadUserProfile() {
    try {
      const storageUser = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || {}
      const phone = storageUser.phone || storageUser?.parent_info?.phone || storageUser?.student_info?.phone || storageUser?.teacher_info?.phone
      const response = await profileApi.getParentProfile(phone ? { phone } : {})
      if (response.success) {
        const profile = response.data
        const subjectsText = ''
        const certification = Array.isArray(profile.parentTags) && profile.parentTags.length > 0 ? profile.parentTags[0] : '家长'
        const locationText = this.buildLocationText(profile.province, profile.city, profile.district)
        const avatar = getAvatarUrl(profile.avatar)

        const userProfile = {
          avatar: avatar,
          name: profile.name || '未设置姓名',
          gender: this.convertGenderToSymbol(profile.gender),
          certification: certification,
          examiner: '',
          subjects: subjectsText,
          myCourses: this.data.userProfile.myCourses,
          followedTeachers: this.data.userProfile.followedTeachers,
          bio: profile.introduction || '暂无个人介绍',
          teacherTags: profile.parentTags || [],
          location: locationText
        }
        this.setData({ userProfile })
        const app = getApp()
        if (!app.globalData.userInfo) app.globalData.userInfo = {}
        app.globalData.userInfo.id = profile.id
        app.globalData.userInfo.name = profile.name
        app.globalData.userInfo.avatar = avatar
      } else {
        wx.showToast({ title: '获取资料失败', icon: 'none' })
      }
    } catch (error) {
      console.error('加载用户资料出错:', error)
    }
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      await this.loadUserStats()
      await this.loadBalance()
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadUserStats() {
    try {
      const userProfile = { ...this.data.userProfile, myCourses: 0, followedTeachers: 0 }
      this.setData({ userProfile })
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  },

  onFunctionTap(e) {
    const action = e.currentTarget.dataset.action
    switch (action) {
      case 'personalInfo':
        wx.navigateTo({ url: '/pages/parent/edit-profile/edit-profile' })
        break
      case 'favorites':
        wx.navigateTo({ url: '/pages/parent/favorites/favorites' })
        break
      case 'orders':
        wx.navigateTo({ url: '/pages/orders/orders?userType=parent' })
        break
      case 'studyPlan':
        wx.navigateTo({ url: '/pages/parent/study-plan/study-plan' })
        break
      case 'notifications':
        wx.navigateTo({ url: '/pages/parent/notifications/notifications' })
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },
  
  // 跳转余额/消费记录
  viewBalance() {
    wx.navigateTo({ url: '/pages/parent/consumption-overview/consumption-overview' })
  },

  // 加载余额数据（占位实现，后端联调时替换为真实API）
  async loadBalance() {
    try {
      const storageUser = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || {}
      const phone = storageUser.phone || storageUser?.parent_info?.phone || storageUser?.student_info?.phone || storageUser?.teacher_info?.phone
      const res = await accountApi.getParentBalanceSummary(phone ? { phone } : {})
      if (res && res.success) {
        const data = res.data || {}
        const balanceData = {
          available: (Number(data.available || 0)).toFixed(2),
          totalConsumed: (Number(data.totalConsumed || 0)).toFixed(2)
        }
        this.setData({ balanceData })
      }
    } catch (e) {
      console.error('加载余额失败:', e)
    }
  },
  onServiceTap(e) {
    const action = e.currentTarget.dataset.action
    switch (action) {
      case 'childBind':
        // 新的家长端子女绑定页
        wx.navigateTo({ url: '/pages/parent/child-bind/child-bind' })
        break
      case 'headTeacher':
        wx.navigateTo({ url: '/pages/parent/head-teacher/head-teacher' })
        break
      case 'studyAbroad':
        wx.showToast({ title: '留学功能开发中', icon: 'none' })
        break
      case 'studyPlan':
        wx.navigateTo({ url: '/pages/parent/study-plan/study-plan' })
        break
      case 'consult':
        wx.showToast({ title: '咨询功能开发中', icon: 'none' })
        break
      case 'invite':
        wx.navigateTo({ url: '/pages/parent/invite/invite' })
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  logout() {
    wx.showModal({
      title: '确认退出', content: '确定要退出登录吗？',
      success: (res) => { if (res.confirm) { const app = getApp(); app.logout() } }
    })
  },

  convertGenderToSymbol(gender) { switch (gender) { case 1: return '♂'; case 2: return '♀'; default: return '' } },
  buildLocationText(province, city, district) { let text = ''; if (province && province !== city) text += province; if (city) text += city; if (district) text += district; return text },

  async initBadgeSystem() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {}
      const userId = userInfo.id
      if (!userId) return
      await badgeManager.initUserBadges(userId, 'parent')
      const allBadges = badgeManager.getAllBadgeStatus(userId, 'parent')
      this.setData({ badgeStatus: allBadges })
      badgeManager.addListener(userId, 'parent', null, (badgeStatus) => { this.setData({ badgeStatus }) })
    } catch (error) { console.error('初始化红点系统失败:', error) }
  },

  onShareAppMessage() { return { title: '新文枢教育 - 家长中心', path: '/pages/parent/profile/profile' } }
})