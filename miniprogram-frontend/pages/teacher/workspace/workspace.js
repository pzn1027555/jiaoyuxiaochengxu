// pages/teacher/workspace/workspace.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')

Page({
  data: {
    weekDays: [],
    todayClasses: [],
    currentDate: '',
    loading: false,
    // 月历弹层
    showMonthPicker:false,
    year:0,
    month:0,
    monthDays:[] // {date:1.., hasCourse:boolean, selected:boolean}
  },

  onLoad() {
    console.log('教师工作台加载')
    this.initPage()
  },

  onShow() {
    const ui = require('../../../utils/auth').getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    this.checkAuth()
    this.loadData()
    // 设置TabBar选中状态（工作台是第0个）
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0)
    }
  },

  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 检查权限
  checkAuth() {
    const app = getApp()
    
    // 首先检查app.globalData
    if (app.globalData.isLogin && app.globalData.userRole === 'teacher') {
      console.log('教师已登录，继续页面操作')
      return true
    }
    
    // 备用检查：检查本地存储
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role === 'teacher') {
      console.log('从本地存储确认教师身份')
      return true
    }
    
    // 都没有则需要登录
    console.log('教师身份验证失败，跳转登录')
    wx.showToast({
      title: '请先登录教师账号',
      icon: 'none'
    })
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }, 2000)
    return false
  },

  // 初始化页面
  initPage() {
    const ui = require('../../../utils/auth').getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    if (!this.checkAuth()) return
    
    this.buildWeek(this.formatDate(new Date()))
    this.loadData()
  },

  // 生成一周日期并标注有课圆点（调用后端按天查询）
  async buildWeek(baseDateStr){
    const base = new Date(baseDateStr.replace(/-/g,'/'))
    const dayNames = ['周日','周一','周二','周三','周四','周五','周六']
    // 从周一开始的本周
    const monday = new Date(base)
    const w = monday.getDay() === 0 ? 7 : monday.getDay()
    monday.setDate(monday.getDate() - (w-1))
    const arr=[]
    for(let i=0;i<7;i++){
      const d=new Date(monday); d.setDate(monday.getDate()+i)
      const full = this.formatDate(d)
      arr.push({ date: full, day: `${d.getMonth()+1}.${d.getDate()}`, dayName: dayNames[d.getDay()], isSelected: full===baseDateStr, hasClass:false })
    }
    this.setData({ weekDays: arr, currentDate: baseDateStr })
    // 标注有课
    await Promise.all(arr.map(async (it, idx)=>{
      try{
        const res = await api.teacherSchedule.getDay({ date: it.date })
        const items = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []
        const key = `weekDays[${idx}].hasClass`
        this.setData({ [key]: items.length>0 })
      }catch(e){}
    }))
  },

  // 判断是否是同一天
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  },

  // 格式化日期
  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true })
    
    try {
      await this.loadTodayClasses()
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载今日/选中日期课程（从后端获取）
  async loadTodayClasses() {
    const res = await api.teacherSchedule.getDay({ date: this.data.currentDate || this.formatDate(new Date()) })
    const arr = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []
    const list = arr.map(it=>{
      const start = (it.startTime||'').replace('T',' ').slice(11,16)
      const end = (it.endTime||'').replace('T',' ').slice(11,16)
      const status = this.computeStatus(it.startTime, it.endTime)
      return {
        id: it.id,
        startTime: start,
        endTime: end,
        status: status.status,
        countdown: status.countdown,
        courseTitle: it.title,
        lessonNumber: it.lessonNumber || 1,
        totalLessons: it.totalLessons || 1,
        isLive: it.classType !== 'one_to_one'&&it.classType !== 'trial',
        classType: it.classType,
        coverUrl: it.coverUrl,
        // 封面：big_class 使用 coverUrl，其它类型使用固定封面
        coverFullUrl: it.classType === 'big_class' ? this.toAbsolute(it.coverUrl) : '/images/sijiaokecheng.jpeg',
        // 保留原始开始/结束时间用于排序和后续逻辑
        rawStartTime: it.startTime,
        rawEndTime: it.endTime
      }
    })
    // 按开始时间升序排序
    try{
      list.sort((a,b)=>{
        const ta = new Date(String(a.rawStartTime||'').replace('T',' ').replace(/-/g,'/')).getTime()
        const tb = new Date(String(b.rawStartTime||'').replace('T',' ').replace(/-/g,'/')).getTime()
        return ta - tb
      })
    }catch(e){}
    // 并行拉取详情拿到 studentIds，再映射头像与姓名
    const details = await Promise.all(list.map(it=> api.teacherSchedule.detail(it.id).catch(()=>({}))))
    // 取全部学生档案以便映射头像与姓名
    const studentApi = require('../../../api/student')
    const allRes = await studentApi.getAllStudents().catch(()=>null)
    const all = (allRes && (allRes.success===true || allRes.code===200) && Array.isArray(allRes.data)) ? allRes.data : []
    const id2 = {}
    const { getAvatarUrl } = require('../../../utils/urlUtils')
    all.forEach(s=>{ id2[String(s.id)] = { id:String(s.id), name:s.name, avatar: getAvatarUrl(s.avatar) } })
    // 并发补充学生与反馈状态
    const fbPromises = list.map(it=> api.teacherSchedule.getFeedback(it.id).catch(()=>null))
    list.forEach((it, idx)=>{
      const det = details[idx] && (details[idx].data || details[idx])
      const ids = det && det.studentIds ? det.studentIds : (det && det.data && Array.isArray(det.data.studentIds) ? det.data.studentIds : [])
      const students = ids.map(id=> id2[String(id)]).filter(Boolean)
      it.students = students
      it.displayStudents = it.classType==='big_class' ? students.slice(0,3) : students
    })
    const fbRes = await Promise.all(fbPromises)
    fbRes.forEach((r, i)=>{
      const has = r && (r.success || r.code===200) && r.data && r.data.hasFeedback
      list[i].hasFeedback = !!has
      list[i].feedbackContent = has ? r.data.content : ''
      // 结束后才可填写
      const now = Date.now()
      const endIso = list[i] && list[i].rawEndTime
      let canWrite = false
      try{ const [d,t] = String(endIso||'').split('T'); if(t){ const [h,m]=t.split(':'); const e=new Date(d.replace(/-/g,'/')+' '+h+':'+m+':00'); canWrite = now>e.getTime() } }catch(err){ canWrite=false }
      list[i].canWriteFeedback = canWrite && !list[i].hasFeedback
    })
    this.setData({ todayClasses: list })
  },

  computeStatus(startIso, endIso){
    try{
      const now = new Date()
      // 解析开始时间
      const [ds,ts] = String(startIso||'').split('T'); if(!ts) return { status:'pending', countdown:'' }
      const [hs,ms] = ts.split(':'); const sDate = new Date(ds.replace(/-/g,'/') + ' ' + hs+':'+ms+':00')
      // 解析结束时间（用于判断是否已结束，可填写反馈）
      let eDate = sDate
      if (endIso){
        const [de,te] = String(endIso||'').split('T')
        if (te){ const [he,me] = te.split(':'); eDate = new Date(de.replace(/-/g,'/') + ' ' + he+':'+me+':00') }
      }
      const diffToStart = sDate.getTime() - now.getTime()
      if (diffToStart > 0 && diffToStart <= 30*60*1000){
        const min = Math.ceil(diffToStart/60000)
        return { status:'pending', countdown: `${min}分钟后开课` }
      }
      if (now.getTime() > eDate.getTime()){
        return { status:'completed', countdown:'' }
      }
      return { status: now.getTime() >= sDate.getTime() ? 'in_progress' : 'pending', countdown:'' }
    }catch(e){ return { status:'pending', countdown:'' } }
  },

  toAbsolute(url){
    const { getCoverUrl } = require('../../../utils/urlUtils')
    return getCoverUrl(url)
  },

  // 日期点击
  onDateTap(e) {
    const date = e.currentTarget.dataset.date
    console.log('选择日期:', date)
    
    // 更新选中状态
    const weekDays = this.data.weekDays.map(item => ({
      ...item,
      isSelected: item.date === date
    }))
    
    this.setData({
      weekDays: weekDays,
      currentDate: date
    })
    
    this.loadTodayClasses()
  },

  // 打开日历
  openCalendar() {
    const today = new Date()
    this.setData({ year: today.getFullYear(), month: today.getMonth()+1, showMonthPicker:true }, ()=> this.buildMonthDays())
  },

  closeCalendar(){ this.setData({ showMonthPicker:false }) },

  buildMonthDays(){
    const { year, month } = this.data
    const first = new Date(year, month-1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const arr=[]
    for(let i=1;i<=daysInMonth;i++){ arr.push({ date:i, hasCourse:false, selected:false }) }
    // 标注有课（逐日查询）
    const promises = arr.map(async (d,idx)=>{
      const ds = `${year}-${('0'+month).slice(-2)}-${('0'+d.date).slice(-2)}`
      try{
        const res = await api.teacherSchedule.getDay({ date: ds })
        const items = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []
        const k = `monthDays[${idx}].hasCourse`
        this.setData({ [k]: items.length>0 })
      }catch(e){}
    })
    this.setData({ monthDays: arr })
    Promise.all(promises).then(()=>{})
  },

  prevMonth(){ let {year,month}=this.data; month--; if(month===0){month=12; year--} this.setData({year,month}, ()=> this.buildMonthDays()) },
  nextMonth(){ let {year,month}=this.data; month++; if(month===13){month=1; year++} this.setData({year,month}, ()=> this.buildMonthDays()) },
  onPickMonthDay(e){
    const d = e.currentTarget.dataset.d
    const ds = `${this.data.year}-${('0'+this.data.month).slice(-2)}-${('0'+d).slice(-2)}`
    this.setData({ showMonthPicker:false }, ()=>{ this.buildWeek(ds); this.loadTodayClasses() })
  },

  // 查看授课记录
  viewAllClasses() {
    wx.navigateTo({
      url: '/pages/teacher/teaching-records/teaching-records'
    })
  },

  // 处理请假申请
  handleLeaveRequest(e) {
    const { id, action } = e.currentTarget.dataset
    
    wx.showModal({
      title: action === 'approve' ? '同意请假' : '拒绝请假',
      content: action === 'approve' ? '确定同意学生的请假申请吗？' : '确定拒绝学生的请假申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.processLeaveRequest(id, action)
        }
      }
    })
  },

  // 处理请假申请
  async processLeaveRequest(classId, action) {
    try {
      wx.showLoading({ title: '处理中...' })
      
      // 这里调用API处理请假申请
      // await api.teacherPortal.handleLeaveRequest(classId, action)
      
      wx.hideLoading()
      wx.showToast({
        title: action === 'approve' ? '已同意请假' : '已拒绝请假',
        icon: 'success'
      })
      
      // 重新加载数据
      this.loadTodayClasses()
      
    } catch (error) {
      wx.hideLoading()
      console.error('处理请假申请失败:', error)
      wx.showToast({
        title: '处理失败',
        icon: 'none'
      })
    }
  },

  // 查看反馈
  viewFeedback(e) {
    const classId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/teacher/feedback/feedback?classId=${classId}`
    })
  },

  // 填写反馈
  writeFeedback(e) {
    const classId = e.currentTarget.dataset.id
    this.setData({ showFeedbackModal:true, fbView:false, fbCourseId: classId, fbContent:'' })
  },

  // 查看反馈
  viewFeedback(e){
    const classId = e.currentTarget.dataset.id
    const item = (this.data.todayClasses||[]).find(x=>x.id===classId)
    this.setData({ showFeedbackModal:true, fbView:true, fbCourseId: classId, fbContent: (item&&item.feedbackContent)||'' })
  },

  onFbInput(e){ this.setData({ fbContent: e.detail.value }) },
  closeFb(){ this.setData({ showFeedbackModal:false, fbContent:'', fbCourseId:null, fbView:false }) },
  async submitFb(){
    if (this.data.fbView){ this.closeFb(); return }
    const id = this.data.fbCourseId
    const txt = (this.data.fbContent||'').trim()
    if (!txt){ wx.showToast({ title:'请填写反馈内容', icon:'none' }); return }
    try{
      await api.teacherSchedule.submitFeedback(id, { content: txt })
      wx.showToast({ title:'已提交', icon:'success' })
      // 更新本地状态
      const arr = (this.data.todayClasses||[]).map(it=> it.id===id ? { ...it, hasFeedback:true, feedbackContent: txt } : it)
      this.setData({ todayClasses: arr })
      this.closeFb()
    }catch(e){ wx.showToast({ title:'提交失败', icon:'none' }) }
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '新文枢教育 - 教师工作台',
      path: '/pages/teacher/workspace/workspace'
    }
  }
})