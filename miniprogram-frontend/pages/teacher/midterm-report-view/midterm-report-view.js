// pages/teacher/midterm-report-view/midterm-report-view.js
Page({
  data: {
    // 课程ID
    courseId: '',
    
    // 报告数据
    reportData: {
      currentContent: '',
      studentPerformance: '',
      futurePlan: '',
      submitTime: '',
      teacherName: ''
    },
    
    // 加载状态
    loading: true,
    
    // 自定义导航栏高度
    headerHeight: 0
  },

  onLoad(options) {
    console.log('查看中期报告页面加载', options)
    
    if (options.courseId) {
      this.setData({
        courseId: options.courseId
      })
    }
    
    this.loadReportData()
  },

  // 自定义导航栏就绪回调
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({ 
      headerHeight: totalHeight
    })
  },

  // 加载报告数据
  async loadReportData() {
    try {
      this.setData({ loading: true })
      
      // 读取教师提交的反馈，过滤 midterm
      const api = require('../../../utils/api')
      const res = await api.teacherSchedule.getFeedback(this.data.courseId)
      let report = { currentContent:'', studentPerformance:'', futurePlan:'', submitTime:'', teacherName:'' }
      if (res && (res.success || res.code===200) && res.data && res.data.hasFeedback && (res.data.feedbackType==='midterm')){
        const content = String(res.data.content||'')
        // 尝试按写入格式拆分
        const seg = content.split('\n')
        const pick = (prefix)=>{
          const row = seg.find(s=> s.startsWith(prefix)) || ''
          return row.replace(prefix,'').trim()
        }
        report.currentContent = pick('【本期内容】')
        report.studentPerformance = pick('【学生表现】')
        report.futurePlan = pick('【后期计划】')
        report.submitTime = (res.data.createTime||'').toString().replace('T',' ').slice(0,16)
        report.teacherName = '' // 如需要可另行查询教师信息
      }
      this.setData({ reportData: report })
      
    } catch (error) {
      console.error('加载报告数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadReportData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '中期报告查看',
      path: `/pages/teacher/midterm-report-view/midterm-report-view?courseId=${this.data.courseId}`
    }
  }
})
