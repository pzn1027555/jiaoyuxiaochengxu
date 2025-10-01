const notificationApi = require('../../../api/notification')

Page({
  data: { headerHeight: 0, list: [], loading: false },
  onLoad() { this.loadList() },
  onHeaderReady(e) { const { totalHeight } = e.detail || {}; this.setData({ headerHeight: totalHeight || 0 }) },
  async loadList(){
    this.setData({ loading: true })
    try {
      const res = await notificationApi.list({ userType: 'parent' })
      if (res && res.success) {
        const list = (res.data || []).map(it => ({
          ...it,
          displayTime: this.formatTime(it.createTime)
        }))
        this.setData({ list })
      }
    } finally { this.setData({ loading: false }) }
  },
  formatTime(ts){
    try {
      if (!ts) return ''
      let str = String(ts)
      // 兼容 ISO 8601（2025-08-29T10:30:14 或 ...Z），以及常规 "YYYY-MM-DD HH:mm:ss"
      str = str.replace('T', ' ').replace('Z', '').replace(/-/g, '/').trim()
      let d = new Date(str)
      if (isNaN(d.getTime())) {
        // 手动解析兜底
        const m = String(ts).match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/)
        if (m) d = new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +(m[6]||0))
      }
      if (isNaN(d.getTime())) return ts
      const diff = (Date.now() - d.getTime())/1000
      if (diff < 60) return '刚刚'
      if (diff < 3600) return `${Math.floor(diff/60)}分钟前`
      if (diff < 86400) return `${Math.floor(diff/3600)}小时前`
      const mm = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0')
      return `${mm}-${dd}`
    } catch(e) { return ts || '' }
  },
  async markRead(e){
    const id = e.currentTarget.dataset.id
    await notificationApi.markRead({ id, userType: 'parent' })
    this.loadList()
  },
  async markAll(){
    await notificationApi.markAll({ userType: 'parent' })
    this.loadList()
  },
  openTarget(e){
    const type = e.currentTarget.dataset.type
    const relatedId = e.currentTarget.dataset.relatedid
    if (type === 'schedule') {
      if (relatedId) {
        wx.navigateTo({ url: `/pages/student/schedule-confirm/schedule-confirm?planId=${relatedId}&viewMode=parent` })
      }
      return
    }
    if (type === 'money') {
      wx.navigateTo({ url: '/pages/parent/consumption-overview/consumption-overview' })
    } else if (type === 'order') {
      wx.navigateTo({ url: '/pages/orders/orders?userType=parent' })
    } else if (type === 'activity') {
      wx.navigateTo({ url: '/pages/community/community' })
    } else {
      wx.navigateTo({ url: '/pages/parent/profile/profile' })
    }
  }
})

