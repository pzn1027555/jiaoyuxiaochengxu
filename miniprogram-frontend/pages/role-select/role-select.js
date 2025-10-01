// pages/role-select/role-select.js
const api = require('../../utils/api')
const auth = require('../../utils/auth')

Page({
  data: {
    selectedRole: 'student', // 默认选择学生
    allowSkip: false, // 是否允许跳过
    loading: false,
    
    // 角色信息弹窗
    showRoleInfo: false,
    roleInfoTitle: '',
    roleInfoBenefits: [],
    
    // 角色权益说明
    roleBenefits: {
      student: {
        title: '学生权益',
        benefits: [
          { icon: '📚', text: '访问丰富的课程资源和学习材料' },
          { icon: '👨‍🏫', text: '预约一对一在线辅导课程' },
          { icon: '📝', text: '参与课后作业和在线测评' },
          { icon: '🏆', text: '获得学习成就和进度跟踪' },
          { icon: '👥', text: '加入学习小组和社区讨论' },
          { icon: '📊', text: '查看个人学习报告和分析' }
        ]
      },
      parent: {
        title: '家长权益',
        benefits: [
          { icon: '👶', text: '管理和监控孩子的学习进度' },
          { icon: '📈', text: '查看详细的学习报告和成绩' },
          { icon: '💬', text: '与孩子的老师直接沟通交流' },
          { icon: '📅', text: '安排和管理孩子的课程时间' },
          { icon: '💰', text: '管理课程费用和支付账单' },
          { icon: '🔔', text: '接收孩子学习动态的实时通知' }
        ]
      },
      teacher: {
        title: '教师权益',
        benefits: [
          { icon: '👨‍🎓', text: '创建和管理自己的课程内容' },
          { icon: '📋', text: '查看和管理学生列表及进度' },
          { icon: '💼', text: '接收课程预约和收入统计' },
          { icon: '📝', text: '提供作业批改和学习反馈' },
          { icon: '⭐', text: '获得学生评价和教学评级' },
          { icon: '📊', text: '查看教学数据和效果分析' }
        ]
      }
    }
  },

  onLoad(options) {
    console.log('角色选择页面加载', options)
    
    // 检查是否已登录
    if (!auth.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 检查是否已有角色
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role && !userInfo.isFirstLogin) {
      // 已有角色，直接跳转到首页
      this.redirectToHome()
      return
    }
    
    // 设置默认选择的角色
    this.setData({
      allowSkip: options.allowSkip === 'true'
    })
  },

  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role
    console.log('选择角色:', role)
    
    this.setData({
      selectedRole: role
    })
    
    // 显示角色权益信息（可选）
    // this.showRoleInfo(role)
  },

  // 显示角色权益信息
  showRoleInfo(role) {
    const roleData = this.data.roleBenefits[role]
    if (roleData) {
      this.setData({
        showRoleInfo: true,
        roleInfoTitle: roleData.title,
        roleInfoBenefits: roleData.benefits
      })
    }
  },

  // 隐藏角色信息弹窗
  hideRoleInfo() {
    this.setData({
      showRoleInfo: false
    })
  },

  // 阻止弹窗关闭
  preventClose() {
    // 空函数，阻止事件冒泡
  },

  // 确认角色选择
  async confirmRole() {
    const { selectedRole, loading } = this.data
    
    if (!selectedRole || loading) return

    try {
      this.setData({ loading: true })
      
      // 调用角色选择接口
      const res = await api.selectRole({
        role: selectedRole
      })

      if (res.success) {
        const loginData = res.data || {}

        if (loginData.token) {
          auth.setToken(loginData.token)
        }

        if (loginData.userInfo) {
          const normalizedUserInfo = {
            ...loginData.userInfo,
            token: loginData.token,
            needRoleSelection: false,
            isFirstLogin: false
          }
          auth.setUserInfo(normalizedUserInfo)

          const app = getApp()
          if (app && typeof app.login === 'function') {
            app.login(normalizedUserInfo)
          } else if (app && app.globalData) {
            app.globalData.userRole = normalizedUserInfo.role || selectedRole
            app.globalData.userInfo = normalizedUserInfo
            app.globalData.token = loginData.token
            app.globalData.isLogin = true
            if (typeof app.updateTabBar === 'function') {
              app.updateTabBar()
            }
          }
        }

        wx.showToast({
          title: '设置成功',
          icon: 'success'
        })

        // 跳转到首页或引导页
        setTimeout(() => {
          this.redirectToHome()
        }, 1500)

      } else {
        throw new Error(res.message || '设置失败')
      }

    } catch (error) {
      console.error('角色选择失败:', error)
      wx.showToast({
        title: error.message || '设置失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  

  // 跳转到首页
  redirectToHome() {
    try{
      const app = getApp()
      const ui = require('../../utils/auth').getUserInfo() || {}
      const role = (app && app.globalData && app.globalData.userRole) || ui.role || ''
      if (role === 'teacher') {
        wx.switchTab({ url: '/pages/teacher/workspace/workspace' })
      } else if (role === 'student' || role === 'parent') {
        wx.switchTab({ url: '/pages/courses/courses' })
      } else {
        // 兜底：按 app 的路由器处理
        if (app && typeof app.routeByRole === 'function') {
          app.routeByRole(role)
        } else {
          wx.switchTab({ url: '/pages/index/index' })
        }
      }
    }catch(e){ wx.switchTab({ url: '/pages/index/index' }) }
  },

  // 获取角色显示名称
  getRoleDisplayName(role) {
    const roleNames = {
      'student': '学生',
      'parent': '家长',
      'teacher': '教师'
    }
    return roleNames[role] || '未知'
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '新文枢教育 - 选择你的身份',
      path: '/pages/login/login'
    }
  },

  // 长按显示角色详情
  onRoleLongPress(e) {
    const role = e.currentTarget.dataset.role
    this.showRoleInfo(role)
  }
})