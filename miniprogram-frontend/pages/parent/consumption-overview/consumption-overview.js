// pages/parent/consumption-overview/consumption-overview.js
const accountApi = require('../../../api/account')

Page({
  data: {
    headerHeight: 0,
    selectedDate: '',
    selectedYearMonth: '',
    // 与教师端字段一致
    totalIncomeData: { month: '0.00', total: '0.00' },
    incomeGroups: [],
    loading: false
  },

  onLoad() {
    this.initDate()
  },

  onShow() {
    this.loadData()
  },

  onHeaderReady(e) {
    const { totalHeight } = e.detail || {}
    if (totalHeight) this.setData({ headerHeight: totalHeight })
  },

  initDate() {
    const today = new Date()
    const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
    this.setData({ selectedDate: ym, selectedYearMonth: ym })
  },

  onDateChange(e) {
    const ym = e.detail.value
    this.setData({ selectedDate: ym, selectedYearMonth: ym })
    this.loadData()
  },

  // 充值入口（预留）
  onRecharge(){
    wx.navigateTo({ url: '/pages/parent/recharge/recharge' })
  },

  // 时间格式化：YYYY-MM-DD HH:mm
  formatTime(val){
    try{
      if(!val) return ''
      const date = new Date(val)
      if (isNaN(date.getTime())) return val
      const y = date.getFullYear()
      const m = String(date.getMonth()+1).padStart(2,'0')
      const d = String(date.getDate()).padStart(2,'0')
      const hh = String(date.getHours()).padStart(2,'0')
      const mm = String(date.getMinutes()).padStart(2,'0')
      return `${y}-${m}-${d} ${hh}:${mm}`
    }catch(e){ return val }
  },

  async loadData(){
    try{
      this.setData({ loading:true })
      const storageUserStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const storageUser = typeof storageUserStr === 'string' ? JSON.parse(storageUserStr) : storageUserStr
      const phone = storageUser.phone || storageUser?.parent_info?.phone || storageUser?.student_info?.phone || storageUser?.teacher_info?.phone
      const ym = this.data.selectedYearMonth
      // 汇总
      const sRes = await accountApi.getParentBalanceSummary(phone ? { phone } : {})
      if (sRes && sRes.success) {
        const d = sRes.data || {}
        this.setData({ totalIncomeData: { month: (Number(d.available||0)).toFixed(2), total: (Number(d.totalConsumed||0)).toFixed(2) } })
      }
      // 明细
      const dRes = await accountApi.getParentConsumption({ yearMonth: ym, ...(phone?{ phone }: {}) })
      if (dRes && dRes.success) {
        const [y,m] = ym.split('-')
        const groupTitle = `${y}年${parseInt(m,10)}月`
        const records = (dRes.data || []).map((r,idx)=> ({ id: r.id||idx, type: r.title || r.type || '消费', time: this.formatTime(r.time || r.createTime), amount: Number(r.amount||0).toFixed(2) }))
        this.setData({ incomeGroups: [{ month: groupTitle, records }] })
      } else {
        this.setData({ incomeGroups: [] })
      }
    }catch(e){
      wx.showToast({ title:'加载失败', icon:'none' })
    }finally{
      this.setData({ loading:false })
    }
  }
})


