const api = require('../../../utils/api')
const studentApi = require('../../../api/student')
const courseCategoryApi = require('../../../api/courseCategory')

Page({
  data:{
    headerHeight:0,
    mode:'create', // create | edit
    id:null,
    date:'',
    form:{ title:'', totalLessons:null, subjectId:null, subjectName:'', startTime:'', endTime:'', durationMinutes:null, intro:'', remark:'', teachMode:'online', address:'', contactPhone:'' },
    students:[], // 已选学生（[{id,name,avatar}]）
    allStudents:[], // 可选学生
    selectedStudentIds:[],
    showStudentPicker:false,
    studentKeyword:'',
    timeText:'请选择',
    durationText:'请选择',
    filteredStudents:[],
    // 开始时间弹窗
    showTimePicker:false,
    hours:Array.from({length:24}, (_,i)=> (i<10? '0'+i : ''+i)),
    minutes:Array.from({length:60}, (_,i)=> (i<10? '0'+i : ''+i)),
    timeIndex:[8,0], // 默认08:00
    // 科目选择
    showSubjectPicker:false,
    subjectTree:[],
    // 班课专属
    coverUrl:'',
    coverFullUrl:'',
    tags:[],
    showTagInput:false,
    tempTag:''
  },
  onLoad(options){
    const { id, date, title, start, end } = options || {}
    const base = { mode: id? 'edit':'create', id: id||null, date: date||'' }
    if (title) base['form.title'] = decodeURIComponent(title)
    if (start) { base['form.startTime'] = start; base.timeText = (start||'').slice(11,16) }
    if (end) { base['form.endTime'] = end }
    this.setData(base)
    if (id) { this.loadDetail(id) }
    this.loadAllStudents()
    this.loadSubjects()
  },
  onHeaderReady(e){ this.setData({ headerHeight: e.detail.totalHeight||0 }) },

  async loadDetail(id){
    try{
      const res = await api.teacherSchedule.detail(id)
      if (res && res.success && res.data) {
        const detail = res.data
        const schedule = detail.schedule || detail
        this.setData({
          'form.title': schedule.title || '',
          'form.totalLessons': schedule.totalLessons || null,
          'form.subjectId': schedule.subjectId || null,
          'form.subjectName': schedule.subjectName || '',
          'form.startTime': schedule.startTime || '',
          'form.endTime': schedule.endTime || '',
          'form.classType': schedule.classType || '',
          'form.durationMinutes': schedule.durationMinutes || null,
          'form.intro': schedule.intro || '',
          'form.remark': schedule.remark || '',
          'form.teachMode': schedule.teachMode || 'online',
          'form.address': schedule.address || '',
          'form.contactPhone': schedule.contactPhone || '',
          timeText: (schedule.startTime||'').slice(11,16),
          durationText: typeof schedule.durationMinutes==='number' ? `${Math.floor(schedule.durationMinutes/60)}小时${schedule.durationMinutes%60}分` : '请选择',
          coverUrl: schedule.coverUrl || '',
          coverFullUrl: toAbsolute(schedule.coverUrl),
          tags: (typeof schedule.courseTags === 'string' ? JSON.parseSafe(schedule.courseTags) : (schedule.courseTags||[]))
        })
        
        // 加载并设置已选学生
        const studentIds = detail.studentIds || (Array.isArray(detail.students) ? detail.students.map(s=>s.id) : [])
        const studentsArr = detail.students || []
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
          // 等待allStudents加载完成后再设置选中的学生
          const waitForStudents = () => {
            if (this.data.allStudents && this.data.allStudents.length > 0) {
              const selectedStudents = this.data.allStudents.filter(s => 
                studentIds.includes(Number(s.id))
              )
              this.setData({ 
                students: selectedStudents.length ? selectedStudents : studentsArr.map(s=>({ id:String(s.id), name:s.name, avatar:toAbsolute(s.avatar) })),
                selectedStudentIds: studentIds.map(id => String(id))
              })
            } else {
              // 如果还没加载完，等待一下再试
              setTimeout(waitForStudents, 100)
            }
          }
          waitForStudents()
        }
      }
    }catch(e){ /* 静默 */ }
  },
  addTag(){ this.setData({ showTagInput:true, tempTag:'' }) },
  onTagInput(e){ this.setData({ tempTag: e.detail.value }) },
  confirmAddTag(){ const t=(this.data.tempTag||'').trim(); if(!t){ this.setData({ showTagInput:false }); return } const arr=(this.data.tags||[]).slice(); if(!arr.includes(t)) arr.push(t); this.setData({ tags: arr, showTagInput:false, tempTag:'' }) },
  removeTag(e){ const idx=Number(e.currentTarget.dataset.index||-1); if(idx<0) return; const arr=(this.data.tags||[]).slice(); arr.splice(idx,1); this.setData({ tags: arr }) },
  async pickCover(){ try{ const res = await wx.chooseImage({ count:1, sizeType:['compressed'], sourceType:['album','camera'] }); const filePath = res && res.tempFilePaths && res.tempFilePaths[0]; if(!filePath) return; wx.showLoading({ title:'上传中...' }); const up = await api.upload.image(filePath); wx.hideLoading(); const url = (up && up.data && (up.data.url || up.data.path)) || (up && up.url) || ''; if (url) { this.setData({ coverUrl:url, coverFullUrl: toAbsolute(url) }); wx.showToast({ title:'上传成功', icon:'success' }) } else { wx.showToast({ title:'上传失败', icon:'none' }) } }catch(err){ wx.hideLoading(); wx.showToast({ title:'上传失败', icon:'none' }) } },

  async loadAllStudents(){
    try{
      const res = await studentApi.getAllStudents()
      const list = (res && (res.success === true || res.code === 200) && Array.isArray(res.data)) ? res.data : []
      const mapped = list.map(s=>({ id: String(s.id), name: s.name, avatar: toAbsolute(s.avatar), phone: s.phone, grade: s.grade }))
      this.setData({ allStudents: mapped }, ()=> this.computeFiltered())
    }catch(e){ /* 静默 */ }
  },

  // 科目选择相关方法
  async loadSubjects(){
    try{
      const res = await courseCategoryApi.getCategoryTree()
      if(res && res.success && Array.isArray(res.data)){
        this.setData({ subjectTree: res.data })
      }
    }catch(e){
      console.error('加载科目失败', e)
    }
  },
  pickSubject(){
    this.setData({ showSubjectPicker: true })
  },
  closeSubjectPicker(){
    this.setData({ showSubjectPicker: false })
  },
  selectSubject(e){
    const { id, name } = e.currentTarget.dataset
    this.setData({ 
      'form.subjectId': id,
      'form.subjectName': name,
      showSubjectPicker: false
    })
  },
  pickTitle(){
    wx.showModal({
      title:'课程名称',
      editable:true,
      placeholderText:(this.data.form.title || '请输入课程名称'),
      content:(this.data.form.title || ''),
      success:(res)=>{ if(res.confirm) this.setData({ 'form.title':res.content }) }
    })
  },
  pickLessonCount(){
    const cur = this.data.form.totalLessons
    wx.showModal({
      title:'课时',
      editable:true,
      placeholderText: typeof cur==='number' ? String(cur) : '请输入课时数',
      content: typeof cur==='number' ? String(cur) : '',
      success:(res)=>{ const n=parseInt(res.content,10); if(!isNaN(n)) this.setData({ 'form.totalLessons':n }) }
    })
  },
  addStudent(){
    const selectedIds = (this.data.students || []).map(s => String(s.id))
    this.setData({ showStudentPicker:true, selectedStudentIds: selectedIds }, ()=> this.computeFiltered())
  },
  closeStudentPicker(){ this.setData({ showStudentPicker:false, studentKeyword:'' }) },
  onStudentKeyword(e){ this.setData({ studentKeyword: e.detail.value }); this.computeFiltered() },
  computeFiltered(){
    const { allStudents, studentKeyword, selectedStudentIds } = this.data
    const selectedSet = new Set((selectedStudentIds || []).map(x => String(x)))
    const source = !studentKeyword
      ? allStudents
      : allStudents.filter(s => (s.name||'').toLowerCase().includes(studentKeyword.trim().toLowerCase()) || (s.phone||'').toLowerCase().includes(studentKeyword.trim().toLowerCase()))
    const decorated = source.map(s => ({ ...s, checked: selectedSet.has(String(s.id)) }))
    this.setData({ filteredStudents: decorated })
  },
  toggleStudent(e){
    console.log(e)
    const rawId = e.currentTarget.dataset.id
    const id = rawId != null ? String(rawId) : ''
    if (!id) return
    const set = new Set((this.data.selectedStudentIds || []).map(x => String(x)))
    if (set.has(id)) set.delete(id); else set.add(id)
    this.setData({ selectedStudentIds: Array.from(set) }, () => this.computeFiltered())
  },
  confirmStudents(){
    const picked = this.data.allStudents.filter(s => this.data.selectedStudentIds.includes(String(s.id)))
    this.setData({ students: picked, showStudentPicker:false })
  },
  pickTime(){
    // 打开自定义开始时间弹窗（仅选择小时和分钟）
    const cur = this.data.timeText && this.data.timeText.includes(':') ? this.data.timeText : ''
    let idx = [8,0]
    if (cur) {
      const [hh, mm] = cur.split(':')
      idx = [Math.min(23, parseInt(hh||'0',10)||0), Math.min(59, parseInt(mm||'0',10)||0)]
    }
    this.setData({ showTimePicker:true, timeIndex: idx })
  },
  onTimeChange(e){
    // e.detail.value = [hIndex, mIndex]
    this.setData({ timeIndex: e.detail.value })
  },
  closeTimePicker(){ this.setData({ showTimePicker:false }) },
  confirmTime(){
    const [hIdx, mIdx] = this.data.timeIndex
    const hh = this.data.hours[hIdx] || '00'
    const mm = this.data.minutes[mIdx] || '00'
    const date = this.data.date || this.today()
    const start = `${date}T${hh}:${mm}:00`
    this.setData({ 'form.startTime': start, timeText: `${hh}:${mm}`, showTimePicker:false })
  },
  pickDuration(){
    const cur = this.data.form.durationMinutes
    wx.showModal({
      title:'时长(分钟)',
      editable:true,
      placeholderText: typeof cur==='number' ? String(cur) : '例如 90',
      content: typeof cur==='number' ? String(cur) : '',
      success:(res)=>{ const n=parseInt(res.content,10); if(!isNaN(n)) this.setData({ 'form.durationMinutes':n, durationText:`${Math.floor(n/60)}小时${n%60}分` }) }
    })
  },
  onIntro(e){ this.setData({ 'form.intro': e.detail.value }) },
  onRemark(e){ this.setData({ 'form.remark': e.detail.value }) },
  onTeachMode(e){ const val = e.detail && e.detail.value ? e.detail.value : 'offline'; this.setData({ 'form.teachMode': val }) },
  // 省市区选择（使用内置region选择器）
  onRegionChange(e){
    const regionArr = e.detail.value || []
    this.setData({ regionText: regionArr.join(' ') })
  },
  onDetailAddress(e){ this.setData({ detailAddress: e.detail.value }) },
  pickAddress(){ /* 保留占位 */ },
  pickPhone(){ wx.showModal({ title:'联系电话', editable:true, placeholderText:'请输入手机号', success:(res)=>{ if(res.confirm) this.setData({ 'form.contactPhone': res.content }) } }) },

  today(){ const d=new Date(); const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` },

  async onSubmit(){
    const payload = { ...this.data.form }
    payload.coverUrl = this.data.coverUrl || this.data.form.coverUrl || ''
    payload.tags = this.data.tags || []
    if (!payload.title) { wx.showToast({ title:'请完善课程名称', icon:'none' }); return }
    if (!payload.startTime) { wx.showToast({ title:'请设置上课时间', icon:'none' }); return }
    if (!payload.durationMinutes || isNaN(payload.durationMinutes)) { wx.showToast({ title:'请设置时长', icon:'none' }); return }
    // 由开始时间 + 时长 计算结束时间（后端仍需 endTime）
    const end = addMinutesToIso(payload.startTime, Number(payload.durationMinutes))
    payload.endTime = end
    if (payload.teachMode==='offline') {
      const addr = (this.data.regionText || '') + (this.data.detailAddress ? ' ' + this.data.detailAddress : '')
      payload.address = addr
      const seg = (this.data.regionText || '').split(' ')
      payload.province = seg[0] || ''
      payload.city = seg[1] || ''
      payload.district = seg[2] || ''
      payload.detailAddress = this.data.detailAddress || ''
    } else {
      payload.address = ''
    }
    payload.totalLessons = this.data.form.totalLessons || null
    payload.intro = this.data.form.intro || ''
    payload.studentCount = (this.data.students || []).length
    payload.studentIds = (this.data.students || []).map(s => Number(s.id))
    try{
      if (this.data.mode==='edit' && this.data.id) {
        const res = await api.teacherSchedule.update(this.data.id, payload)
        if (res && res.success === false) { throw new Error(res.message || '冲突') }
      } else {
        const res = await api.teacherSchedule.create(payload)
        if (res && res.success === false) { throw new Error(res.message || '冲突') }
        if (res && (res.success || res.code===200) && res.data && res.data.id) {
          this.setData({ id: res.data.id, mode:'edit' })
        }
      }
      wx.showToast({ title:'已保存', icon:'success' })
      setTimeout(()=>{ wx.navigateBack() }, 800)
    }catch(e){
      wx.showToast({ title: e && e.message ? e.message : '保存失败', icon:'none' })
    }
  },
  noop(){}
})

// 将相对路径转为可访问URL，并提供默认头像
function toAbsolute(url){
  const { getAvatarUrl } = require('../../../utils/urlUtils')
  return getAvatarUrl(url)
}

Page.prototype.toAbsolute = toAbsolute

// 计算ISO时间加分钟
function addMinutesToIso(iso, minutes){
  try{
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/)
    if (!m) return iso
    const y = parseInt(m[1],10), mo = parseInt(m[2],10)-1, d = parseInt(m[3],10)
    const hh = parseInt(m[4],10), mm = parseInt(m[5],10), ss = parseInt(m[6]||'0',10)
    const date = new Date(y, mo, d, hh, mm, ss)
    date.setMinutes(date.getMinutes() + (Number(minutes)||0))
    const yy = date.getFullYear()
    const mon = ('0'+(date.getMonth()+1)).slice(-2)
    const dd = ('0'+date.getDate()).slice(-2)
    const h2 = ('0'+date.getHours()).slice(-2)
    const m2 = ('0'+date.getMinutes()).slice(-2)
    const s2 = ('0'+date.getSeconds()).slice(-2)
    return `${yy}-${mon}-${dd}T${h2}:${m2}:${s2}`
  }catch(e){ return iso }
}


