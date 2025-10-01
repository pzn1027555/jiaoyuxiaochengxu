const api = require('../../../utils/api')
const { getStaticBaseUrl } = require('../../../config/env')

Page({
  data: {
    headerHeight: 0,
    applyStatus: null,
    notiList: [],
    qrcodeUrl: '',
    applying: false
  },

  onShow() {
    this.fetchAll()
  },

  onHeaderReady(e) {
    const { totalHeight } = e.detail || {}
    this.setData({ headerHeight: totalHeight || 0 })
  },

  async fetchAll() {
    const teacherInfo = wx.getStorageSync('teacher_info') || {}
    const teacherId = teacherInfo.id
    if (!teacherId) return

    try {
      const [stRes, notiRes] = await Promise.all([
        api.mooc.status(teacherId).catch(() => ({})),
        api.mooc.notifications(teacherId).catch(() => ({}))
      ])

      // 申请状态
      let applyStatus = null
      if (stRes && stRes.success && stRes.data) {
        const st = stRes.data
        const statusText = st.status === 0 ? '在审核中' : (st.status === 1 ? '审核通过' : '已拒绝')
        applyStatus = {
          desc: `您申请的磨课${statusText}`,
          timeDesc: (st.applyTime || st.auditTime || '').replace('T',' '),
          canApply: st.status !== 0
        }
      } else {
        // 没有记录也显示卡片，并允许申请
        applyStatus = { desc: '尚未申请磨课', timeDesc: '', canApply: true }
      }

      // 通知列表
      const notiRaw = (notiRes && notiRes.success && Array.isArray(notiRes.data)) ? notiRes.data : []
      // 提取最新 group 通知中的二维码
      let qrcodeUrl = ''
      notiRaw.forEach(n => {
        if (n.type === 'group' && !qrcodeUrl) {
          const url = n.qrcodeUrl || ''
          qrcodeUrl = this.normalizeUploadUrl(url)
        }
      })

      const notiList = notiRaw.map(n => ({
        id: String(n.id),
        title: n.content || n.title || '',
        timeDesc: (n.createTime || '').replace('T',' ')
      }))

      this.setData({ applyStatus, notiList, qrcodeUrl })
    } catch (e) {
      this.setData({ applyStatus: { desc: '尚未申请磨课', timeDesc: '', canApply: true }, notiList: [] })
    }
  },

  normalizeUploadUrl(url) {
    if (!url) return ''
    if (/^https?:\/\//.test(url)) return url
    const path = url.startsWith('/') ? url : `/${url}`
    const base = getStaticBaseUrl()
    return `${base}${path}`
  },

  async onApply() {
    if (this.data.applying || !this.data.applyStatus || !this.data.applyStatus.canApply) return
    const teacherInfo = wx.getStorageSync('teacher_info') || {}
    if (!teacherInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    this.setData({ applying: true })
    try {
      const res = await api.mooc.apply(teacherInfo.id)
      if (res && res.success) {
        wx.showToast({ title: '已提交', icon: 'success' })
        await this.fetchAll()
      } else {
        wx.showToast({ title: (res && res.message) || '提交失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '网络错误', icon: 'none' })
    } finally {
      this.setData({ applying: false })
    }
  },

  async onRead(e) {
    const id = e.currentTarget.dataset.id
    try { await api.mooc.readNotification(id); this.fetchAll() } catch (e) {}
  }
})


