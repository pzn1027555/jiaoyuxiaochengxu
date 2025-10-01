// 学生端课程首页（发现课程/热门老师）
const api = require('../../utils/api')

Page({
  data: {
    keyword: '',
    hotTeachers: [],
    banners: [],
    subjectTabs: [],
    activeTab: '全部',
    subjectMap: {},
    courses: [],
    page: 1,
    size: 5,
    loading: false,
    finished: false
  },

  onShow(){
    const ui = require('../../utils/auth').getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    const app = getApp(); if (!app.globalData.userRole){ return }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().setSelected(0) }
  },
  onLoad(){
    const ui = require('../../utils/auth').getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    this.loadSubjects(); this.loadHotTeachers(); this.loadBanners(); this.loadCourses(true)
  },
  onReachBottom(){ if (!this.data.finished && !this.data.loading) { this.setData({ page: this.data.page + 1 }); this.loadCourses(false) } },

  // 搜索
  onSearchInput(e){ this.setData({ keyword: (e.detail.value||'').trim() }) },
  onSearchConfirm(){ this.setData({ page:1, courses:[] }); this.loadCourses(true) },
  goSearchCourse(){ wx.navigateTo({ url: '/pages/search/search?type=course' }) },

  // 热门话题 -> 社区
  goHotTopics(){ wx.switchTab({ url: '/pages/community/community' }) },
  goMoreTeachers(){ wx.navigateTo({ url: '/pages/teachers/teachers' }) },
  // 点击热门老师卡片 -> 首页
  goHotTeachersPage(){ wx.switchTab({ url: '/pages/index/index' }) },

  async loadSubjects(){
    try{
      const cc = require('../../api/courseCategory');
      const res = await cc.getCategoryList();
      const arr = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const map = {}
      // 只取一级科目作为Tab
      const tabs = arr.filter(x=> (x.level || x.level===0) ? x.level===1 : (x.parentId==null)).map(x=>{ const name = x.name || x.categoryName || x.category_name; const id = x.id || x.categoryId || x.category_id; if(name){ map[name]=id } return name }).filter(Boolean)
      this.setData({ subjectTabs: tabs, subjectMap: map })
    }catch(e){}
  },

  async loadHotTeachers(){
    try{
      const res = await api.teacher.getAllRecommended()
      const items = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const list = items.map(t=> ({
        id: t.id,
        teacherName: t.teacherName || t.name,
        avatar: t.avatar,
        avatarFull: this.toAbsolute(t.avatar),
        tags: Array.isArray(t.teacherTags) ? t.teacherTags : (typeof t.teacherTags === 'string' ? JSON.parseSafe(t.teacherTags) : []),
        intro: t.introduction || t.intro || '资深教师，教学经验丰富'
      }))
      this.setData({ hotTeachers: list })
    }catch(e){}
  },

  async loadBanners(){
    try{
      const res = await api.system.getCourseBanners()
      const items = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const list = items.map(it=> ({
        id: it.id,
        title: it.title || '',
        imageUrl: this.toAbsolute(it.imageUrl || it.image_url),
        linkType: it.linkType || it.link_type || 'none',
        linkValue: it.linkValue || it.link_value || '',
        sortOrder: it.sortOrder || it.sort_order || 0
      }))
      this.setData({ banners: list })
    }catch(e){}
  },

  async loadCourses(reset){
    if (this.data.loading) return
    this.setData({ loading:true })
    try{
      const subjectId = (this.data.activeTab && this.data.activeTab !== '全部') ? this.data.subjectMap[this.data.activeTab] : undefined
      const params = { page: this.data.page, size: this.data.size, keyword: this.data.keyword }
      if (subjectId != null && subjectId !== '' && subjectId !== 'undefined') { params.subjectId = subjectId }
      const res = await api.course.getList(params)
      const arr = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []
      let list = arr.map(it=> ({ id: it.id, title: it.title, coverUrl: it.coverUrl, coverFullUrl: this.toAbsolute(it.coverUrl), subject: it.subjectName || '', teacherId: it.teacherId, intro: it.intro || '', tags: (typeof it.courseTags === 'string' ? JSON.parseSafe(it.courseTags) : (it.courseTags||[])) }))
      const merged = reset ? list : (this.data.courses||[]).concat(list)
      const total = (res && res.data && typeof res.data.total==='number') ? res.data.total : undefined
      const noMore = (arr.length < this.data.size) || (total !== undefined && merged.length >= total)
      this.setData({ courses: merged, finished: !!noMore })
    } finally { this.setData({ loading:false }) }
  },

  toAbsolute(url){
    try{
      if(!url) return ''
      if(typeof url==='string' && (url.startsWith('http://')||url.startsWith('https://'))) return url
      const app = getApp(); const base = (app&&app.globalData&&app.globalData.apiBaseUrl) ? app.globalData.apiBaseUrl : require('../../config/env').getCurrentEnv().apiBaseUrl.replace(/\/api$/, '')
      return `${base}${url}`
    }catch(e){ return url }
  },

  onBannerTap(e){
    debugger
    const item = e.currentTarget.dataset.item
    if (!item) return
    const type = item.linkType || 'none'
    const value = item.linkValue || ''
    if (type === 'miniapp' && value) {
      if (value.startsWith('/')) {
        wx.navigateTo({ url: value })
      } else {
        wx.navigateTo({ url: `/${value}` })
      }
    } else if (type === 'web' && value) {
      wx.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(value)}` })
    }
  },

  switchTab(e){ const key=e.currentTarget.dataset.key; this.setData({ activeTab:key, page:1, courses:[], finished:false }); this.loadCourses(true) },
  goCourseDetail(e){ const id = e.currentTarget.dataset.id; if(!id) return; wx.navigateTo({ url:`/pages/course/detail/detail?id=${id}` }) },
  // 学习资料封面点击 -> 资源页
  goResources(){ wx.navigateTo({ url: '/pages/community/resources/resources' }) }
})