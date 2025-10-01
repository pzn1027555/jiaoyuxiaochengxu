// pages/teacher/income-overview/income-overview.js
Page({
  data: {
    // 自定义导航栏高度
    headerHeight: 0,
    
    // 总收入数据
    totalIncomeData: {
      month: '0.00',
      total: '0.00'
    },
    
    // 选中的年月
    selectedDate: '',
    selectedYearMonth: '',
    
    // 收入分组数据
    incomeGroups: [],
    
    // 加载状态
    loading: false
  },

  onLoad() {
    console.log('收入概览页面加载')
    this.initializePage()
  },

  onShow() {
    this.loadIncomeData()
  },

  // 自定义导航栏就绪回调
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({ 
      headerHeight: totalHeight
    })
  },

  // 初始化页面
  initializePage() {
    // 设置默认日期为当前年月
    const today = new Date()
    const selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    const selectedYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    
    this.setData({
      selectedDate,
      selectedYearMonth
    })
  },

  // 日期选择变化
  onDateChange(e) {
    const selectedDate = e.detail.value
    this.setData({
      selectedDate,
      selectedYearMonth: selectedDate
    })
    
    // 重新加载该日期的收入数据
    this.loadIncomeData()
  },

  // 加载收入数据
  async loadIncomeData() {
    try {
      this.setData({ loading: true })

      // 更新汇总
      const summary = await new Promise((resolve, reject) => {
        wx.request({
          url: require('../../../config/env').getApiBaseUrl() + '/mini/income/summary',
          method: 'GET',
          data: { yearMonth: this.data.selectedYearMonth },
          header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
          success: (r) => r.statusCode === 200 ? resolve(r.data) : reject(new Error('网络错误')),
          fail: reject
        })
      })
      if (summary && summary.code === 200) {
        this.setData({
          totalIncomeData: {
            month: (summary.data.month != null ? Number(summary.data.month).toFixed(2) : '0.00'),
            total: (summary.data.total != null ? Number(summary.data.total).toFixed(2) : '0.00')
          }
        })
      }

      // 加载月度明细
      const ym = this.data.selectedYearMonth
      const details = await new Promise((resolve, reject) => {
        wx.request({
          url: require('../../../config/env').getApiBaseUrl() + '/mini/income/monthly-detail',
          method: 'GET',
          data: { yearMonth: ym },
          header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
          success: (r) => r.statusCode === 200 ? resolve(r.data) : reject(new Error('网络错误')),
          fail: reject
        })
      })

      if (details && details.code === 200) {
        // 将扁平记录分组到本月（YYYY年M月）
        const [y, m] = ym.split('-')
        const groupTitle = `${y}年${parseInt(m, 10)}月`
        this.setData({
          incomeGroups: [{ month: groupTitle, records: (details.data || []).map((r, idx) => ({ id: r.record_id || idx, type: r.type, time: r.time, amount: Number(r.amount) })) }]
        })
      }

    } catch (error) {
      console.error('加载收入数据失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadIncomeData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '收入概览',
      path: '/pages/teacher/income-overview/income-overview'
    }
  }
})
