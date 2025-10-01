// pages/parent/supervision/supervision.js
const parentApi = require('../../../api/parent')

Page({
  data: {
    // 孩子列表
    children: [],

    // 当前选中的孩子
    selectedChild: null,

    // 学习时长统计
    duration: { today: 0, week: 0, month: 0 },

    // 图表相关
    chartPeriod: 'day',
    chartData: { labels: [], values: [] },
    chart: null,

    // 胶囊分段滑块位置
    segLeft: '0%',

    // 下方报告区
    activeTab: 'feedback', // feedback | midterm
    selectedMonth: '',
    feedbackList: [],
    midtermList: []
  },

  onLoad() {
    this.initPage()
    // 初始化默认月份 YYYY-MM
    try{
      const now = new Date()
      const m = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}`
      this.setData({ selectedMonth: m })
    }catch(e){}
  },

  onShow() {
    this.loadData()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2)
    }
  },

  onPullDownRefresh() {
    this.loadData(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 初始化页面
  initPage() {
    this.checkUserRole()
    this.loadChildren()
  },

  // 检查用户角色
  checkUserRole() {
    const app = getApp()
    if (app.globalData.userRole !== 'parent') {
      wx.showModal({
        title: '权限不足',
        content: '您没有权限访问此页面',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    }
  },

  // 加载孩子列表
  async loadChildren() {
    try {
      // 模拟数据，实际应从API获取
      const children = [
        {
          id: 1,
          name: '小明',
          grade: '高一',
          gender: 'female',
          avatar: '/images/wx.png',
          school: '实验中学'
        },
        {
          id: 2,
          name: '小红',
          grade: '初三',
          gender: 'male',
          avatar: '/images/wx.png',
          school: '育才中学'
        }
      ]

      this.setData({
        children: children,
        selectedChild: children[0] || null
      })

      if (children.length > 0) {
        this.loadData()
      }
    } catch (error) {
      console.error('加载孩子列表失败:', error)
    }
  },

  // 头像加载失败兜底
  onAvatarError() {
    const fallback = '/images/wx.png'
    const selected = this.data.selectedChild || {}
    if (selected && selected.avatar !== fallback) {
      selected.avatar = fallback
      const children = (this.data.children || []).map(c => c.id === selected.id ? { ...c, avatar: fallback } : c)
      this.setData({ selectedChild: selected, children })
    }
  },

  // 加载数据（仅学习时长统计）
  async loadData() {
    if (!this.data.selectedChild) return
    try {
      await this.loadLearningOverview()
      await this.loadReports()
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 切换图表周期
  switchPeriod(e){
    const key = e.currentTarget.dataset.key
    const segLeft = key === 'day' ? '0%' : key === 'week' ? '33.33%' : '66.66%'
    this.setData({ chartPeriod: key, segLeft }, ()=> this.loadLearningOverview())
  },

  // 渲染折线图（wx-echarts）
  renderChart(){
    try{
      const query = wx.createSelectorQuery()
      query.select('#studyChart').fields({ node: true, size: true }).exec(res => {
        const result = res && res[0]
        if (!result || !result.node) return
        const canvas = result.node
        const width = result.width
        const height = result.height
        const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        const ctx = canvas.getContext('2d')
        // 按 dpr 缩放，确保绘制按 CSS 像素尺寸铺满
        ctx.scale(dpr, dpr)

        // 清空
        ctx.clearRect(0,0,width,height)

        // 坐标内边距
        const padding = { left: 40, right: 20, top: 20, bottom: 30 }
        const plotW = width - padding.left - padding.right
        const plotH = height - padding.top - padding.bottom

        const { labels, values } = this.data.chartData
        const maxVal = Math.max.apply(null, values.concat([0]))
        const yMax = maxVal === 0 ? 1 : maxVal
        const yMin = 0

        // 画网格
        ctx.strokeStyle = '#f0f0f0'
        ctx.lineWidth = 1 / dpr
        for (let i=0;i<=4;i++){
          const y = padding.top + (plotH * i / 4)
          ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke()
        }

        // 轴标签（x）
        ctx.fillStyle = '#666'
        ctx.font = `10px sans-serif`
        labels.forEach((lab, idx)=>{
          const x = padding.left + (plotW * (labels.length===1?0.5:idx/(labels.length-1)))
          ctx.textAlign = 'center'; ctx.textBaseline = 'top'
          ctx.fillText(lab, x, height - padding.bottom + 6)
        })

        // 纵坐标标签（y）
        ctx.fillStyle = '#666'
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
        for (let i=0;i<=4;i++){
          const y = padding.top + (plotH * i / 4)
          const val = yMax - (yMax - yMin) * (i / 4)
          const txt = yMax <= 5 ? val.toFixed(1) : Math.round(val).toString()
          ctx.fillText(txt, padding.left - 6, y)
        }

        // 折线
        ctx.strokeStyle = '#4CAF50'
        ctx.lineWidth = 2
        ctx.beginPath()
        values.forEach((v, idx)=>{
          const x = padding.left + (plotW * (values.length===1?0.5:idx/(values.length-1)))
          const ratio = (v - yMin) / (yMax - yMin)
          const y = padding.top + plotH - ratio * plotH
          if (idx===0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // 圆点
        ctx.fillStyle = '#4CAF50'
        values.forEach((v, idx)=>{
          const x = padding.left + (plotW * (values.length===1?0.5:idx/(values.length-1)))
          const ratio = (v - yMin) / (yMax - yMin)
          const y = padding.top + plotH - ratio * plotH
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill()
        })
      })
    }catch(e){ console.error('渲染图表失败', e) }
  },

  // 报告：切换页签
  switchTab(e){
    const key = e.currentTarget.dataset.key
    if (!key || key === this.data.activeTab) return
    this.setData({ activeTab: key })
  },

  // 月份变更（YYYY-MM）
  onMonthChange(e){
    const val = e.detail.value
    this.setData({ selectedMonth: val }, ()=> this.loadReports())
  },

  // 加载报告列表（模拟数据，可对接后端时替换）
  async loadReports(){
    try{
      const month = this.data.selectedMonth
      // 模拟两条课程反馈
      const feedback = [
        { id: 1, teacherName: '霍清妍', teacherAvatar: '/images/wx.png', time: `${month}-06 18:30`, content: '反馈内容，反馈内容。大江东去，浪淘尽，千古风流人物。故垒西边，人在否？三国周郎赤壁。' },
        { id: 2, teacherName: '霍清妍', teacherAvatar: '/images/wx.png', time: `${month}-01 09:20`, content: '学习态度认真，建议每日坚持单词复习与错题回顾。' }
      ]
      const midterm = [
        { id: 101, teacherName: '霍清妍', courseName: '数学提高班', teacherAvatar: '/images/wx.png', time: `${month}-10 14:20`, content: '本阶段掌握良好，函数与方程提高明显。' },
        { id: 102, teacherName: '霍清妍', courseName: '英语阅读课', teacherAvatar: '/images/wx.png', time: `${month}-02 10:10`, content: '阅读理解正确率提升，但词汇量仍需加强。' }
      ]
      this.setData({ feedbackList: feedback, midtermList: midterm })
    }catch(err){ console.error('加载报告失败', err) }
  },

  // 切换孩子
  onChildChange(e) {
    const index = e.detail.value
    const selectedChild = this.data.children[index]
    this.setData({ selectedChild })
    this.loadData()
  },

  // 加载学习概况（课时统计 + 图表数据）
  async loadLearningOverview() {
    try {
      const storageUser = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || {}
      const phone = storageUser.phone || storageUser?.parent_info?.phone || storageUser?.student_info?.phone || storageUser?.teacher_info?.phone
      let duration = { today: 0, week: 0, month: 0 }
      let labels = []
      let values = []
      try {
        const params = this.data.chartPeriod ? { period: this.data.chartPeriod, ...(phone?{ phone }: {}) } : (phone?{ phone }: {})
        const res = await parentApi.getStudyStats(params)
        if (res && res.success) {
          const d = res.data || {}
          duration = d.duration || duration
          const chart = d.chart || { labels: [], values: [] }
          labels = chart.labels || []
          values = chart.values || []
        }
      } catch(e) { /* ignore backend error */ }

      if (!labels.length || !values.length) {
        if (this.data.chartPeriod === 'day') {
          labels = ['00','04','08','12','16','20']
          values = [0.5, 1.2, 0.8, 1.5, 1.0, 0.6]
        } else if (this.data.chartPeriod === 'week') {
          labels = ['周一','周二','周三','周四','周五','周六','周日']
          values = [1.2, 1.0, 1.8, 0.9, 2.2, 1.6, 1.1]
        } else {
          labels = ['1周','2周','3周','4周']
          values = [6.5, 7.2, 5.8, 8.0]
        }
        duration = {
          today: Number(values[values.length-1] || 0).toFixed(1),
          week: this.data.chartPeriod==='week' ? values.reduce((a,b)=>a+b,0).toFixed(1) : 9.7,
          month: this.data.chartPeriod==='month' ? values.reduce((a,b)=>a+b,0).toFixed(1) : 32.4
        }
      }

      this.setData({ duration, chartData: { labels, values } }, ()=> this.renderChart())
    } catch (error) {
      console.error('加载学习概况失败:', error)
    }
  }
})