// pages/teacher/teaching-records/teaching-records.js
const api = require('../../../utils/api')
Page({
  data: {
    // 选中的日期
    selectedDate: '',
    selectedYear: '2025',
    selectedMonth: '7',
    selectedDay: '10',
    
    // 课程列表
    courseList: [],
    
    // 加载状态
    loading: false,
    
    // 自定义导航栏高度
    headerHeight: 0,
    
    // 反馈弹窗相关
    showFeedbackModal: false,
    feedbackModalTitle: '',
    feedbackContent: '',
    tempFeedbackContent: '',
    currentCourseId: '',
    isViewMode: false
  },

  onLoad() {
    console.log('授课记录页面加载')
    this.initializePage()
  },

  onShow() {
    this.loadTeachingRecords()
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
    // 设置默认日期为今天
    const today = new Date()
    const selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    this.setData({
      selectedDate,
      selectedYear: today.getFullYear().toString(),
      selectedMonth: (today.getMonth() + 1).toString(),
      selectedDay: today.getDate().toString()
    })
  },

  // 日期选择变化（兼容 year/month/day 三个picker 的不同值格式）
  onDateChange(e) {
    const val = e.detail && e.detail.value ? String(e.detail.value) : ''
    if (!val) return
    let y = this.data.selectedYear
    let m = this.data.selectedMonth
    let d = this.data.selectedDay

    if (/^\d{4}$/.test(val)) {
      // 仅年份
      y = val
    } else if (/^\d{4}-\d{2}$/.test(val)) {
      // 年-月
      const [yy, mm] = val.split('-')
      y = yy
      m = String(parseInt(mm, 10))
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      // 年-月-日
      const [yy, mm, dd] = val.split('-')
      y = yy
      m = String(parseInt(mm, 10))
      d = String(parseInt(dd, 10))
    } else {
      // 兜底：尝试解析
      try {
        const t = new Date(val)
        if (!isNaN(t.getTime())) {
          y = String(t.getFullYear())
          m = String(t.getMonth() + 1)
          d = String(t.getDate())
        }
      } catch (_) {}
    }

    // 规范化月份与日期，确保有效
    const pad2 = (n)=> String(n).padStart(2,'0')
    const daysInMonth = (yy, mm)=> new Date(parseInt(yy,10), parseInt(mm,10), 0).getDate()
    const maxDay = daysInMonth(y, m)
    if (parseInt(d,10) > maxDay) d = String(maxDay)

    const selectedDate = `${y}-${pad2(m)}-${pad2(d)}`

    this.setData({
      selectedDate,
      selectedYear: y,
      selectedMonth: m,
      selectedDay: d
    })
    
    // 重新加载该日期的课程
    this.loadTeachingRecords()
  },

  // 加载授课记录
  async loadTeachingRecords() {
    try {
      this.setData({ loading: true })
      const res = await api.teacherSchedule.getDay({ date: this.data.selectedDate })
      const arr = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []
      const list = arr.map(it=>({
        id: it.id,
        startTime: (it.startTime||'').slice(11,16),
        endTime: (it.endTime||'').slice(11,16),
        courseName: it.title,
        currentLesson: it.lessonNumber || 1,
        totalLessons: it.totalLessons || 1,
        classType: it.classType,
        coverFullUrl: require('../../../utils/urlUtils').getCoverUrl(it.coverUrl)
      }))
      // 补学生头像（与首页逻辑一致）
      const detailRes = await Promise.all(list.map(x=> api.teacherSchedule.detail(x.id).catch(()=>null)))
      const studentApi = require('../../../api/student')
      const allRes = await studentApi.getAllStudents().catch(()=>null)
      const all = (allRes && (allRes.success===true || allRes.code===200) && Array.isArray(allRes.data)) ? allRes.data : []
      const id2 = {}; const avatarAbs = require('../../../utils/urlUtils').getAvatarUrl
      all.forEach(s=>{ id2[String(s.id)] = { id:String(s.id), name:s.name, avatar: avatarAbs(s.avatar) } })
      list.forEach((it, idx)=>{
        const det = detailRes[idx] && (detailRes[idx].data || detailRes[idx])
        const ids = det && det.studentIds ? det.studentIds : (det && det.data && Array.isArray(det.data.studentIds) ? det.data.studentIds : [])
        const students = ids.map(id=> id2[String(id)]).filter(Boolean)
        it.students = students
        it.displayStudents = it.classType==='big_class' ? students.slice(0,3) : students
        it.studentCount = students.length
      })
      // 查询反馈状态
      const fb = await Promise.all(list.map(x=> api.teacherSchedule.getFeedback(x.id).catch(()=>null)))
      fb.forEach((r, i)=>{
        const has = r && (r.success || r.code===200) && r.data && r.data.hasFeedback
        list[i].hasFeedback = !!has
        list[i].feedbackContent = has ? r.data.content : ''
        // 结束后才可填写
        const endIso = arr[i] && arr[i].endTime
        let canWrite = false
        try{ const [d,t] = String(endIso||'').split('T'); if(t){ const [h,m]=t.split(':'); const e=new Date(d.replace(/-/g,'/')+' '+h+':'+m+':00'); canWrite = Date.now()>e.getTime() } }catch(err){ canWrite=false }
        list[i].canWriteFeedback = canWrite && !list[i].hasFeedback
      })
      this.setData({ courseList: list })
      
    } catch (error) {
      console.error('加载授课记录失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 填写反馈
  writeFeedback(e) {
    const courseId = e.currentTarget.dataset.courseId
    this.setData({ showFeedbackModal:true, feedbackModalTitle:'填写反馈', feedbackContent:'', tempFeedbackContent:'', currentCourseId: courseId, isViewMode:false })
  },

  // 查看反馈
  viewFeedback(e) {
    const courseId = e.currentTarget.dataset.courseId
    const item = (this.data.courseList||[]).find(x=>x.id===courseId)
    const content = item && item.feedbackContent || ''
    this.setData({ showFeedbackModal:true, feedbackModalTitle:'查看反馈', feedbackContent:content, tempFeedbackContent:content, currentCourseId: courseId, isViewMode:true })
  },

  // 填写中期报告
  writeMidtermReport(e) {
    const courseId = e.currentTarget.dataset.courseId
    console.log('填写中期报告:', courseId)
    
    wx.navigateTo({
      url: `/pages/teacher/midterm-report-write/midterm-report-write?courseId=${courseId}`
    })
  },

  // 查看中期报告
  viewMidtermReport(e) {
    const courseId = e.currentTarget.dataset.courseId
    console.log('查看中期报告:', courseId)
    
    wx.navigateTo({
      url: `/pages/teacher/midterm-report-view/midterm-report-view?courseId=${courseId}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTeachingRecords().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 反馈内容输入
  onFeedbackInput(e) {
    this.setData({
      tempFeedbackContent: e.detail.value
    })
  },

  // 关闭反馈弹窗
  hideFeedbackModal() {
    this.setData({
      showFeedbackModal: false,
      feedbackContent: '',
      tempFeedbackContent: '',
      currentCourseId: '',
      isViewMode: false
    })
  },

  // 确认提交反馈
  async confirmFeedback() {
    if (!this.data.isViewMode) {
      // 填写模式
      if (!this.data.tempFeedbackContent.trim()) {
        wx.showToast({
          title: '请填写反馈内容',
          icon: 'none'
        })
        return
      }

      try {
        // 显示加载
        wx.showLoading({
          title: '提交中...',
          mask: true
        })

        await api.teacherSchedule.submitFeedback(this.data.currentCourseId, { content: this.data.tempFeedbackContent })

        // 模拟提交延迟
        await new Promise(resolve => setTimeout(resolve, 1500))

        wx.hideLoading()
        
        // 提交成功
        wx.showToast({
          title: '反馈提交成功',
          icon: 'success'
        })

        // 更新课程列表状态
        this.updateCourseStatus(this.data.currentCourseId, 'feedback_submitted', this.data.tempFeedbackContent)
        
        // 关闭弹窗
        this.hideFeedbackModal()
        
      } catch (error) {
        wx.hideLoading()
        console.error('提交反馈失败:', error)
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    } else {
      // 查看模式，直接关闭
      this.hideFeedbackModal()
    }
  },

  // 更新课程状态
  updateCourseStatus(courseId, status, content) {
    const courseList = this.data.courseList.map(course => {
      if (course.id == courseId) {
        return {
          ...course,
          hasFeedback: true,
          feedbackContent: content || course.feedbackContent
        }
      }
      return course
    })
    
    this.setData({ courseList })
  },

  // 防止弹窗背景点击关闭
  preventClose() {
    // 空方法，阻止事件冒泡
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '授课记录',
      path: '/pages/teacher/teaching-records/teaching-records'
    }
  }
})
