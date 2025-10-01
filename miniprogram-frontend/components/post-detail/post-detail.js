Component({
  properties: {
    type: { type: String, value: 'research' },
    detail: { type: Object, value: {} }
  },
  methods: {
    onAction() {
      const type = this.data.type
      const id = this.data.detail && this.data.detail.id
      if (type === 'employment') {
        wx.navigateTo({ url: `/pages/teacher/employment-apply/employment-apply?postId=${id || ''}` })
      } else {
        // 教研报名：带上teacherId
        const teacherInfo = wx.getStorageSync('teacher_info') || {}
        const teacherId = teacherInfo.id
        if (!teacherId) {
          wx.showToast({ title: '教师信息缺失，请先登录', icon: 'none' })
          return
        }
        const request = require('../../utils/request')
        request.post('/mini/research/apply', { postId: id, teacherId }).then(() => {
          wx.showToast({ title: '报名成功', icon: 'success' })
        }).catch(() => wx.showToast({ title: '报名失败', icon: 'none' }))
      }
    }
  }
})


