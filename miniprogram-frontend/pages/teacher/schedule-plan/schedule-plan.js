const api = require('../../../utils/api')
const studentApi = require('../../../api/student')
const courseCategoryApi = require('../../../api/courseCategory')

Page({
  data:{
    headerHeight:0,
    date:'',
    form:{
      title:'',
      totalLessons:null,
      subjectId:null,
      subjectName:'',
      startDate:'',
      startTime:'',
      durationMinutes:120,
      repeatType:'daily',
      customDates:[], // 自定义从第2期开始的日期数组（不含第1期）
      teachMode:'online',
      classType:'one_to_one',
      coverUrl:'',
      tags:[],
      // 价格不再由前端填写，后端按统一配置价计算
      intro:''
    },
    dateText:'请选择',
    timeText:'9:00',
    durationText:'2小时',
    // 学生选择
    students:[],
    allStudents:[],
    selectedStudentIds:[],
    showStudentPicker:false,
    studentKeyword:'',
    filteredStudents:[],
    coverFullUrl:'',
    showTimePicker:false,
    hours:Array.from({length:24}, (_,i)=> (i<10? '0'+i : ''+i)),
    minutes:Array.from({length:60}, (_,i)=> (i<10? '0'+i : ''+i)),
    timeIndex:[9,0],
    // 科目选择
    showSubjectPicker:false,
    subjectTree:[],
    // 标签输入弹窗
    showTagInput:false,
    tempTag:''
  },
  addTag(){ this.setData({ showTagInput:true, tempTag:'' }) },
  removeTag(e){ const idx=Number(e.currentTarget.dataset.index||-1); if(idx<0) return; const arr=(this.data.form.tags||[]).slice(); arr.splice(idx,1); this.setData({ 'form.tags': arr }) },
  onTagInput(e){ this.setData({ tempTag: e.detail.value }) },
  confirmAddTag(){ const t=(this.data.tempTag||'').trim(); if(!t){ this.setData({ showTagInput:false }); return } const arr=(this.data.form.tags||[]).slice(); if(!arr.includes(t)) arr.push(t); this.setData({ 'form.tags': arr, showTagInput:false, tempTag:'' }) },
  onLoad(options){
    const { date, students } = options || {}
    const baseDate = date || this.today()
    const preset = (()=>{ try{ if(students){ const arr = JSON.parse(decodeURIComponent(students)); if(Array.isArray(arr)) return arr } }catch(e){} return [] })()
    this.setData({ date: baseDate, 'form.startDate': baseDate, dateText: baseDate, 'form.startTime': '09:00', students: preset })
    this.loadAllStudents()
    this.loadSubjects()
    // 统一价格后，此页不再展示价格输入，仅供后端按配置计算
  },
  
  async loadAllStudents(){
    try{
      const res = await studentApi.getAllStudents()
      const list = (res && (res.success === true || res.code === 200) && Array.isArray(res.data)) ? res.data : []
      const mapped = list.map(s=>({ id: String(s.id), name: s.name, avatar: s.avatar, phone: s.phone, grade: s.grade }))
      this.setData({ allStudents: mapped }, ()=> this.computeFiltered())
    }catch(e){}
  },
  // 将相对路径转为带域名可访问URL
  toAbsolute(url){
    const { toAbsolute } = require('../../../utils/urlUtils')
    return toAbsolute(url, 'static')
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
    wx.showModal({ title:'课程名称', editable:true, placeholderText:'请输入课程名称', content:this.data.form.title||'', success:(res)=>{ if(res.confirm) this.setData({ 'form.title': res.content }) } })
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
    const rawId = e.currentTarget.dataset.id
    const id = rawId != null ? String(rawId) : ''
    if (!id) return
    const set = new Set((this.data.selectedStudentIds || []).map(x => String(x)))
    const isOneToOne = this.data.form.classType === 'one_to_one'
    if (set.has(id)) {
      set.delete(id)
    } else {
      if (isOneToOne) {
        // 1对1：始终只保留一个
        this.setData({ selectedStudentIds: [id] }, () => this.computeFiltered())
        return
      } else {
        set.add(id)
      }
    }
    this.setData({ selectedStudentIds: Array.from(set) }, () => this.computeFiltered())
  },
  confirmStudents(){
    let picked = this.data.allStudents.filter(s => this.data.selectedStudentIds.includes(String(s.id)))
    // 1对1：必须且仅能1人；班课：可0人或多人
    if (this.data.form.classType === 'one_to_one') {
      if (picked.length === 0) {
        wx.showToast({ title:'请选择1位学生', icon:'none' }); return
      }
      if (picked.length > 1) {
        picked = picked.slice(0,1)
        wx.showToast({ title:'1对1仅能选择1位学生', icon:'none' })
      }
    }
    this.setData({ students: picked, showStudentPicker:false, selectedStudentIds: picked.map(s=>String(s.id)) })
  },
  onIntro(e){ this.setData({ 'form.intro': e.detail.value }) },
  // 小程序仅支持1对1，固定 classType
  onClassType(e){ this.setData({ 'form.classType': 'one_to_one' }) },
  async pickCover(){
    try{
      const res = await wx.chooseImage({ count:1, sizeType:['compressed'], sourceType:['album','camera'] })
      const filePath = res && res.tempFilePaths && res.tempFilePaths[0]
      if (!filePath) return
      wx.showLoading({ title:'上传中...' })
      const up = await api.upload.image(filePath)
      wx.hideLoading()
      const url = (up && up.data && (up.data.url || up.data.path)) || (up && up.url) || ''
      if (url) { this.setData({ 'form.coverUrl': url, coverFullUrl: this.toAbsolute(url) }); wx.showToast({ title:'上传成功', icon:'success' }) }
      else { wx.showToast({ title:'上传失败', icon:'none' }) }
    }catch(err){ wx.hideLoading(); wx.showToast({ title:'上传失败', icon:'none' }) }
  },
  onHeaderReady(e){ this.setData({ headerHeight: e.detail.totalHeight||0 }) },
  onStartDateChange(e){ const v = e.detail.value; this.setData({ dateText: v, 'form.startDate': v }) },
  pickTime(){
    this.setData({ showTimePicker:true })
  },
  onTimeChange(e){ this.setData({ timeIndex: e.detail.value }) },
  closeTimePicker(){ this.setData({ showTimePicker:false }) },
  confirmTime(){
    const [hIdx, mIdx] = this.data.timeIndex
    const hh = this.data.hours[hIdx] || '09'
    const mm = this.data.minutes[mIdx] || '00'
    this.setData({ timeText: `${hh}:${mm}`, 'form.startTime': `${hh}:${mm}`, showTimePicker:false })
  },
  pickDuration(){
    const cur = this.data.form.durationMinutes
    wx.showModal({ title:'时长(分钟)', editable:true, placeholderText: String(cur||90), content: String(cur||90), success:(res)=>{
      const n = parseInt(res.content,10); if(!isNaN(n)){ this.setData({ 'form.durationMinutes': n, durationText:`${Math.floor(n/60)}小时${n%60}分` }) }
    }})
  },
  pickLessons(){
    const cur = this.data.form.totalLessons
    wx.showModal({ title:'课时', editable:true, placeholderText: String(cur||2), content: cur? String(cur):'', success:(res)=>{
      const n = parseInt(res.content,10); 
      if(!isNaN(n)){
        this.setData({ 'form.totalLessons': n })
        if (this.data.form.repeatType === 'custom'){
          this.recomputeCustomDates(n)
        }
      }
    }})
  },
  pickLessonPrice(){
    const cur = this.data.form.lessonPrice
    wx.showModal({ title:'每节课费用(元/课时)', editable:true, placeholderText: String(cur||''), content: cur? String(cur):'', success:(res)=>{
      const v = res.content
      if(v!=null){ this.setData({ 'form.lessonPrice': v }) }
    }})
  },
  recomputeCustomDates(n){
    const old = (this.data.form.customDates || []).slice()
    const need = Math.max(0, Number(n||0) - 1)
    const next = Array.from({length: need}, (_,i)=> old[i] || '')
    this.setData({ 'form.customDates': next })
  },
  onRepeat(e){ 
    const v = e.currentTarget.dataset.val; 
    const total = Number(this.data.form.totalLessons||0)
    if (v === 'custom'){
      this.setData({ 'form.repeatType': v }, ()=> this.recomputeCustomDates(total))
    } else {
      this.setData({ 'form.repeatType': v })
    }
  },
  pickCustomDate(){},
  onCustomDateChange(e){
    const idx = Number(e.currentTarget.dataset.index||0)
    const value = e.detail.value
    const arr = (this.data.form.customDates||[]).slice()
    arr[idx] = value
    this.setData({ 'form.customDates': arr })
  },
  today(){ const d=new Date(); const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` },
  async onSubmit(){
    const p = { ...this.data.form }
    const students = this.data.students || []
    
    // 验证必填字段
    if (!p.title){ wx.showToast({ title:'请填写课程名称', icon:'none' }); return }
    if (!p.totalLessons){ wx.showToast({ title:'请填写课时', icon:'none' }); return }
    // 费用按后端统一配置价计算
    if (p.classType === 'one_to_one'){
      if (students.length === 0){ wx.showToast({ title:'请选择学生', icon:'none' }); return }
      if (students.length > 1){ wx.showToast({ title:'1对1仅能选择1位学生', icon:'none' }); return }
    }
    
    const studentId = p.classType === 'one_to_one' ? Number(students[0].id) : null
    // 不再校验前端价格

    try{
      // 调用新的学习计划创建接口
      const studyPlanData = {
        studentId: studentId, // 班课为 null
        title: p.title,
        totalLessons: p.totalLessons,
        subjectId: p.subjectId,
        subjectName: p.subjectName,
        startDate: p.startDate,
        startTime: p.startTime,
        durationMinutes: p.durationMinutes,
        repeatType: p.repeatType,
        classType: p.classType,
        teachMode: p.teachMode,
        coverUrl: p.coverUrl,
        tags: JSON.stringify(p.tags||[]),
        intro: p.intro
      }
      
      const res = await api.studyPlan.create(studyPlanData)
      if (res && (res.success || res.code===200)){
        try{ const app = getApp(); if(app && app.globalData){ app.globalData.bookingUpdated = true } }catch(e){}
        wx.showToast({ title:'学习计划创建成功', icon:'success' })
        setTimeout(()=>{ wx.navigateBack() }, 800)
      } else {
        wx.showToast({ title:(res && res.message) || '创建失败', icon:'none' })
      }
    }catch(e){ 
      console.error('创建学习计划失败', e)
      wx.showToast({ title:(e && e.message) || '创建失败', icon:'none' }) 
    }
  }
})


