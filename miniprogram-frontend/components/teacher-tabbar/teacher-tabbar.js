// components/teacher-tabbar/teacher-tabbar.js
Component({
  properties: {
    currentTab: {
      type: String,
      value: 'workspace'
    }
  },

  data: {
    // 组件内部数据
  },

  methods: {
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab
      const currentTab = this.properties.currentTab
      
      if (tab === currentTab) {
        return // 如果点击的是当前标签，不执行跳转
      }
      
      let url = ''
      switch (tab) {
        case 'workspace':
          url = '/pages/teacher/workspace/workspace'
          break
        case 'resources':
          url = '/pages/teacher/resources/resources'
          break
        case 'profile':
          url = '/pages/teacher/profile/profile'
          break
        default:
          return
      }
      
      // 使用 redirectTo 来避免页面栈过深
      wx.redirectTo({
        url: url,
        fail: () => {
          // 如果 redirectTo 失败，尝试使用 navigateTo
          wx.navigateTo({
            url: url
          })
        }
      })
    }
  }
})