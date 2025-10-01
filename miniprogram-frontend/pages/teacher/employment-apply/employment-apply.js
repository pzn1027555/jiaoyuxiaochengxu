const api = require('../../../utils/api')
const request = require('../../../utils/request')

Page({
  data: {
    postId: null,
    resume: { name: '', url: '', size: 0 },
    submitting: false
  },

  onLoad(query){
    this.setData({ postId: Number(query.postId || 0) })
  },

  chooseResume(){
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf','doc','docx','ppt','pptx'],
      success: async (res) => {
        const file = res.tempFiles[0]
        if (!file) return
        try {
          wx.showLoading({ title: '上传中...', mask: true })
          const up = await api.upload.file(file.path || file.filePath)
          wx.hideLoading()
          if (up && up.code == 200 && up.data && up.data.url) {
            this.setData({ resume: { name: file.name, url: up.data.url, size: up.data.size || file.size } })
            wx.showToast({ title: '上传成功', icon: 'success' })
          } else {
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        } catch (e) {
          wx.hideLoading(); wx.showToast({ title: '上传失败', icon: 'none' })
        }
      }
    })
  },

  async submitApply(){
    if (!this.data.resume.url) { wx.showToast({ title: '请先上传简历', icon: 'none' }); return }
    this.setData({ submitting: true })
    try {
      // 从本地缓存获取教师信息（profile 页面已缓存 teacher_info）
      const teacherInfo = wx.getStorageSync('teacher_info') || {}
      const teacherId = teacherInfo.id
      if (!teacherId) {
        this.setData({ submitting: false })
        wx.showToast({ title: '教师信息缺失，请返回个人中心重新进入', icon: 'none' })
        return
      }

      const payload = {
        postId: this.data.postId,
        teacherId: teacherId,
        resumeUrl: this.data.resume.url,
        resumeName: this.data.resume.name,
        resumeSize: this.data.resume.size
      }
      const res = await request.post('/mini/employment/apply', payload)
      this.setData({ submitting: false })
      if (res && res.success) {
        wx.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1200)
      }
    } catch (e) {
      this.setData({ submitting: false }); wx.showToast({ title: '提交失败', icon: 'none' })
    }
  }
})


