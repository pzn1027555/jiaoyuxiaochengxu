const api = require('../../../utils/api')

Page({
  data:{
    headerHeight:0,
    viewMode:'student',
    planId:null,
    plan:null,
    loading:false,
    submitting:false,
    // 月历
    year:0, month:0,
    days:[],
    selectedDate:'',
    // 按天分组的排课
    scheduleMap:{},
    // 选中日期的排课项
    items:[]
  },

  onLoad(options){
    const { planId, viewMode } = options || {}
    const now = new Date()
    this.setData({
      planId: planId ? Number(planId) : null,
      viewMode: viewMode || 'student',
      year: now.getFullYear(),
      month: now.getMonth()+1
    })
    this.buildMonth(now.getFullYear(), now.getMonth()+1)
    this.setSelected(this.dateToStr(now))
    this.loadPlan()
  },

  onHeaderReady(e){ const { totalHeight } = e.detail || {}; this.setData({ headerHeight: totalHeight || 0 }) },

  // ===== 日历与日期处理 =====
  dateToStr(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` },
  strToDate(s){ if(!s) return new Date(); return new Date(String(s).replace(/-/g,'/')) },

  buildMonth(year, month){
    const daysInMonth = new Date(year, month, 0).getDate()
    const todayStr = this.dateToStr(new Date())
    const res = []
    for(let i=1;i<=daysInMonth;i++){
      const ds = `${year}-${('0'+month).slice(-2)}-${('0'+i).slice(-2)}`
      res.push({ date:i, isToday: ds===todayStr, selected:false, hasCourse:false })
    }
    this.setData({ days: res }, ()=> this.repaintDots())
  },

  repaintDots(){
    const { year, month, days, scheduleMap } = this.data
    const prefix = `${year}-${('0'+month).slice(-2)}-`
    const set = new Set(Object.keys(scheduleMap||{}).filter(d=> d.startsWith(prefix)).map(d=> Number(d.slice(-2))))
    const next = (days||[]).map((x,idx)=> ({ ...x, hasCourse: set.has(idx+1) }))
    this.setData({ days: next })
  },

  setSelected(dateStr){
    const d = this.strToDate(dateStr)
    const day = d.getDate()
    const days = (this.data.days||[]).map((x,idx)=> ({ ...x, selected: (idx+1)===day }))
    this.setData({ days, selectedDate: dateStr }, ()=> this.updateItemsForDate(dateStr))
  },

  prevMonth(){
    let { year, month } = this.data
    month--; if(month===0){ month=12; year-- }
    this.setData({ year, month })
    this.buildMonth(year, month)
    // 切月后选中1号或就近有课日期
    const first = `${year}-${('0'+month).slice(-2)}-01`
    const keys = Object.keys(this.data.scheduleMap||{}).filter(d=> d.startsWith(`${year}-${('0'+month).slice(-2)}-`)).sort()
    this.setSelected(keys[0] || first)
  },

  nextMonth(){
    let { year, month } = this.data
    month++; if(month===13){ month=1; year++ }
    this.setData({ year, month })
    this.buildMonth(year, month)
    const first = `${year}-${('0'+month).slice(-2)}-01`
    const keys = Object.keys(this.data.scheduleMap||{}).filter(d=> d.startsWith(`${year}-${('0'+month).slice(-2)}-`)).sort()
    this.setSelected(keys[0] || first)
  },

  onSelectDay(e){
    const idx = e.currentTarget.dataset.index
    const day = idx + 1
    const y = this.data.year
    const m = ('0'+this.data.month).slice(-2)
    const d = ('0'+day).slice(-2)
    this.setSelected(`${y}-${m}-${d}`)
  },

  // ===== 数据加载与映射 =====
  async loadPlan(){
    if (!this.data.planId) return
    this.setData({ loading:true })
    try{
      const res = await api.studyPlan.getDetail(this.data.planId)
      const data = (res && res.data) || {}
      const plan = data.plan || data
      const scheduleArr = Array.isArray(data.schedules) ? data.schedules : []
      const schedules = this.normalizeSchedulesFromServer(plan, scheduleArr)
      const scheduleMap = {}
      schedules.forEach(it=>{
        const ds = (it.date || '').slice(0,10)
        if (!scheduleMap[ds]) scheduleMap[ds] = []
        scheduleMap[ds].push(it)
      })
      // 选中第一个有课的日期
      const keys = Object.keys(scheduleMap).sort()
      let selectedDate = this.data.selectedDate
      if (!selectedDate && keys.length){ selectedDate = keys[0] }
      const d = this.strToDate(selectedDate || this.dateToStr(new Date()))
      this.setData({ plan, scheduleMap, year: d.getFullYear(), month: d.getMonth()+1 }, ()=>{
        this.buildMonth(this.data.year, this.data.month)
        this.setSelected(this.dateToStr(d))
      })
    }catch(e){
      wx.showToast({ title:'加载失败', icon:'none' })
    }finally{ this.setData({ loading:false }) }
  },

  normalizeSchedulesFromServer(plan, scheduleArr){
    const totalLessons = plan && (plan.totalLessons || plan.total || plan.lessonCount)
    return scheduleArr.map((raw, idx)=>{
      const start = String(raw.startTime || '')
      const end = String(raw.endTime || '')
      const title = raw.title || plan.title || '课程'
      const lessonNo = raw.lessonNumber || (idx+1)
      const desc = raw.remark || raw.intro || ''
      return {
        id: raw.id || lessonNo,
        date: (start || '').replace('T',' ').slice(0,10),
        start,
        end,
        title,
        lessonNo,
        totalLessons: raw.totalLessons || totalLessons || 1,
        desc
      }
    })
  },

  updateItemsForDate(dateStr){
    const list = (this.data.scheduleMap && this.data.scheduleMap[dateStr]) || []
    const items = list.map(it=>({
      id: it.id,
      title: it.title,
      startTimeText: (String(it.start||'').replace('T',' ').slice(11,16)) || (String(it.date||'').slice(11,16)) || '',
      endTimeText: (String(it.end||'').replace('T',' ').slice(11,16)) || '',
      lessonNo: it.lessonNo,
      totalLessons: it.totalLessons,
      desc: it.desc || ''
    })).sort((a,b)=> (a.startTimeText||'').localeCompare(b.startTimeText||''))
    this.setData({ items })
  },

  // ===== 操作 =====
  async onConfirmPlan(){
    if (this.data.viewMode === 'teacher') return
    if (!this.data.planId) return
    this.setData({ submitting:true })
    try{
      const res = await api.studyPlan.confirmAndCreateOrder(this.data.planId)
      if (res && (res.success || res.code===200)){
        wx.showToast({ title:'已同意并创建订单', icon:'success' })
        const userType = (this.data.viewMode === 'parent') ? 'parent' : 'student'
        setTimeout(()=>{ wx.navigateTo({ url:`/pages/orders/orders?userType=${userType}` }) }, 500)
      }else{
        wx.showToast({ title:(res && res.message) || '操作失败', icon:'none' })
      }
    }catch(e){ wx.showToast({ title: (e && e.message) || '操作失败', icon:'none' }) }
    finally{ this.setData({ submitting:false }) }
  }
})

