// pages/teacher/midterm-report-write/midterm-report-write.js
Page({
  data: {
    // 课程ID
    courseId: '',
    
    // 报告数据
    reportData: {
      currentContent: '',
      studentPerformance: '',
      futurePlan: ''
    },
    
    // 是否可以提交
    canSubmit: false,
    
    // 加载状态
    loading: false,
    submitting: false,
    
    // 自定义导航栏高度
    headerHeight: 0
  },

  onLoad(options) {
    console.log('填写中期报告页面加载', options)
    
    if (options.courseId) {
      this.setData({
        courseId: options.courseId
      })
    }
    
    this.loadCourseInfo()
    // 若有courseId参数，去查询后端并填充（存在则只读）
    if (this.data.courseId){ this.tryLoadExistingReport() }
  },

  // 自定义导航栏就绪回调
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({ 
      headerHeight: totalHeight
    })
  },

  // 加载课程信息
  async loadCourseInfo() {
    try {
      this.setData({ loading: true })
      
      // TODO: 调用API获取课程信息
      // const courseInfo = await api.getCourseInfo(this.data.courseId)
      
      // 模拟课程信息
      console.log('加载课程信息:', this.data.courseId)
      
    } catch (error) {
      console.error('加载课程信息失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 本期课程内容输入
  onCurrentContentInput(e) {
    const value = e.detail.value
    this.setData({
      'reportData.currentContent': value
    })
    this.checkCanSubmit()
  },

  // 学生表现输入
  onStudentPerformanceInput(e) {
    const value = e.detail.value
    this.setData({
      'reportData.studentPerformance': value
    })
    this.checkCanSubmit()
  },

  // 后期计划输入
  onFuturePlanInput(e) {
    const value = e.detail.value
    this.setData({
      'reportData.futurePlan': value
    })
    this.checkCanSubmit()
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { reportData } = this.data
    const canSubmit = reportData.currentContent.trim() !== '' &&
                     reportData.studentPerformance.trim() !== '' &&
                     reportData.futurePlan.trim() !== ''
    
    this.setData({ canSubmit })
  },

  // 提交报告
  async submitReport() {
    if (!this.data.canSubmit || this.data.submitting) {
      return
    }

    try {
      this.setData({ submitting: true })
      
      // 显示加载
      wx.showLoading({
        title: '提交中...',
        mask: true
      })

      // 对接教师排课反馈接口，标记为中期报告
      const api = require('../../../utils/api')
      const content = [
        `【本期内容】${this.data.reportData.currentContent}`,
        `【学生表现】${this.data.reportData.studentPerformance}`,
        `【后期计划】${this.data.reportData.futurePlan}`
      ].join('\n')
      await api.teacherSchedule.submitFeedback(this.data.courseId, { content, feedbackType: 'midterm' })

      // 轻微延迟以确保状态一致
      await new Promise(resolve => setTimeout(resolve, 400))
      
      wx.hideLoading()
      
      // 提交成功
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
      
    } catch (error) {
      wx.hideLoading()
      console.error('提交报告失败:', error)
      
      wx.showModal({
        title: '提交失败',
        content: '网络错误，请稍后重试',
        showCancel: false,
        confirmText: '确定'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回上一页
  goBack() {
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '提示',
        content: '您有未保存的内容，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 检查是否有未保存的更改
  hasUnsavedChanges() {
    const { reportData } = this.data
    return reportData.currentContent.trim() !== '' ||
           reportData.studentPerformance.trim() !== '' ||
           reportData.futurePlan.trim() !== ''
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '中期报告填写',
      path: `/pages/teacher/midterm-report-write/midterm-report-write?courseId=${this.data.courseId}`
    }
  }
  ,
  // 若已存在中期报告，填充并只读
  async tryLoadExistingReport(){
    try{
      const api = require('../../../utils/api')
      const res = await api.teacherSchedule.getFeedback(this.data.courseId)
      if (res && (res.success || res.code===200) && res.data && res.data.hasFeedback){
        const content = String(res.data.content||'')
        // 兼容不同换行符
        const seg = content.replace(/\r\n/g,'\n').split('\n')
        const pick = (p)=>{ const row = seg.find(s=> s.startsWith(p))||''; return row.replace(p,'').trim() }
        const reportData = {
          currentContent: pick('【本期内容】') || '',
          studentPerformance: pick('【学生表现】') || '',
          futurePlan: pick('【后期计划】') || ''
        }
        const isMidterm = String(res.data.feedbackType||'').toLowerCase()==='midterm'
        // midterm -> 只读；非 midterm 也回填，允许编辑与提交
        this.setData({ reportData, canSubmit: !isMidterm })
      }
    }catch(e){}
  }
})
