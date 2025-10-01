// pages/teacher/my-students/my-students.js
const studentApi = require('../../../api/student')
const subjectApi = require('../../../api/subject')

Page({
  data: {
    // 自定义导航栏高度
    headerHeight: 0,
    
    // 筛选相关
    studentNameFilter: '',
    subjectFilter: '全部科目',
    subjectOptions: ['全部科目'], // 科目选项
    selectedSubjectIndex: 0,
    subjectCategories: [], // 科目分类数据
    
    // 学生数据
    allStudents: [],
    filteredStudents: [],
    
    // 统计信息
    statistics: {
      totalStudents: 0,
      monthlyHours: 0,
      activeStudents: 0
    },
    
    // 加载状态
    loading: false,
    hasMore: true
  },

  onLoad() {
    console.log('我的学生页面加载')
    this.loadSubjectCategories()
    this.loadStudentData().then(() => {
      this.hasLoaded = true
    })
  },

  onShow() {
    // 避免重复加载：仅在有显式更新标记时刷新
    const app = getApp()
    if (app && app.globalData && app.globalData.studentsUpdated) {
      app.globalData.studentsUpdated = false
      this.loadStudentData()
    }
  },

  // 自定义导航栏就绪回调
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({ 
      headerHeight: totalHeight
    })
  },

  // 加载科目分类数据
  async loadSubjectCategories() {
    try {
      const result = await subjectApi.getSubjectCategories()
      
      if (result.success && result.data) {
        const { categories } = result.data
        
        // 构建科目选项（包含二级科目）
        const subjectOptions = ['全部科目']
        
        categories.forEach(level1 => {
          if (level1.children && level1.children.length > 0) {
            level1.children.forEach(level2 => {
              subjectOptions.push(level2.categoryName)
            })
          }
        })
        
        this.setData({
          subjectCategories: categories,
          subjectOptions: subjectOptions
        })
        
      }
    } catch (error) {
      console.error('加载科目分类失败:', error)
      // 使用默认的科目选项
      this.setData({
        subjectOptions: ['全部科目', 'IB数学', 'AL数学']
      })
    }
  },

  // 加载学生数据
  async loadStudentData() {
    try {
      this.setData({ loading: true })
      
      // 如果有 teacherId（例如从上一页传参或全局用户信息里有），一并传给后端
      const app = getApp()
      const teacherId = (app && app.globalData && app.globalData.userInfo && app.globalData.userInfo.id) ? app.globalData.userInfo.id : undefined
      const result = await studentApi.getTeacherStudents(teacherId ? { teacherId } : {})
      
      if (result && result.success && result.data) {
        const { students, statistics } = result.data || {}

        const mapped = Array.isArray(students) ? students.map(s => ({
          ...s,
          studentLevelLabel: s.studentLevel === 'gold' ? '金牌' : (s.studentLevel === 'silver' ? '银牌' : (s.studentLevel === 'bronze' ? '铜牌' : ''))
        })) : []

        this.setData({
          allStudents: mapped,
          statistics: statistics || { totalStudents: 0, monthlyHours: 0 }
        })
        
        // 应用当前筛选条件
        this.applyFilter()
        
      } else {
        wx.showToast({
          title: (result && result.message) || '获取学生数据失败',
          icon: 'none'
        })
      }
      
    } catch (error) {
      console.error('加载学生数据失败:', error)
      wx.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 学生姓名筛选输入
  onStudentNameInput(e) {
    const studentNameFilter = e.detail.value
    this.setData({ studentNameFilter })
  },

  // 科目筛选变化
  onSubjectFilterChange(e) {
    const selectedSubjectIndex = parseInt(e.detail.value)
    const subjectFilter = this.data.subjectOptions[selectedSubjectIndex]
    this.setData({ 
      selectedSubjectIndex,
      subjectFilter 
    })
  },

  // 点击查询按钮
  onSearchTap() {
    this.applyFilter()
  },

  // 应用筛选条件
  applyFilter() {
    const { allStudents, studentNameFilter, subjectFilter } = this.data
    
    let filtered = [...allStudents]
    
    // 学生姓名筛选
    if (studentNameFilter.trim()) {
      const nameKeyword = studentNameFilter.trim().toLowerCase()
      filtered = filtered.filter(student => {
        return student.studentName.toLowerCase().includes(nameKeyword)
      })
    }
    
    // 科目筛选
    if (subjectFilter !== '全部科目') {
      filtered = filtered.filter(student => {
        return student.courses && student.courses.some(course => 
          course.subject === subjectFilter
        )
      })
    }
    
    this.setData({ 
      filteredStudents: filtered,
      'statistics.totalStudents': filtered.length
    })
  },

  // 点击学生卡片
  onStudentTap(e) {
    const student = e.currentTarget.dataset.student
    console.log('点击学生:', student)
    
    // TODO: 跳转到学生详情页面
    wx.showToast({
      title: `查看${student.studentName}详情`,
      icon: 'none'
    })
    
    // 可以跳转到学生详情页
    // wx.navigateTo({
    //   url: `/pages/teacher/student-detail/student-detail?studentId=${student.studentId}`
    // })
  },

  // 滚动到底部
  onReachBottom() {
    console.log('滚动到底部')
    // TODO: 实现分页加载
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新')
    this.loadStudentData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '我的学生',
      path: '/pages/teacher/my-students/my-students'
    }
  }
})
