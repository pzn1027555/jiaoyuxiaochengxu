const request = require('../../../utils/request')

Page({
  data: {
    id: null,
    detail: {}
  },

  onLoad(query) {
    const id = Number(query.id || 0)
    this.setData({ id })
    // 优先接收上个页面传值
    const channel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (channel && channel.on) {
      channel.on('postData', ({ item }) => {
        this.setData({ detail: item })
      })
    }
    // 兜底：请求整表后本地查找（列表数据不大时可接受；若后端提供详情接口可替换）
    if (!this.data.detail.id && id) {
      this.fetchDetail(id)
    }
  },

  async fetchDetail(id) {
    try {
      const res = await request.get('/mini/employment/list')
      if (res && res.success) {
        const found = (res.data || []).find(i => i.id === id)
        if (found) this.setData({ detail: found })
      }
    } catch (e) {}
  },

  onApply() {}
})


