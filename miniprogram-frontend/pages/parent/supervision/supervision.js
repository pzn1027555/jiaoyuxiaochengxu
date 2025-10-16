// pages/parent/supervision/supervision.js
const api = require('../../../utils/api')
const parentApi = require('../../../api/parent')

Page({
  data: {
    // 子女列表（与 study-plan 对齐）
    students: [],
    currentStudentId: null,

    // 学习时长统计
    duration: { today: 0, week: 0, month: 0 },

    // 图表相关
    chartPeriod: 'day',
    chartData: { labels: [], values: [] },
    chart: null,
    showChart: true,

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
    // 先隐藏图表，避免页面切换残留闪烁，再延时渲染
    this.setData({ showChart:false }, ()=>{
      setTimeout(()=>{ this.setData({ showChart:true }, ()=> this.loadData()) }, 0)
    })
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2)
    }
  },

  goStudyPlan(){ wx.navigateTo({ url:'/pages/parent/study-plan/study-plan' }) },

  onPullDownRefresh() {
    this.loadData(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 初始化页面
  initPage() {
    this.checkUserRole()
    this.loadStudents()
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

  // 加载子女列表（与 study-plan 逻辑保持一致）
  async loadStudents() {
    try {
      const res = await api.parent.getChildren()
      const rawList = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const list = rawList.map(item => {
        const studentId = item.studentId !== undefined ? item.studentId : (item.id !== undefined ? item.id : item.childId)
        return {
          ...item,
          studentId,
          studentName: item.studentName || item.name || item.childName || '',
          studentAvatar: item.studentAvatar || item.avatar || item.avatarFull || ''
        }
      }).filter(it => it.studentId !== undefined && it.studentId !== null)
      const firstId = list.length ? list[0].studentId : null
      this.setData({ students: list, currentStudentId: firstId })
      if (firstId) {
        this.loadData()
      }
    } catch (error) {
      console.error('加载子女列表失败:', error)
      this.setData({ students: [], currentStudentId: null })
    }
  },

  // 顶部子女点击切换
  onPickStudent(e){
    const id = e.currentTarget.dataset.id
    if(!id || id===this.data.currentStudentId) return
    this.setData({ currentStudentId: id }, () => this.loadData())
  },

  // 加载数据（学习时长统计 + 报告占位）
  async loadData() {
    if (!this.data.currentStudentId) return
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
      const query = wx.createSelectorQuery().in(this)
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

  onHide(){
    // 页面隐藏时，销毁画布显示，避免路由切换残留
    this.setData({ showChart: false })
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
      const studentId = this.data.currentStudentId
      if (!studentId || !month){ this.setData({ feedbackList:[], midtermList:[] }); return }
      const request = require('../../../utils/request.js')
      // 课堂反馈
      const fbRes = await request.get('/mini/parent/feedback/list', { studentId, month, type:'teacher_daily' })
      const mdRes = await request.get('/mini/parent/feedback/list', { studentId, month, type:'midterm' })
      const normFb = (arr)=> (Array.isArray(arr)?arr:[]).map(it=>({
        id: it.scheduleId,
        teacherName: it.teacherName||'',
        teacherAvatar: it.teacherAvatar||'/images/default-avatar.png',
        time: String(it.startTime||'').replace('T',' ').slice(0,16),
        content: it.content||'',
        courseName: it.title||''
      }))
      const normMd = (arr)=> (Array.isArray(arr)?arr:[]).map(it=>({
        id: it.scheduleId,
        teacherName: it.teacherName||'',
        teacherAvatar: it.teacherAvatar||'/images/default-avatar.png',
        courseName: it.title||'',
        time: String(it.startTime||'').replace('T',' ').slice(0,16),
        content: it.content||''
      }))
      const feedback = (fbRes && fbRes.success) ? normFb(fbRes.data) : []
      const midterm = (mdRes && mdRes.success) ? normMd(mdRes.data) : []
      this.setData({ feedbackList: feedback, midtermList: midterm })
    }catch(err){ console.error('加载报告失败', err); this.setData({ feedbackList:[], midtermList:[] }) }
  },

  // 下方报告仍使用模拟数据

  // 加载学习概况（真实：按所选学生汇总分钟数 -> 小时）
  async loadLearningOverview() {
    try {
      const storageUserStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const storageUser = typeof storageUserStr === 'string' ? JSON.parse(storageUserStr) : storageUserStr
      const phone = storageUser.phone || storageUser?.parent_info?.phone || storageUser?.student_info?.phone || storageUser?.teacher_info?.phone
      let duration = { today: 0, week: 0, month: 0 }
      let labels = []
      let values = []
      try {
        const params = this.data.chartPeriod ? { period: this.data.chartPeriod, studentId: this.data.currentStudentId, ...(phone?{ phone }: {}) } : { studentId: this.data.currentStudentId, ...(phone?{ phone }: {}) }
        const res = await parentApi.getStudyStats(params)
        if (res && res.success) {
          const d = res.data || {}
          duration = d.duration || duration
          const chart = d.chart || { labels: [], values: [] }
          labels = chart.labels || []
          values = chart.values || []
        }
      } catch(e) { /* ignore backend error */ }

      // 前端兜底：严格按所选学生逐日统计本周学习时长，避免后端聚合口径差异
      const weekAgg = await this.computeWeekMinutes(this.data.currentStudentId)
      if (weekAgg && Number.isFinite(weekAgg.totalMinutes)) {
        const weekHours = Number((weekAgg.totalMinutes / 60).toFixed(1))
        duration = { ...duration, week: weekHours }
        // 周视图趋势：使用本周每日小时数
        if (this.data.chartPeriod === 'week') {
          labels = weekAgg.labels
          values = weekAgg.dailyMinutes.map(m => Number(((m||0)/60).toFixed(1)))
        }
      }

      if (!labels.length || !values.length) {
        if (this.data.chartPeriod === 'day') {
          labels = ['00','04','08','12','16','20']
          values = [0, 0, 0, 0, 0, 0]
        } else if (this.data.chartPeriod === 'week') {
          labels = ['周一','周二','周三','周四','周五','周六','周日']
          values = [0, 0, 0, 0, 0, 0, 0]
        } else {
          labels = ['1周','2周','3周','4周']
          values = [0, 0, 0, 0]
        }
        duration = { today: 0, week: 0, month: 0 }
      }

      this.setData({ duration, chartData: { labels, values } }, ()=> this.renderChart())
    } catch (error) {
      console.error('加载学习概况失败:', error)
    }
  },

  // 计算本周（周一至周日）逐日分钟数与总分钟数
  async computeWeekMinutes(studentId){
    try{
      if(!studentId) return { totalMinutes: 0, dailyMinutes: [0,0,0,0,0,0,0], labels: ['周一','周二','周三','周四','周五','周六','周日'] }
      // 计算本周周一
      const now = new Date()
      const day = now.getDay() || 7 // 周日为0，转换为7
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1))
      const days = [...Array(7)].map((_,i)=>{
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()+i)
        const y = d.getFullYear(); const m = ('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2)
        return `${y}-${m}-${da}`
      })
      const labels = ['周一','周二','周三','周四','周五','周六','周日']
      const results = await Promise.all(days.map(ds => api.studentSchedule.getDay({ studentId, date: ds }).catch(()=>null)))
      const dailyMinutes = results.map((res)=>{
        try{
          const items = res && res.data && Array.isArray(res.data.items) ? res.data.items : []
          let sum = 0
          items.forEach(it => {
            const dm = Number(it.durationMinutes)
            if (Number.isFinite(dm) && dm>0) { sum += dm; return }
            const st = parseDateTime(it.startTime || it.start_time)
            const et = parseDateTime(it.endTime || it.end_time)
            if (st && et) {
              const diff = Math.max(0, et - st)
              sum += Math.round(diff / 60000)
            }
          })
          return sum
        }catch(e){ return 0 }
      })
      const totalMinutes = dailyMinutes.reduce((a,b)=>a+b,0)
      return { totalMinutes, dailyMinutes, labels }
    }catch(e){
      return { totalMinutes: 0, dailyMinutes: [0,0,0,0,0,0,0], labels: ['周一','周二','周三','周四','周五','周六','周日'] }
    }
  }
})

function parseDateTime(str){
  if(!str) return null
  const s = String(str).replace('T',' ').replace(/-/g,'/')
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}