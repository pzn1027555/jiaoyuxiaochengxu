const request = require('../../../utils/request')

Page({
  data: {
    id: null,
    detail: {}
  },

  onLoad(query) {
    const id = Number(query.id || 0)
    this.setData({ id })
    const channel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (channel && channel.on) {
      channel.on('postData', ({ item }) => {
        this.setData({ detail: item })
      })
    }
    if (!this.data.detail.id && id) {
      this.fetchDetail(id)
    }
  },

  async fetchDetail(id) {
    try {
      const res = await request.get('/mini/research/list')
      if (res && res.success) {
        const found = (res.data || []).find(i => i.id === id)
        if (found) this.setData({ detail: found })
      }
    } catch (e) {}
  },

  onJoin() {
    wx.showToast({ title: '报名成功，我们会及时通知您', icon: 'none' })
  }
})


