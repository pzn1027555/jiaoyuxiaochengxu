const api = require('../../../utils/api')
const studentApi = require('../../../api/student')

Page({
  data:{
    headerHeight:0,
    year:0, month:0,
    days:[],
    selectedDate:'',
    items:[],
    loading:false
  },

  onLoad(){
    const now = new Date()
    this.setData({ year: now.getFullYear(), month: now.getMonth()+1 })
    this.buildMonth(now.getFullYear(), now.getMonth()+1)
    this.setSelected(this.dateToStr(now))
    this.loadDay()
    this.loadLessonPrice()
  },

  async loadLessonPrice(){
    try{
      const apiAll = require('../../../utils/api')
      const res = await apiAll.lessonPrice.current()
      if(res && (res.success || res.code===200) && res.data && res.data.price!=null){
        this._defaultLessonPrice = Number(res.data.price)
      }
    }catch(e){}
  },

  onShow(){
    if (this.data.selectedDate) this.loadDay()
  },
  toAbsolute(url){
    const { getCoverUrl } = require('../../../utils/urlUtils')
    return getCoverUrl(url)
  },

  // 学生头像：无数据时返回默认头像
  avatarAbsolute(url){
    const { getAvatarUrl } = require('../../../utils/urlUtils')
    return getAvatarUrl(url)
  },

  onHeaderReady(e){ this.setData({ headerHeight: e.detail.totalHeight || 0 }) },

  dateToStr(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` },

  buildMonth(year, month){
    const daysInMonth = new Date(year, month, 0).getDate()
    const res=[]
    for(let i=1;i<=daysInMonth;i++){
      res.push({ date: i, selected:false, hasCourse:false })
    }
    this.setData({ days: res }, ()=> this.repaintDots())
    this.loadMonthDots(year, month)
  },

  repaintDots(){
    const { year, month, days, scheduleMap } = this.data
    const prefix = `${year}-${('0'+month).slice(-2)}-`
    const set = new Set(Object.keys(scheduleMap || {}).filter(d=>d.startsWith(prefix)).map(d=> Number(d.slice(-2))))
    const next = (days||[]).map((x,idx)=> ({ ...x, hasCourse: set.has(idx+1) }))
    this.setData({ days: next })
  },

  setSelected(dateStr){
    const d = new Date(dateStr.replace(/-/g,'/'))
    const sel = d.getDate()
    const days = (this.data.days||[]).map((x,idx)=>({ ...x, selected: (idx+1)===sel }))
    this.setData({ days, selectedDate: dateStr })
  },

  prevMonth(){
    let {year,month}=this.data
    month--; if(month===0){ month=12; year-- }
    this.setData({year,month}); this.buildMonth(year,month)
  },
  nextMonth(){
    let {year,month}=this.data
    month++; if(month===13){ month=1; year++ }
    this.setData({year,month}); this.buildMonth(year,month)
  },

  onSelectDay(e){
    const idx = e.currentTarget.dataset.index
    const day = idx+1
    const y=this.data.year, m=('0'+this.data.month).slice(-2), d=('0'+day).slice(-2)
    const ds = `${y}-${m}-${d}`
    this.setSelected(ds)
    this.loadDay()
  },

  async loadMonthDots(year, month){
    try{
      const ym = `${year}-${('0'+month).slice(-2)}`
      const res = await api.teacherSchedule.getMonth({ month: ym })
      const days = res && res.success && res.data && Array.isArray(res.data.days) ? res.data.days :
        (res && res.success && res.data && typeof res.data === 'object' && res.data.days instanceof Set ? Array.from(res.data.days) : [])
      const map = { ...(this.data.scheduleMap || {}) }
      Object.keys(map).forEach(key=>{
        if (key.startsWith(`${ym}-`)) delete map[key]
      })
      days.forEach(d=>{ map[String(d)] = true })
      this.setData({ scheduleMap: map }, ()=> this.repaintDots())
    }catch(e){ /* 忽略月度加载失败 */ }
  },

  async loadDay(){
    this.setData({ loading:true })
    try{
      const res = await api.teacherSchedule.getDay({ date: this.data.selectedDate })
      const arr = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []
      const items = arr.map(it=>({
        id: it.id,
        title: it.title,
        startTimeText: (it.startTime||'').replace('T',' ').slice(11,16),
        endTimeText: (it.endTime||'').replace('T',' ').slice(11,16),
        studentCount: it.studentCount,
        classType: it.classType,
        coverUrl: it.coverUrl,
        coverFullUrl: this.toAbsolute(it.coverUrl),
        lessonNo: it.lessonNumber,
        totalLessons: it.totalLessons,
        raw: it
      }))
      // 并行拉取每个课程的详情，拿到 studentIds
      const details = await Promise.all(items.map(it=> api.teacherSchedule.detail(it.id).catch(()=>({}))))
      const allStudentsRes = await studentApi.getAllStudents().catch(()=>null)
      const allStudents = (allStudentsRes && (allStudentsRes.success===true || allStudentsRes.code===200) && Array.isArray(allStudentsRes.data)) ? allStudentsRes.data : []
      const idToStudent = {}
      allStudents.forEach(s=>{ idToStudent[String(s.id)] = { id:String(s.id), name:s.name, avatar:this.avatarAbsolute(s.avatar) } })
      // 组装展示用学生列表
      items.forEach((it, idx)=>{
        const det = details[idx] && (details[idx].data || details[idx].result || details[idx])
        const studentIds = det && det.data && Array.isArray(det.data.studentIds) ? det.data.studentIds : (det && Array.isArray(det.studentIds) ? det.studentIds : [])
        const students = studentIds.map(id=> idToStudent[String(id)]).filter(Boolean)
        it.students = students
        it.displayStudents = it.classType==='big_class' ? students.slice(0,3) : students
        if (typeof it.studentCount !== 'number') it.studentCount = students.length
      })
      // 更新当月日历红点
      this.setData({ items }, ()=> this.repaintDots())
    }catch(e){
      wx.showToast({ title:'加载失败', icon:'none' })
    }finally{ this.setData({ loading:false }) }
  },

  onChangeTime(e){
    const id = e.currentTarget.dataset.id
    const that = this
    wx.showActionSheet({ itemList:['修改开始时间'], success(){ that.pickTimeRange(id) } })
  },

  pickTimeRange(id){
    const date = this.data.selectedDate
    // 复用编辑页时间选择器逻辑：弹出双列小时/分钟
    const that = this
    const hours = Array.from({length:24}, (_,i)=> (i<10? '0'+i : ''+i))
    const minutes = Array.from({length:60}, (_,i)=> (i<10? '0'+i : ''+i))
    const curItem = (this.data.items||[]).find(x=>x.id===id)
    const cur = curItem ? curItem.startTimeText : '08:00'
    let idx=[8,0]
    if (cur) { const [hh,mm] = cur.split(':'); idx=[parseInt(hh,10)||8, parseInt(mm,10)||0] }
    this.setData({ showInlinePicker:true, hours, minutes, timeIndex: idx })
    this._pendingId = id
  },

  onInlineTimeChange(e){ this.setData({ timeIndex: e.detail.value }) },
  closeInlinePicker(){ this.setData({ showInlinePicker:false }) },
  async confirmInlineTime(){
    const [hIdx, mIdx] = this.data.timeIndex || [8,0]
    const hh = (hIdx<10? '0'+hIdx : ''+hIdx)
    const mm = (mIdx<10? '0'+mIdx : ''+mIdx)
    const date = this.data.selectedDate
    const start = `${date}T${hh}:${mm}:00`
    // 结束时间按原时长或默认+90分钟（这里用默认）
    const end = `${date}T${('0'+(parseInt(hh,10)+1)).slice(-2)}:${mm}:00`
    try{
      const res = await api.teacherSchedule.updateTime(this._pendingId,{ startTime:start, endTime:end })
      if (res && (res.success || res.code === 200)){
        wx.showToast({ title:'已修改', icon:'success' })
        this.setData({ showInlinePicker:false })
        await this.sendNotify(this._pendingId, start)
        this.loadDay()
      }else{
        const msg = res && (res.message || res.msg)
        wx.showToast({ title: msg || '修改失败', icon:'none' })
      }
    }catch(err){
      const msg = (err && (err.message || err.msg)) || (err && err.data && (err.data.message || err.data.msg)) || '修改失败'
      wx.showToast({ title: msg, icon:'none' })
    }
  },

  async sendNotify(scheduleId, startTime){
    // TODO: 真实家长/学生端接入后改为调用消息中心
    console.log('通知家长与学生：课程', scheduleId, '新的开始时间', startTime)
  },

  onEdit(e){
    const id = e.currentTarget.dataset.id
    const item = (this.data.items||[]).find(x=>x.id===id)
    const params = {
      id,
      date: this.data.selectedDate,
      title: item && item.raw && item.raw.title || '',
      studentCount: item && item.raw && item.raw.studentCount || 0,
      start: item && item.raw && item.raw.startTime || '',
      end: item && item.raw && item.raw.endTime || ''
    }
    wx.navigateTo({ url:`/pages/teacher/schedule-edit/schedule-edit?${Object.keys(params).map(k=>`${k}=${encodeURIComponent(params[k])}`).join('&')}` })
  },

  // 单次课程已并入学习计划（课时可设为1）
  onAddPlan(){ wx.navigateTo({ url:`/pages/teacher/schedule-plan/schedule-plan?date=${this.data.selectedDate}` }) }
})


