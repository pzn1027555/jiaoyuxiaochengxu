// 通用顶部导航组件
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    // 页面标题
    title: {
      type: String,
      value: '页面标题'
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      value: '#fff'
    }
  },

  data: {
    statusBarHeight: 0,
    headerHeight: 0
  },

  lifetimes: {
    attached() {
      this.getSystemInfo()
    }
  },

  methods: {
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = wx.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const headerHeight = statusBarHeight + 44 // 状态栏高度 + 导航栏高度

      this.setData({
        statusBarHeight: statusBarHeight,
        headerHeight: headerHeight
      })

      // 向父组件传递顶部高度，用于页面内容适配
      this.triggerEvent('headerReady', {
        statusBarHeight: statusBarHeight,
        headerHeight: headerHeight,
        totalHeight: statusBarHeight + 88 / 2 // 88rpx转换为px大约是44px
      })
    },

    // 返回按钮点击事件
    onBackTap() {
      // 先触发自定义事件，让父组件有机会处理
      this.triggerEvent('back')
      
      // 如果父组件没有阻止默认行为，则执行默认返回
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          wx.navigateBack()
        } else {
          // 如果是第一个页面，根据当前路由所属角色跳转各自首页
          try{
            const currentPath = pages && pages.length ? ('/' + pages[pages.length - 1].route) : ''
            let home = '/pages/index/index'
            if (currentPath.indexOf('/pages/teacher/') === 0) {
              home = '/pages/teacher/workspace/workspace'
            } else if (currentPath.indexOf('/pages/student/') === 0) {
              home = '/pages/courses/courses'
            } else if (currentPath.indexOf('/pages/parent/') === 0) {
              home = '/pages/courses/courses'
            }
            wx.reLaunch({ url: home })
          }catch(e){ wx.reLaunch({ url: '/pages/index/index' }) }
        }
      }, 0)
    }
  }
})
