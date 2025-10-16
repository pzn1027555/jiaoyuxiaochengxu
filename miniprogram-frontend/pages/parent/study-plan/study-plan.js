const api = require('../../../utils/api')
const profileApi = require('../../../api/profile')

Page({
  data:{
    headerHeight:0,
    students:[],
    currentStudentId:null,
    entryRole:'parent',
    // 月历
    year:0, month:0, days:[], selectedDate:'',
    items:[],
    loading:false
  },
  onLoad(options={}){
    const now = new Date()
    this.setData({ year: now.getFullYear(), month: now.getMonth()+1 })
    this.buildMonth(now.getFullYear(), now.getMonth()+1)
    this.setSelected(this.dateToStr(now))
    const marker = (options.role || options.from || '').toLowerCase()
    const detectedRole = this.getRole()
    const entryRole = marker === 'student' ? 'student' : (marker === 'parent' ? 'parent' : (detectedRole === 'student' ? 'student' : 'parent'))
    this.setData({ entryRole })
    if(entryRole === 'student'){
      this.initForStudent()
    }else{
      this.loadStudents()
    }
  },
  onHeaderReady(e){ this.setData({ headerHeight: e.detail.totalHeight||0 }) },

  getRole(){
    try{
      const storageUserStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const storageUser = typeof storageUserStr === 'string' ? JSON.parse(storageUserStr) : storageUserStr
      return storageUser.role || storageUser?.student_info?.role || storageUser?.parent_info?.role || storageUser?.teacher_info?.role || ''
    }catch(e){
      return ''
    }
  },
  getCurrentStudentId(){
    try{
      const storageUserStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const storageUser = typeof storageUserStr === 'string' ? JSON.parse(storageUserStr) : storageUserStr
      if(storageUser.role === 'student'){
        return storageUser.id || storageUser.userId || storageUser.studentId || (storageUser.student_info && (storageUser.student_info.id || storageUser.student_info.studentId))
      }
      return null
    }catch(e){
      return null
    }
  },
  async initForStudent(){
    const studentId = this.getCurrentStudentId()
    if(!studentId){
      wx.showToast({ title:'未找到学生信息', icon:'none' })
      return
    }
    this.setData({ students:[], currentStudentId: studentId })
    await this.loadStudentProfile()
    this.loadSchedules(studentId)
  },
  async loadStudentProfile(){
    try{
      const res = await profileApi.getStudentProfile()
      if(res && (res.success || res.code===200) && res.data){
        const profile = res.data
        const currentId = profile.id || this.data.currentStudentId
        this.setData({
          currentStudentId: currentId,
          students:[{
            studentId: currentId,
            studentName: profile.name || '',
            studentAvatar: profile.avatar || '/images/workspace/default-avatar.png'
          }]
        })
      }else{
        const fallbackId = this.data.currentStudentId
        this.setData({ students:[{ studentId: fallbackId, studentName:'我的课程', studentAvatar:'/images/workspace/default-avatar.png' }] })
      }
    }catch(e){
      const fallbackId = this.data.currentStudentId
      this.setData({ students:[{ studentId: fallbackId, studentName:'我的课程', studentAvatar:'/images/workspace/default-avatar.png' }] })
    }
  },
  async loadStudents(){
    if(this.data.entryRole === 'student') return
    try{
      const res = await api.parent.getChildren()
      const rawList = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const list = rawList.map(item => {
        const studentId = item.studentId !== undefined ? item.studentId : (item.id !== undefined ? item.id : item.childId)
        return {
          ...item,
          studentId,
          studentName: item.studentName || item.name || item.childName || '',
          studentAvatar: item.studentAvatar || item.avatar || item.avatarFull || '',
          studentPhone: item.studentPhone || item.phone || ''
        }
      }).filter(it => it.studentId !== undefined && it.studentId !== null)
      const firstId = list.length ? list[0].studentId : null
      this.setData({ students:list, currentStudentId:firstId })
      if(firstId){ this.loadSchedules(firstId) }
    }catch(e){ this.setData({ students:[] }) }
  },

  async loadSchedules(studentId){
    this.setData({ loading:true, items:[] })
    try{
      const date = this.data.selectedDate
      const res = await api.studentSchedule.getDay({ studentId, date })
      const nextItems = []
      if(res && (res.success || res.code===200)){
        const arr = (res.data && res.data.items) || []
        arr.forEach(it=>{
          nextItems.push({
            id: it.id,
            title: it.title,
            lessonNo: it.lessonNumber,
            totalLessons: it.totalLessons,
            startTimeText: (it.startTime||'').replace('T',' ').slice(11,16),
            endTimeText: (it.endTime||'').replace('T',' ').slice(11,16),
            intro: it.intro||''
          })
        })
      }
      this.setData({ items: nextItems })
      // 标记哪些日期有课
      const days = (this.data.days||[]).map(d=>({ ...d, hasCourse: false }))
      if(res && res.data){
        if(Array.isArray(res.data.hasCourseDays)){
          const set = new Set(res.data.hasCourseDays.map(n=>Number(n)))
          days.forEach((d,idx)=>{ d.hasCourse = set.has(idx+1) })
        }
        else if(Array.isArray(res.data.items)){
          const daySet = new Set(res.data.items.map(it=>{
            const t = (it.startTime || it.start_time || '')
            if(!t) return null
            const datePart = String(t).split('T')[0] || ''
            const parts = datePart.split('-')
            if(parts.length!==3) return null
            return Number(parts[2])
          }).filter(v=>Number.isFinite(v)))
          days.forEach(d=>{ d.hasCourse = daySet.has(d.date) })
        }
      }
      this.setData({ days })
      this.refreshMonthIndicators()
    }catch(e){ this.setData({ items: [] }) }
    finally{ this.setData({ loading:false }) }
  },

  onPickStudent(e){
    const id = e.currentTarget.dataset.id
    if(!id || id===this.data.currentStudentId) return
    this.setData({ currentStudentId: id })
    this.loadSchedules(id)
  },

  // 月历逻辑（同 teacher/schedule & student/schedule-confirm）
  dateToStr(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` },
  buildMonth(year, month){
    const daysInMonth = new Date(year, month, 0).getDate()
    const todayStr = this.dateToStr(new Date())
    const res=[]
    for(let i=1;i<=daysInMonth;i++){
      const ds = `${year}-${('0'+month).slice(-2)}-${('0'+i).slice(-2)}`
      res.push({ date:i, isToday: ds===todayStr, selected:false, hasCourse:false })
    }
    this.setData({ days: res })
  },
  setSelected(dateStr){
    const d = new Date(dateStr.replace(/-/g,'/'))
    const day = d.getDate()
    const days = (this.data.days||[]).map((x,idx)=> ({ ...x, selected: (idx+1)===day }))
    this.setData({ days, selectedDate: dateStr })
  },
  prevMonth(){
    let {year,month}=this.data
    month--
    if(month===0){month=12;year--}
    this.setData({year,month})
    this.buildMonth(year,month)
    this.refreshMonthIndicators()
  },
  nextMonth(){
    let {year,month}=this.data
    month++
    if(month===13){month=1;year++}
    this.setData({year,month})
    this.buildMonth(year,month)
    this.refreshMonthIndicators()
  },
  async refreshMonthIndicators(){
    const { currentStudentId, year, month } = this.data
    if(!currentStudentId) return
    const promises = (this.data.days||[]).map(async (d, idx)=>{
      const ds = `${year}-${('0'+month).slice(-2)}-${('0'+d.date).slice(-2)}`
      try{
        const res = await api.studentSchedule.getDay({ studentId: currentStudentId, date: ds })
        const has = res && res.success && res.data && Array.isArray(res.data.items) && res.data.items.length>0
        const key = `days[${idx}].hasCourse`
        this.setData({ [key]: has })
      }catch(e){}
    })
    Promise.all(promises).catch(()=>{})
  },
  onSelectDay(e){ const idx=e.currentTarget.dataset.index; const d=idx+1; const y=this.data.year; const m=('0'+this.data.month).slice(-2); const da=('0'+d).slice(-2); const ds=`${y}-${m}-${da}`; this.setSelected(ds); if(this.data.currentStudentId){ this.loadSchedules(this.data.currentStudentId) } }
})


