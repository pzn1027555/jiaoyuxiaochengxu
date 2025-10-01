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
      
      // TODO: 调用API获取报告数据
      // const reportData = await api.getMidtermReport(this.data.courseId)
      
      // 模拟报告数据
      const mockReportData = {
        currentContent: '本期课程主要讲解了微积分的基础概念，包括极限、导数和积分的定义与性质。学生们对极限的概念理解较好，能够运用极限的定义和性质解决简单的极限问题。在导数部分，大部分学生掌握了基本的求导法则，但在复合函数求导方面还需要加强练习。积分概念的理解相对较为困难，需要更多的实例和练习来巩固。',
        studentPerformance: '该学生在本期课程中表现积极，课堂参与度高，能够主动提问和回答问题。对于基础概念的理解能力较强，但在应用题的解题思路方面还需要进一步提升。作业完成质量良好，但偶尔会出现计算错误。建议在后续学习中加强计算练习，提高解题的准确性和速度。学生的学习态度认真，有较强的求知欲。',
        futurePlan: '后期将重点加强积分的应用练习，通过更多的实际例题帮助学生理解积分的几何意义和物理意义。计划安排专门的复合函数求导专题练习，提高学生在这方面的熟练度。同时会增加综合性应用题的训练，培养学生的分析和解决问题的能力。预计在下个月完成微积分基础部分的全部内容，并开始多元函数微积分的学习。',
        submitTime: '2025-01-17 15:30',
        teacherName: '张老师'
      }
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.setData({
        reportData: mockReportData
      })
      
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
