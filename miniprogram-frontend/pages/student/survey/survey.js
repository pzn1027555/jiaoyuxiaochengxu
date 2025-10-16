// pages/student/survey/survey.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')

Page({
  data:{
    headerHeight:0,
    readonly:true,
    teacherId: null,
    bookingData: null, // 接收预约数据
    parents: [],
    selectedParent: null,
    showParentPicker: false,
    isStudent: false, // 是否为学生身份
    // 3、4、5、6 预设选项（下拉）
    grades:['一年级','二年级','三年级','四年级','五年级','六年级','初一','初二','初三','高一','高二','高三'],
    subjects:[],
    levels:['零基础','薄弱','一般','良好','优秀'],
    gradeIndex:0, levelIndex:0,
    showSubjectPicker:false,
    subjectTree:[],
    form:{ name:'', gender:1, grade:'', subjectId:null, subjectName:'', level:'', wish:'' },
    files:[]
  },
  onLoad(options){
    const readonly = String(options && options.readonly) === '1'
    const studentId = options && options.studentId ? options.studentId : ''
    const teacherId = options && options.teacherId ? options.teacherId : null
    
    // 接收预约数据
    let bookingData = null
    if (options && options.bookingData) {
      try {
        bookingData = JSON.parse(decodeURIComponent(options.bookingData))
        console.log('接收到预约数据:', bookingData)
      } catch (e) {
        console.error('解析预约数据失败:', e)
      }
    }
    
    // 检查用户身份，只有学生才显示家长代付
    const isStudent = auth.isStudent()
    
    this.setData({ readonly, teacherId, bookingData, isStudent })

    // 加载科目分类
    this.loadSubjectCategories()
    
    if (studentId){
      this.loadSurvey(studentId)
    } else if (options && options.data){
      // 兜底：本地预览
      let preset = {}
      try{ preset = JSON.parse(decodeURIComponent(options.data)) || {} }catch(e){}
      this.setData({ form: { ...this.data.form, ...preset } })
    }
  },

  async loadSubjectCategories(){
    try{
      const courseCategoryApi = require('../../../api/courseCategory')
      const res = await courseCategoryApi.getCategoryTree()
      const tree = (res && (res.success || res.code===200) && Array.isArray(res.data)) ? res.data : []
      this.setData({ subjectTree: tree })
      this.syncSubjectDisplay(this.data.form.subjectId, this.data.form.subjectName)
    }catch(e){
      this.setData({ subjectTree: [] })
    }
  },

  async loadSurvey(studentId){
    try{
      const res = await api.survey.getByStudent(studentId)
      if(res && res.success){
        const data = (res.data && res.data.data) || {}
        const merged = { ...this.data.form, ...(data||{}) }
        this.setData({ form: merged })
        this.syncSubjectDisplay(merged.subjectId, merged.subjectName)
      }
    }catch(e){}
  },
  onHeaderReady(e){ this.setData({ headerHeight: e.detail.totalHeight||0 }) },
  onNameInput(e){ this.setData({ 'form.name': (e.detail.value||'').trim() }) },
  onWishInput(e){ this.setData({ 'form.wish': (e.detail.value||'').trim() }) },
  onGender(e){ this.setData({ 'form.gender': Number(e.detail.value) }) },
  onGrade(e){ const i=Number(e.detail.value); this.setData({ gradeIndex:i, 'form.grade': this.data.grades[i] }) },
  openSubjectPicker(){ this.setData({ showSubjectPicker:true }) },
  closeSubjectPicker(){ this.setData({ showSubjectPicker:false }) },
  onSubjectConfirm(e){
    const value = e.detail && e.detail.value ? e.detail.value : []
    const first = value[0]
    if(first){
      const display = first.parentName ? `${first.parentName} - ${first.name}` : first.name
      this.setData({
        'form.subjectId': first.id,
        // 页面展示用 name，提交仍用 subjectId
        'form.subjectName': display,
        showSubjectPicker:false
      })
    } else {
      this.setData({ showSubjectPicker:false })
    }
  },
  onSubjectCancel(){ this.closeSubjectPicker() },
  syncSubjectDisplay(subjectId, subjectName){
    if(!subjectId){
      this.setData({ 'form.subjectId': null, 'form.subjectName': '' })
      return
    }
    const { subjectTree } = this.data
    let display = subjectName || ''
    if (!display) {
      subjectTree.forEach(level1 => {
        (level1.children||[]).forEach(level2 => {
          if(String(level2.id) === String(subjectId)){
            display = `${level1.name} - ${level2.name}`
          }
        })
      })
    }
    this.setData({ 'form.subjectId': subjectId, 'form.subjectName': display })
  },
  onLevel(e){ const i=Number(e.detail.value); this.setData({ levelIndex:i, 'form.level': this.data.levels[i] }) },
  // 参考 resources 页的上传体验：多文件添加、列表展示、删除
  async onUpload(){
    try{
      const choose = await wx.chooseMessageFile({ count: 5, type: 'file' })
      const files = choose.tempFiles || []
      const api = require('../../../utils/api')
      wx.showLoading({ title:'上传中...' })
      const uploaded = []
      for (const f of files){
        try{
          const r = await api.upload.file(f.path)
          if (r && (r.success || r.code==200)){
            const url = (r.data && (r.data.url||r.data)) || ''
            uploaded.push({ name: f.name || '文件', url })
          }
        }catch(err){}
      }
      wx.hideLoading()
      if(uploaded.length){ this.setData({ files: (this.data.files||[]).concat(uploaded) }) }
    }catch(e){}
  },
  removeFile(e){
    const url = e.currentTarget.dataset.url
    const next = (this.data.files||[]).filter(x=>x.url!==url)
    this.setData({ files: next })
  },
  // 注意：此方法已不再使用，因为学生端只有家长代付功能
  // 家长代付已包含：创建订单 + 创建预约课程信息 + 提交调查问卷
  async onSubmit(){
    try{
      // 必填校验：姓名、性别、年级、体系、学科、水平、愿望
      const f = this.data.form || {}
      if(!f.name || !String(f.name).trim()){ wx.showToast({ title:'请填写姓名', icon:'none' }); return }
      if(!f.gender){ wx.showToast({ title:'请选择性别', icon:'none' }); return }
      if(!f.grade){ wx.showToast({ title:'请选择年级', icon:'none' }); return }
      if(!f.subjectId){ wx.showToast({ title:'请选择学科', icon:'none' }); return }
      if(!f.level){ wx.showToast({ title:'请选择水平', icon:'none' }); return }
      if(!f.wish || !String(f.wish).trim()){ wx.showToast({ title:'请填写想讲解的内容', icon:'none' }); return }
      
      // 如果有预约数据，使用新接口同时创建预约和问卷明细
      if (this.data.bookingData) {
        const payload = { 
          teacherId: this.data.teacherId, 
          surveyData: this.data.form, 
          files: this.data.files,
          bookingData: this.data.bookingData
        }
        const res = await api.survey.createBookingWithDetail(payload)
        if(res && res.success){ 
          wx.showToast({ title:'已提交', icon:'success' }); 
          this.setData({ readonly: true }) 
        }
      } else {
        // 原有逻辑：仅创建问卷明细
        const payload = { teacherId: this.data.teacherId, data: this.data.form, files: this.data.files }
        const res = await api.survey.createDetail(payload)
        if(res && res.success){ wx.showToast({ title:'已提交', icon:'success' }); this.setData({ readonly: true }) }
      }
    }catch(e){ wx.showToast({ title:'提交失败', icon:'none' }) }
  },
  async goParentPay(){
    try{
      // 先本地必填校验（不立刻提交，等选家长后统一提交+发起代付）
      const f = this.data.form || {}
      if(!f.name || !String(f.name).trim()){ wx.showToast({ title:'请填写姓名', icon:'none' }); return }
      if(!f.gender){ wx.showToast({ title:'请选择性别', icon:'none' }); return }
      if(!f.grade){ wx.showToast({ title:'请选择年级', icon:'none' }); return }
      if(!f.subjectId){ wx.showToast({ title:'请选择学科', icon:'none' }); return }
      if(!f.level){ wx.showToast({ title:'请选择水平', icon:'none' }); return }
      if(!f.wish || !String(f.wish).trim()){ wx.showToast({ title:'请填写想讲解的内容', icon:'none' }); return }
      // 拉取家长列表
      const request = require('../../../utils/request.js')
      const res = await request.get('/mini/parent/bind-list')
      if(res && res.success){
        const parents = res.data || []
        if(parents.length === 0){
          wx.showModal({
            title: '提示',
            content: '请先到我的-家长绑定中绑定家长',
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        const primary = parents.find(p=>p.isPrimary===1)
        this.setData({ parents, selectedParent: primary || (parents[0]||null), showParentPicker: true })
      } else {
        wx.showModal({
          title: '提示',
          content: '请先到我的-家长绑定中绑定家长',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    }catch(e){ wx.showToast({ title:'加载家长失败', icon:'none' }) }
  },
  hideParentPicker(){ this.setData({ showParentPicker:false }) },
  async selectParent(e){
    const parentId = e.currentTarget.dataset.parentid
    const parent = (this.data.parents||[]).find(p=>p.parentId===parentId)
    if(!parent) return
    this.setData({ selectedParent: parent, showParentPicker:false })
    try{
      // 1) 先提交问卷（如果有预约数据，同时创建预约和问卷明细）
      wx.showLoading({ title:'提交中...' })
      
      let saveRes
      if (this.data.bookingData) {
        // 有预约数据：同时创建预约和问卷明细
        const payload = { 
          teacherId: this.data.teacherId, 
          surveyData: this.data.form, 
          files: this.data.files,
          bookingData: this.data.bookingData
        }
        saveRes = await api.survey.createBookingWithDetail(payload)
      } else {
        // 无预约数据：仅创建问卷明细
        const payload = { teacherId: this.data.teacherId, data: this.data.form, files: this.data.files }
        saveRes = await api.survey.save(payload)
      }
      
      if(!(saveRes && saveRes.success)){ throw new Error(saveRes && saveRes.message || '提交失败') }
      wx.hideLoading()
      
      // 2) 根据课程类型决定后续流程
      const bookingType = this.data.bookingData && this.data.bookingData.bookingType
      if (bookingType === 'formal') {
        // 正式课：发起预约通知给教师，不需要家长代付
        wx.showModal({
          title: '问卷提交成功',
          content: '您的问卷已提交，预约通知已发送给教师，请等待教师确认。教师同意后可以排学习计划。',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      } else {
        // 试听课：发起家长代付
        const surveyId = saveRes.data && saveRes.data.surveyId
        await this.sendParentPay(parent, surveyId)
        // 回退到上一个页面
        setTimeout(()=>{ try{ wx.navigateBack() }catch(e){} }, 1400)
      }
    }catch(err){ wx.hideLoading(); wx.showToast({ title: err.message || '提交失败', icon:'none' }) }
  },
  async sendParentPay(parent, surveyId){
    try{
      const api = require('../../../utils/api')
      const r = await api.order.create({
        teacherId: parseInt(this.data.teacherId||0),
        courseName: '试听预约',
        courseType: 'trial',
        lessonCount: 1,
        unitPrice:  Number(9.9),
        totalAmount: Number(9.9),
        actualAmount: Number(9.9),
        paymentMethod: 'wechat',
        surveyId: surveyId, // 传递surveyId
        remark: JSON.stringify({ orderType:'trial_booking', parentId: parent.parentId })
      })
      if(r && r.success){ wx.showToast({ title:'已通知家长付款', icon:'success' }) }
      else{ wx.showToast({ title:(r&&r.message)||'创建代付订单失败', icon:'none' }) }
    }catch(e){ wx.showToast({ title:'网络错误', icon:'none' }) }
  }
})


