// 我的主页
const api = require('../../../utils/api')
const profileApi = require('../../../api/profile')

Page({
  data: {
    headerHeight: 0,
    coverUrl: '',
    user: {
      avatar: '',
      name: '',
      genderSymbol: '',
      tags: [],
      subjectsText: '',
      introduction: ''
    },
    currentTab: 'materials', // trial | materials | certs
    trialVideos: [],
    materials: [],
    certs: [],
    isTeacher: false,
    isStudent: true,
    teacherId: null,
    isFav: false
  },
  // 顶部自定义头部高度回调（用于给页面内容预留空间）
  onHeaderReady(e) {
    const { totalHeight } = e.detail || {}
    this.setData({ headerHeight: totalHeight || 0 })
  },

  onLoad(options) {
    const app = getApp()
    let role = (app && app.globalData && app.globalData.userRole) || ''
    if(!role){ try{ const auth = require('../../../utils/auth'); role = auth.getUserRole() }catch(e){} }
    const tid = options && options.teacherId ? Number(options.teacherId) : null
    this.setData({ isTeacher: role==='teacher', isStudent: role==='student', teacherId: tid })
    this.loadUser()
    this.loadLists()
    this.initFavorite()
  },

  // 加载用户基础信息（复用后端资料接口）
  async loadUser() {
    try {
      const { teacherId, isTeacher } = this.data
      // 学生/家长从教师卡片进入：按 teacherId 拉取指定教师详情
      if (teacherId && !isTeacher){
        const detail = await api.teacher.getDetail(teacherId)
        const u = (detail && detail.success && (detail.data || detail)) ? (detail.data || detail) : {}
        const name = u.name || u.teacherName || '未设置姓名'
        const avatar = u.avatar || u.avatarUrl || '/images/workspace/default-avatar.png'
        const tags = Array.isArray(u.teacherTags) ? u.teacherTags : (Array.isArray(u.tags)?u.tags:[])
        const subjectsText = Array.isArray(u.subjectsNameList)
          ? u.subjectsNameList.join('  |  ')
          : (u.subjectsMap && typeof u.subjectsMap === 'object')
            ? Object.values(u.subjectsMap).join('  |  ')
            : (Array.isArray(u.subjects) ? u.subjects.join('  |  ') : (u.subjectsNameList || u.subjects || ''))
        const introduction = u.introduction || u.bio || ''
        this.setData({
          user: { avatar, name, genderSymbol: (u.gender===1?'♂':(u.gender===2?'♀':'')), tags, subjectsText, introduction },
          coverUrl: this.toAbsolute(u.cover || avatar)
        })
        return
      }

      // 教师本人查看：读取当前登录教师资料
      const res = await profileApi.getUserProfile()
      if (res && res.success && res.data) {
        const u = res.data
        this.setData({
          user: {
            avatar: u.avatar || '/images/workspace/default-avatar.png',
            name: u.name || '未设置姓名',
            genderSymbol: (u.gender === 1 ? '♂' : (u.gender === 2 ? '♀' : '')),
            tags: Array.isArray(u.teacherTags) ? u.teacherTags : [],
            subjectsText: Array.isArray(u.subjectsNameList)
              ? u.subjectsNameList.join('  |  ')
              : (u.subjectsMap && typeof u.subjectsMap === 'object')
                ? Object.values(u.subjectsMap).join('  |  ')
                : (Array.isArray(u.subjects) ? u.subjects.join('  |  ') : (u.subjectsNameList || '')),
            introduction: u.introduction || '暂无个人介绍'
          },
          coverUrl: this.toAbsolute(u.cover || u.avatar || '')
        })
      }
    } catch(e) {
      // 静默失败，使用默认占位
    }
  },

  // 加载列表数据（后端接口：/mini/teacher-resource/list）
  async loadLists() {
    try {
      const { teacherId, isTeacher } = this.data
      const baseParams = teacherId && !isTeacher ? { teacherId } : {}
      const [trialRes, materialRes, certRes] = await Promise.all([
        api.teacherResource.getList({ type: 'trial_video', page: 1, size: 12, ...baseParams }),
        api.teacherResource.getList({ type: 'material', page: 1, size: 12, ...baseParams }),
        api.teacherResource.getList({ type: 'certificate', page: 1, size: 12, ...baseParams })
      ])
      const unwrap = (res) => res && res.success ? (Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.records) ? res.data.records : [])) : []
      const fmt = (v)=>{
        try{
          const d = typeof v === 'string' ? new Date(v) : new Date(v && (v.time||v))
          const pad = (n)=>String(n).padStart(2,'0')
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
        }catch(_){ return '' }
      }

      const trials = unwrap(trialRes).map(it=> ({
        ...it,
        coverFull: this.toAbsolute(it.coverUrl || it.cover),
        fileFull: this.toAbsolute(it.fileUrl),
        price: Number(it.price || 0),
        priceText: Number(it.price || 0).toFixed(2),
        timeText: fmt(it.createTime || it.time)
      }))

      const materials = unwrap(materialRes).map(it=> ({
        ...it,
        coverFull: this.toAbsolute(it.coverUrl || it.cover), // 使用后端返回的 coverUrl 并拼接 API 基础地址
        fileFull: this.toAbsolute(it.fileUrl),
        price: Number(it.price || 0),
        priceText: Number(it.price || 0).toFixed(2),
        timeText: fmt(it.createTime || it.time)
      }))

      const certs = unwrap(certRes).map(it=> ({
        ...it,
        coverFull: this.toAbsolute(it.coverUrl || it.image || it.cover),
        timeText: fmt(it.createTime || it.time)
      }))

      this.setData({
        trialVideos: trials,
        materials: materials,
        certs: certs
      })
    } catch (e) {
      // 出错时保持占位空列表
    }
  },

  onTabTap(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ currentTab: key })
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/teacher/edit-profile/edit-profile' })
  },

  editCover() {
    wx.showToast({ title: '编辑封面占位', icon: 'none' })
  },

  // 点击视频卡片封面：直接打开
  onTrialTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.trialVideos.find(v => v.id === id) || {}
    const url = this.toAbsolute(item.fileUrl || item.cover || '')
    if (!url) { wx.showToast({ title: '视频地址为空', icon: 'none' }); return }
    wx.navigateTo({ url: `/pages/player/player?src=${encodeURIComponent(url)}` })
  },

  // 点击下载：隐藏（暂不使用）
  async onTrialDownload(e){
    // noop
  },

  // 资料缩略图点击：直接预览
  async onMaterialPreview(e){
    const id = e.currentTarget.dataset.id
    const item = this.data.materials.find(v => v.id === id) || {}
    const url = this.toAbsolute(item.fileUrl)
    if (!url) { wx.showToast({ title: '资料地址为空', icon: 'none' }); return }
    try{
      wx.showLoading({ title:'打开中...' })
      const dl = await new Promise((resolve, reject)=> wx.downloadFile({ url, success: resolve, fail: reject }))
      wx.hideLoading()
      const filePath = dl && dl.tempFilePath
      if (!filePath) { wx.showToast({ title:'下载失败', icon:'none' }); return }
      wx.openDocument({ filePath, showMenu: true })
    }catch(err){ wx.hideLoading(); wx.showToast({ title:'打开失败', icon:'none' }) }
  },

  // 资料下载：隐藏（暂不使用）
  async onMaterialDownload(e){
    // noop
  },

  viewAll() {
    wx.showToast({ title: '查看全部占位', icon: 'none' })
  },

  // 收藏/取消收藏
  async toggleFavorite(){
    try{
      const { teacherId, isFav } = this.data
      if(!teacherId){ wx.showToast({ title:'缺少teacherId', icon:'none' }); return }
      const action = isFav ? 'remove' : 'add'
      const res = await api.teacher.favorite(teacherId, action)
      if(res && res.success){ this.setData({ isFav: !isFav }); wx.showToast({ title: isFav?'已取消收藏':'已收藏', icon:'success' }) }
    }catch(e){ wx.showToast({ title:'操作失败', icon:'none' }) }
  },

  // 进入页面初始化收藏状态
  async initFavorite(){
    try{
      const { teacherId, isStudent } = this.data
      if(!teacherId || !isStudent) return
      const res = await api.teacher.favoriteStatus(teacherId)
      if(res && res.success){ this.setData({ isFav: !!res.data }) }
    }catch(e){ /* 静默 */ }
  },

  // 预约课程（跳转到学生预约页面）
  bookCourse(){
    const { teacherId } = this.data
    if(!teacherId){ wx.showToast({ title:'缺少teacherId', icon:'none' }); return }
    wx.navigateTo({ url: `/pages/student/booking/booking?teacherId=${teacherId}` })
  },

  // 预览证书大图
  previewCert(e) {
    const url = this.toAbsolute(e.currentTarget.dataset.url)
    if (!url) { wx.showToast({ title: '无预览图片', icon: 'none' }); return }
    wx.previewImage({ current: url, urls: [url] })
  },

  onBack() {
    wx.navigateBack()
  }
  ,
  toAbsolute(url) {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    const api = require('../../../utils/api')
    const base = api.baseURL || ''
    if (!base) return url
    if (url.startsWith('/')) return `${base}${url}`
    return `${base}/${url}`
  }
})


