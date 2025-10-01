// pages/index/index.js - 学生“发现”页（搜索老师/课程 -> 展示老师卡片）
const api = require('../../utils/api')
const auth = require('../../utils/auth')
const ccApi = require('../../api/courseCategory')

Page({
  data: {
    keyword: '',
    // 科目筛选
    subjectTabs: ['全部'],
    activeSubject: '全部',
    subjectMap: {}, // 名称->一级ID
    subjectIdNameMap: {}, // ID->名称（用于展示）
    // 省市区筛选
    filterProvince: '',
    filterCity: '',
    filterDistrict: '',
    regionText: '',
    // 价格与性别筛选
    priceOptions: ['¥0-200','¥200-400','¥400-600','¥600-800','¥800+'],
    priceIndex: 0,
    priceText: '',
    genderOptions: ['男','女'],
    genderIndex: 0,
    genderText: '',
    filterPriceRange: null, // [min,max]，max为空表示无限
    filterGender: '',
    // 地区选择器数据（参考 teacher/edit-profile）
    regionData: [],
    regionPickerRange: [[], [], []],
    regionPickerValue: [0, 0, 0],
    // 老师列表
    teachers: [],
    page: 1,
    size: 10,
    total: 0,
    loading: false
  },

  onLoad() {
    this.loadSubjects()
    this.initRegionData()
    this.search()
  },

  onShow() {
    const auth = require('../../utils/auth')
    const ui = auth.getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    const app = getApp()
    if (!app.globalData.userRole){ return }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1) // 学生端“发现”在第1个
    }
  },

  onPullDownRefresh() {
    this.setData({ page:1, teachers:[] })
    this.search().finally(()=> wx.stopPullDownRefresh())
  },

  // 输入框
  onInput(e){ this.setData({ keyword: (e.detail.value||'').trim() }) },
  onSearch(){ this.setData({ page:1, teachers:[] }); this.search() },
  goTeacherHome(e){
    const id = e.currentTarget.dataset.id
    if(!id){ return }
    wx.navigateTo({ url: `/pages/teacher/homepage/homepage?teacherId=${id}` })
  },
  async search(){
    if (this.data.loading) return
    this.setData({ loading:true })
    try{
      // 约定：q 可是老师名或课程名，后端统一返回老师列表
      const { page, size, keyword, filterProvince, filterCity, filterDistrict, activeSubject } = this.data
      const subjectId = (activeSubject && activeSubject !== '全部') ? (this.data.subjectMap && this.data.subjectMap[activeSubject]) : undefined
      const params = { q: keyword, page, size, province: filterProvince, city: filterCity, district: filterDistrict }
      if (subjectId != null) params.subjectId = subjectId
      const res = await api.search.teachers(params)
      if (res && res.success){
        // 改为不分页：若后端已分页则也直接用当前页数据即可
        const items = (res.data && (res.data.items || res.data.records)) || res.data || []
        const formatted = items.map(t=> this.formatTeacher(t))
        const filtered = this.applyFilters(formatted)
        const merged = (this.data.page===1 ? [] : (this.data.teachers||[])).concat(filtered)
        this.setData({ teachers: merged, total: merged.length })
      }
    } finally { this.setData({ loading:false }) }
  },
  formatTeacher(t){
    const tags = Array.isArray(t.teacherTags) ? t.teacherTags : (typeof t.teacherTags === 'string' ? JSON.parseSafe(t.teacherTags) : [])
    const subjectsArr = (() => {
      if (t.subjectsMap && typeof t.subjectsMap === 'object') {
        return Object.values(t.subjectsMap)
      }
      if (Array.isArray(t.subjectsNameList)) return t.subjectsNameList
      if (typeof t.subjectsNameList === 'string') return JSON.parseSafe(t.subjectsNameList)
      if (typeof t.subjects === 'string') return JSON.parseSafe(t.subjects)
      if (Array.isArray(t.subjects)) return t.subjects
      return []
    })()
    const idName = this.data.subjectIdNameMap || {}
    const subjectNames = subjectsArr.map(s=> (typeof s === 'number' || /^\d+$/.test(String(s))) ? (idName[String(s)] || idName[Number(s)] || s) : s)
    const location = [t.province, t.city, t.district].filter(Boolean).join('')
    const genderSymbol = t.gender === 1 ? '♂' : (t.gender === 2 ? '♀' : '')
    return {
      raw: t,
      id: t.id,
      name: t.teacherName || t.name || '',
      avatar: this.toAbsolute(t.avatar) || '/images/workspace/default-avatar.png',
      tags: tags,
      price: (typeof t.hourlyRate !== 'undefined' && t.hourlyRate !== null) ? t.hourlyRate : (t.price || 0),
      city: location,
      district: t.district || '',
      genderSymbol,
      subjects: subjectNames,
      subjectsText: subjectNames.join(' | '),
      intro: t.introduction || ''
    }
  },
  applyFilters(list){
    const { activeSubject, filterProvince, filterCity, filterDistrict, filterPriceRange, filterGender } = this.data
    return (list||[]).filter(it=>{
      // 科目筛选已由后端处理
      // 地区
      if (filterProvince && it.raw && it.raw.province !== filterProvince) return false
      if (filterCity && it.raw && it.raw.city !== filterCity) return false
      if (filterDistrict && it.raw && it.raw.district !== filterDistrict) return false
      // 性别（后端 gender: 1=男 2=女）
      if (filterGender) {
        const g = it.raw && it.raw.gender
        if (filterGender === '男' && g !== 1) return false
        if (filterGender === '女' && g !== 2) return false
      }
      // 价格
      if (filterPriceRange) {
        const p = Number(it.raw && it.raw.hourlyRate) || 0
        const [min,max] = filterPriceRange
        if (p < min) return false
        if (max != null && p > max) return false
      }
      return true
    })
  },
  toAbsolute(url){
    const { toAbsolute } = require('../../utils/urlUtils')
    return toAbsolute(url, 'static')
  },

  // 跳转通用搜索页（老师）
  goSearchTeacher(){ wx.navigateTo({ url: '/pages/search/search?type=teacher' }) },

  // 加载科目（与 courses 页一致接口）
  async loadSubjects(){
    try{
      const res = await ccApi.getCategoryList()
      const arr = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const nameToId = {}
      const idToName = {}
      const names = arr.filter(x=> (x.level||x.level===0) ? x.level===1 : (x.parentId==null)).map(x=>{ const name = x.name || x.categoryName || x.category_name; const id = x.id || x.categoryId || x.category_id; if(name){ nameToId[name]=id; idToName[String(id)] = name } return name }).filter(Boolean)
      const tabs = ['全部'].concat(names)
      this.setData({ subjectTabs: tabs, subjectMap: nameToId, subjectIdNameMap: idToName })
    }catch(e){ /* 保持默认“全部” */ }
  },
  switchSubject(e){
    const key = e.currentTarget.dataset.key
    this.setData({ activeSubject: key, page:1, teachers:[] }, ()=> this.search())
  },

  // 省市区选择（复用 edit-profile 的数据结构）
  initRegionData(){
    try{
      // 动态从教师编辑页加载常量，避免重复维护（编译期 require 静态分析无关）
      const editPage = require('../teacher/edit-profile/edit-profile.js')
      // 运行时无法直接访问Page模块导出的data，这里复制一份最小静态集作为兜底
    }catch(err){}
    // 兜底：使用较小的数据集，覆盖常见演示省份
    const regionData = [
      { name:'河北省', cities:[ { name:'石家庄市', districts:['长安区','桥西区','新华区','井陉矿区','裕华区','藁城区','鹿泉区','栾城区'] } ] },
      { name:'浙江省', cities:[ { name:'杭州市', districts:['上城区','拱墅区','西湖区','滨江区','萧山区','余杭区','临平区','钱塘区','富阳区','临安区'] } ] },
      { name:'上海市', cities:[ { name:'上海市', districts:['黄浦区','徐汇区','长宁区','静安区','浦东新区'] } ] }
    ]
    const provinces = regionData.map(p=>p.name)
    const cities = regionData[0].cities.map(c=>c.name)
    const districts = regionData[0].cities[0].districts
    this.setData({ regionData, regionPickerRange:[provinces,cities,districts] })
  },
  onRegionColumnChange(e){
    const { column, value } = e.detail
    const { regionData, regionPickerRange, regionPickerValue } = this.data
    if (column === 0){
      const newCities = (regionData[value] && regionData[value].cities || []).map(c=>c.name)
      const newDistricts = (regionData[value] && regionData[value].cities[0] && regionData[value].cities[0].districts) || []
      this.setData({ regionPickerValue:[value,0,0], regionPickerRange:[regionPickerRange[0], newCities, newDistricts] })
    } else if (column === 1){
      const pIdx = regionPickerValue[0]
      const newDistricts = (regionData[pIdx] && regionData[pIdx].cities[value] && regionData[pIdx].cities[value].districts) || []
      this.setData({ regionPickerValue:[pIdx,value,0], regionPickerRange:[regionPickerRange[0], regionPickerRange[1], newDistricts] })
    }
  },
  onRegionChange(e){
    const [pi,ci,di] = e.detail.value
    const p = this.data.regionData[pi]
    const c = p.cities[ci]
    const d = c.districts[di]
    this.setData({
      filterProvince: p.name,
      filterCity: c.name,
      filterDistrict: d,
      regionText: `${p.name}${c.name}${d}`,
      page:1,
      teachers:[]
    }, ()=> this.search())
  },
  clearRegion(){ this.setData({ filterProvince:'', filterCity:'', filterDistrict:'', regionText:'', page:1, teachers:[] }, ()=> this.search()) },

  // 价格筛选
  onPriceChange(e){
    const idx = Number(e.detail.value)
    const txt = this.data.priceOptions[idx]
    let range = null
    if (txt) {
      if (txt === '¥0-200') range = [0,200]
      else if (txt === '¥200-400') range = [200,400]
      else if (txt === '¥400-600') range = [400,600]
      else if (txt === '¥600-800') range = [600,800]
      else range = [800,null]
    }
    this.setData({ priceIndex: idx, priceText: txt, filterPriceRange: range, page:1, teachers:[] }, ()=> this.search())
  },
  clearPrice(){ this.setData({ priceText:'', filterPriceRange:null, page:1, teachers:[] }, ()=> this.search()) },

  // 性别筛选
  onGenderChange(e){
    const idx = Number(e.detail.value)
    const txt = this.data.genderOptions[idx]
    this.setData({ genderIndex: idx, genderText: txt, filterGender: txt, page:1, teachers:[] }, ()=> this.search())
  },
  clearGender(){ this.setData({ genderText:'', filterGender:'', page:1, teachers:[] }, ()=> this.search()) },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    console.log('首页检查登录状态 - app.globalData:', app.globalData)
    
    if (!app.globalData.isLogin) {
      console.log('用户未登录')
      // 检查是否需要角色选择
      const userInfo = app.globalData.userInfo
      if (userInfo && userInfo.needRoleSelection) {
        // 需要角色选择，跳转到角色选择页
        console.log('需要角色选择，跳转到角色选择页')
        wx.reLaunch({
          url: '/pages/role-select/role-select'
        })
      } else {
        // 未登录，跳转到登录页
        console.log('未登录，跳转到登录页')
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
      return
    }

    const userRole = app.globalData.userRole
    console.log('用户已登录，角色:', userRole)
    
    // 根据角色跳转到对应的默认页面
    if (userRole === 'teacher') {
      console.log('教师角色，跳转到工作台')
      wx.reLaunch({
        url: '/pages/teacher/workspace/workspace'
      })
      return
    } else if (userRole === 'student' || userRole === 'parent') {
      console.log('学生/家长角色，跳转到课程页面')
      wx.reLaunch({
        url: '/pages/courses/courses'
      })
      return
    }
    
    // 如果没有明确角色，继续显示首页
    this.setData({
      userRole: userRole,
      roleContentTitle: this.getRoleContentTitle(userRole)
    })
  },

  // 获取角色内容标题
  getRoleContentTitle(role) {
    const titleMap = {
      'student': '我的课程',
      'parent': '孩子动态',
      'teacher': '教学概况'
    }
    return titleMap[role] || '内容推荐'
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true })
    
    try {
      // 并发加载各种数据
      await Promise.all([
        this.loadRoleSpecificData(),
        this.loadRecommendations()
      ])
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

  // 加载角色特定数据
  async loadRoleSpecificData() {
    const { userRole } = this.data
    
    switch (userRole) {
      case 'student':
        await this.loadStudentData()
        break
      case 'parent':
        await this.loadParentData()
        break
      case 'teacher':
        await this.loadTeacherData()
        break
    }
  },

  // 加载学生数据
  async loadStudentData() {
    try {
      const res = await api.student.getLearningRecords({ limit: 5 })
      if (res.success) {
        this.setData({
          studentCourses: this.formatStudentCourses(res.data)
        })
      }
    } catch (error) {
      console.error('加载学生数据失败:', error)
    }
  },

  // 加载家长数据
  async loadParentData() {
    try {
      const res = await api.parent.getChildren()
      if (res.success) {
        this.setData({
          children: this.formatChildren(res.data)
        })
      }
    } catch (error) {
      console.error('加载家长数据失败:', error)
    }
  },

  // 加载教师数据
  async loadTeacherData() {
    try {
      const [statsRes, classesRes] = await Promise.all([
        api.teacherPortal.getTeachingStats(),
        api.teacherPortal.getRecentClasses({ limit: 5 })
      ])
      
      if (statsRes.success) {
        this.setData({
          teachingStats: statsRes.data
        })
      }
      
      if (classesRes.success) {
        this.setData({
          recentClasses: this.formatRecentClasses(classesRes.data)
        })
      }
    } catch (error) {
      console.error('加载教师数据失败:', error)
    }
  },

  // 加载推荐内容
  async loadRecommendations() {
    try {
      // 这里使用模拟数据，实际应该从API获取
      const mockRecommendations = [
        {
          id: 1,
          title: '数学基础提升课程',
          description: '适合初高中学生的数学基础强化训练',
          imageUrl: '/images/courses/math.jpg',
          tags: ['数学', '基础', '提升']
        },
        {
          id: 2,
          title: '英语口语专项训练',
          description: '外教一对一口语练习，快速提升口语水平',
          imageUrl: '/images/courses/english.jpg',
          tags: ['英语', '口语', '外教']
        }
      ]
      
      this.setData({
        recommendations: mockRecommendations
      })
    } catch (error) {
      console.error('加载推荐内容失败:', error)
    }
  },

  // 格式化学生课程数据
  formatStudentCourses(courses) {
    return courses.map(course => ({
      ...course,
      progress: Math.round(course.progress || 0)
    }))
  },

  // 格式化孩子数据
  formatChildren(children) {
    return children.map(child => ({
      ...child,
      avatar: child.avatar || '/images/default_avatar.png'
    }))
  },

  // 格式化最近课程数据
  formatRecentClasses(classes) {
    return classes.map(cls => {
      const startTime = new Date(cls.startTime)
      const now = new Date()
      
      let timeLabel = ''
      let timeValue = ''
      let status = ''
      let statusText = ''
      
      if (startTime > now) {
        timeLabel = '即将开始'
        timeValue = this.formatTime(startTime)
        status = 'pending'
        statusText = '待上课'
      } else if (cls.status === 'ongoing') {
        timeLabel = '正在进行'
        timeValue = this.formatTime(startTime)
        status = 'ongoing'
        statusText = '上课中'
      } else {
        timeLabel = '已结束'
        timeValue = this.formatTime(startTime)
        status = 'completed'
        statusText = '已完成'
      }
      
      return {
        ...cls,
        timeLabel,
        timeValue,
        status,
        statusText
      }
    })
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  },

  // 轮播图点击
  onBannerTap(e) {
    const item = e.currentTarget.dataset.item
    console.log('轮播图点击:', item)
    
    if (item.linkType === 'course') {
      wx.switchTab({
        url: '/pages/courses/courses'
      })
    } else if (item.linkType === 'teacher') {
      wx.switchTab({
        url: '/pages/teachers/teachers'
      })
    }
  },

  // 快捷功能点击
  onActionTap(e) {
    const action = e.currentTarget.dataset.action
    console.log('快捷功能点击:', action)
    
    switch (action.action) {
      case 'course':
        wx.switchTab({
          url: '/pages/courses/courses'
        })
        break
      case 'teacher':
        wx.navigateTo({
          url: '/pages/teachers/teachers'
        })
        break
      case 'community':
        wx.switchTab({
          url: '/pages/community/community'
        })
        break
      case 'order':
        wx.navigateTo({
          url: '/pages/orders/orders'
        })
        break
      case 'message':
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
        break
    }
  },

  // 课程详情
  onCourseDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/courses/detail?id=${id}`
    })
  },

  // 孩子详情
  onChildDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/children/detail?id=${id}`
    })
  },

  // 课程详情
  onClassDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/classes/detail?id=${id}`
    })
  },

  // 推荐内容点击
  onRecommendTap(e) {
    const item = e.currentTarget.dataset.item
    console.log('推荐内容点击:', item)
    
    wx.navigateTo({
      url: `/pages/courses/detail?id=${item.id}`
    })
  },

  // 查看更多
  viewMore() {
    const { userRole } = this.data
    
    if (userRole === 'student') {
      wx.switchTab({
        url: '/pages/courses/courses'
      })
    } else if (userRole === 'parent') {
      wx.navigateTo({
        url: '/pages/children/list'
      })
    } else if (userRole === 'teacher') {
      wx.navigateTo({
        url: '/pages/teacher/dashboard'
      })
    }
  },

  // 查看更多推荐
  viewMoreRecommend() {
    wx.switchTab({
      url: '/pages/courses/courses'
    })
  },

  onReachBottom(){
    const { teachers, total, page } = this.data
    if (teachers.length >= total) return
    this.setData({ page: page+1 }, ()=> this.search())
  },

  // 页面分享
  onShareAppMessage() { return { title:'新文枢教育 - 发现好老师', path:'/pages/index/index' } }
})