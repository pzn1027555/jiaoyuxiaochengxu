// 通用角色底部导航组件（重命名为 role-tabbar 的实现）
Component({
  data: {
    selected: 0,
    color: "#8a8a8a",
    selectedColor: "#4CAF50",
    backgroundColor: "#ffffff",
    
    // 根据用户角色显示的tabBar列表
    list: []
  },

  attached() {
    // 若需要角色选择，不初始化TabBar，防止循环
    try{
      const auth = require('../utils/auth')
      const ui = auth.getUserInfo()
      if (ui && ui.needRoleSelection){ return }
    }catch(e){}
    console.log('TabBar组件加载')
    this.initTabBar()
  },

  methods: {
    // 初始化TabBar
    initTabBar() {
      const app = getApp()
      let userRole = ''
      
      // 获取用户角色
      if (app.globalData && app.globalData.userRole) {
        userRole = app.globalData.userRole
      }
      // 强化兜底：从本地存储取并优先 parent
      if (!userRole) {
        const auth = require('../utils/auth')
        const userInfo = auth.getUserInfo()
        if (userInfo) {
          userRole = (userInfo.parent_info && 'parent') || (userInfo.role) || (userInfo.student_info && 'student') || (userInfo.teacher_info && 'teacher') || ''
        }
      }
      
      console.log('TabBar初始化，用户角色:', userRole)
      
      // 若当前路由属于某角色路径，强制以路由判定
      const pages = getCurrentPages()
      if (pages && pages.length > 0) {
        const currentPath = '/' + pages[pages.length - 1].route
        if (currentPath.indexOf('/pages/parent/') === 0) userRole = 'parent'
        else if (currentPath.indexOf('/pages/teacher/') === 0) userRole = 'teacher'
        else if (currentPath.indexOf('/pages/student/') === 0) userRole = 'student'
      }

      // 根据角色设置TabBar列表
      this.setTabBarByRole(userRole)

      // 设置当前选中项
      this.updateSelectedFromCurrentPage()
    },

    // 根据角色设置TabBar
    setTabBarByRole(role) {
      let list = []
      
      switch (role) {
        case 'teacher':
          list = [
            {
              pagePath: "/pages/teacher/workspace/workspace",
              text: "工作台",
              iconPath: "/images/workspace/gongzuotai.png"
            },
            {
              pagePath: "/pages/teacher/resources/resources", 
              text: "资源中心",
              iconPath: "/images/workspace/ziyuan.png"
            },
            {
              pagePath: "/pages/teacher/profile/profile",
              text: "我的",
              iconPath: "/images/workspace/wode.png"
            }
          ]
          break
          
        case 'student':
          list = [
            {
              pagePath: "/pages/courses/courses", 
              text: "课程",
              iconPath: "/images/lesson.png"
            },
            {
              pagePath: "/pages/index/index",
              text: "发现",
              iconPath: "/images/search.png"
            },
            {
              pagePath: "/pages/student/learning-center/learning-center",
              text: "学习中心",
              iconPath: "/images/studyCenter.png"
            },
            {
              pagePath: "/pages/community/community",
              text: "社区",
              iconPath: "/images/shequ.png"
            },
            {
              pagePath: "/pages/student/profile/profile",
              text: "我的",
              iconPath: "/images/workspace/wode.png"
            }
          ]
          break
          
        case 'parent':
          list = [
            {
              pagePath: "/pages/courses/courses",
              text: "课程",
              iconPath: "/images/lesson.png"
            },
            {
              pagePath: "/pages/index/index",
              text: "老师",
              iconPath: "/images/search.png"
            },
            {
              pagePath: "/pages/parent/supervision/supervision",
              text: "学习监督",
              iconPath: "/images/studyCenter.png"
            },
            {
              pagePath: "/pages/parent/profile/profile", 
              text: "我的",
              iconPath: "/images/workspace/wode.png"
            }
          ]
          break
          
        default:
          // 未登录或未知角色，不显示TabBar
          list = []
      }
      
      this.setData({ list })
    },

    // 从当前页面更新选中状态
    updateSelectedFromCurrentPage() {
      const pages = getCurrentPages()
      if (pages.length === 0) return
      
      const currentPage = pages[pages.length - 1]
      const currentPath = '/' + currentPage.route
      
      // 在列表中查找当前页面的索引
      const currentIndex = this.data.list.findIndex(item => item.pagePath === currentPath)
      if (currentIndex !== -1) {
        this.setData({ selected: currentIndex })
      }
    },

    // 设置选中状态（供页面调用）
    setSelected(index) {
      this.setData({ selected: index })
    },

    // Tab点击事件（使用 reLaunch 允许跨任意页面切换）
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      this.setData({ selected: index })
      try { wx.showLoading({ title: '加载中...', mask: true }) } catch(_) {}
      wx.reLaunch({
        url: path,
        fail: (error) => {
          console.error('TabBar跳转失败:', error)
          wx.showToast({ title: '页面跳转失败', icon: 'none' })
        }
      })
    },

    // 角色变化时重新初始化
    onRoleChange() {
      console.log('用户角色变化，重新初始化TabBar')
      this.initTabBar()
    }
  }
})