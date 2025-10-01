// pages/community/community.js
const api = require('../../api/community')

Page({
  data: {
    statistics: null,
    categories: [],
    posts: [],
    topResources: [],
    followingResources: [],
    loading: false,
    loadingMore: false,
    noMore: false,
    query: {
      keyword: '',
      categoryId: '',
      pageNum: 1,
      pageSize: 10
    },
    subjectTabs: ['全部'],
    activeSubject: '全部',
    subjectMap: {},
    subjectIdNameMap: {},
    subType: 'question',
    // 悬浮按钮位置
    fabX: 0,
    fabY: 0
  },

  onLoad() {
    const ui = require('../../utils/auth').getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    try{
      const pos = wx.getStorageSync('community_fab_pos')
      if(pos && typeof pos.x==='number' && typeof pos.y==='number'){
        this.setData({ fabX: pos.x, fabY: pos.y })
      } else {
        const sys = wx.getSystemInfoSync()
        const w = sys.windowWidth
        const h = sys.windowHeight
        // 默认放在右下角上方
        this.setData({ fabX: w*0.78, fabY: h*0.72 })
      }
    }catch(e){}
    this.init()
  },

  async init() {
    await Promise.all([
      this.fetchStatistics(),
      this.fetchCategories(),
      this.fetchTopResources(),
      this.fetchFollowingResources(),
      this.loadSubjects()
    ])
    this.refreshList()
  },

  async fetchStatistics() {
    try {
      const res = await api.getStatistics()
      if (res && res.success) {
        this.setData({ statistics: res.data })
      }
    } catch (e) {}
  },

  async fetchTopResources(){ 
    try{ 
      const r = await api.getTopResources(2); 
      if(r&&r.success){ 
        const resources = r.data || []
        const processedResources = resources.map(resource => ({
          ...resource,
          fileUrl: this.toAbsolute(resource.fileUrl),
          coverUrl: this.toAbsolute(resource.coverUrl || resource.cover)
        }))
        this.setData({ topResources: processedResources }) 
      } 
    }catch(e){} 
  },
  async fetchFollowingResources(){ 
    try{ 
      const app=getApp(); 
      const uid=(app&&app.globalData&&app.globalData.userInfo&&app.globalData.userInfo.id)||0; 
      if(!uid) return; 
      const r = await api.getFollowingResources({ studentId: uid, limit: 6 }); 
      if(r&&r.success){ 
        const resources = r.data || []
        const processedResources = resources.map(resource => ({
          ...resource,
          coverUrl: this.toAbsolute(resource.coverUrl || resource.cover),
          fileUrl: this.toAbsolute(resource.fileUrl)
        }))
        this.setData({ followingResources: processedResources }) 
      } 
    }catch(e){} 
  },


  async fetchCategories() {
    try {
      const res = await api.getCategories()
      if (res && res.success) {
        const categories = [{ id: '', name: '全部' }].concat(res.data || [])
        this.setData({ categories })
      }
    } catch (e) {}
  },

  async refreshList() {
    this.setData({ loading: true, noMore: false, 'query.pageNum': 1 })
    try {
      const subjectName = this.data.activeSubject
      const subjectId = (subjectName && subjectName !== '全部') ? (this.data.subjectMap && this.data.subjectMap[subjectName]) : undefined
      const params = {
        subType: this.data.subType,
        keyword: this.data.query.keyword,
        pageNum: 1,
        pageSize: this.data.query.pageSize
      }
      // 仅帖子搜索：上面 keyword 已生效
      // 传入用户用于 liked 判定
      try{ const app=getApp(); const uid=(app&&app.globalData&&app.globalData.userInfo&&app.globalData.userInfo.id)||0; const ut=(app&&app.globalData&&app.globalData.userRole)||'student'; if(uid){ params.userId=uid; params.userType=ut } }catch(e){}
      if (subjectId != null) params.subjectId = subjectId
      const res = await api.filterPosts(params)
      if (res && res.success) {
        const pageInfo = res.data || {}
        let list = pageInfo.list || []
        list = (list||[]).map(p=> this.decoratePost(p))
        const total = pageInfo.total || list.length
        this.setData({
          posts: list,
          noMore: list.length >= total,
          'query.pageNum': 1
        })
        // 渲染一帧后测量
        setTimeout(()=> this.measureClamps(), 50)
      } else {
        this.setData({ posts: [], noMore: true })
      }
    } catch (e) {
      this.setData({ posts: [], noMore: true })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  async loadMore() {
    if (this.data.loadingMore || this.data.noMore) return
    this.setData({ loadingMore: true })
    try {
      const nextPage = this.data.query.pageNum + 1
      const subjectName = this.data.activeSubject
      const subjectId = (subjectName && subjectName !== '全部') ? (this.data.subjectMap && this.data.subjectMap[subjectName]) : undefined
      const params = {
        subType: this.data.subType,
        keyword: this.data.query.keyword,
        pageNum: nextPage,
        pageSize: this.data.query.pageSize
      }
      try{ const app=getApp(); const uid=(app&&app.globalData&&app.globalData.userInfo&&app.globalData.userInfo.id)||0; const ut=(app&&app.globalData&&app.globalData.userRole)||'student'; if(uid){ params.userId=uid; params.userType=ut } }catch(e){}
      if (subjectId != null) params.subjectId = subjectId
      const res = await api.filterPosts(params)
      if (res && res.success) {
        const pageInfo = res.data || {}
        let list = pageInfo.list || []
        list = (list||[]).map(p=> this.decoratePost(p))
        const total = pageInfo.total || (this.data.posts.length + list.length)
        const merged = (this.data.posts || []).concat(list)
        this.setData({
          posts: merged,
          'query.pageNum': nextPage,
          noMore: merged.length >= total
        })
        setTimeout(()=> this.measureClamps(), 50)
      }
    } catch (e) {
      // 保持原状态
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 构造帖子展示字段：相对时间、媒体、全文展开
  decoratePost(p){
    const post = { ...p }
    // 相对时间
    try{
      const ts = (post.createTime||'').replace(/-/g,'/')
      const t = new Date(ts)
      const now = new Date()
      const diffMs = now - t
      const mins = Math.floor(diffMs/60000)
      const hours = Math.floor(mins/60)
      if (mins < 60) post.relativeTime = `${mins}分钟前`
      else if (hours < 24) post.relativeTime = `${hours}小时前`
      else post.relativeTime = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
    }catch(e){ post.relativeTime = post.createTime }
    
    // 获取API base URL
    const app = getApp()
    const apiBaseUrl = (app && app.globalData && app.globalData.apiBaseUrl) || require('../../../config/env').getCurrentEnv().apiBaseUrl
    
    // 媒体（最多三张）
    const media = []
    try{
      const imgs = Array.isArray(post.images) ? post.images : (typeof post.images==='string' ? JSON.parse(post.images||'[]') : [])
      ;(imgs||[]).slice(0,3).forEach(u=> {
        // 确保图片URL是完整的HTTP地址
        let fullUrl = u
        if(fullUrl && !fullUrl.startsWith('http')) {
          fullUrl = apiBaseUrl + fullUrl
        }
        media.push({ type:'image', url: fullUrl })
      })
    }catch(e){}
    // 可扩展：attachments 里视频
    try{
      const atts = Array.isArray(post.attachments) ? post.attachments : (typeof post.attachments==='string' ? JSON.parse(post.attachments||'[]') : [])
      ;(atts||[]).filter(a=>/\.mp4$/i.test(a)||a?.type==='video').slice(0,3-media.length).forEach(u=> {
        let url = u.url || u
        // 确保视频URL是完整的HTTP地址
        if(url && !url.startsWith('http')) {
          url = apiBaseUrl + url
        }
        media.push({ type:'video', url })
      })
    }catch(e){}
    post.media = media
    post.expanded = false
    post.fullContent = post.content
    // 两行溢出判断：初始先不显示"展示全文"，渲染后测量
    post.showMore = false
    post.liked = !!post.liked
    post.commented = !!post.commented
    return post
  },

  toggleExpand(e){ const id=e.currentTarget.dataset.id; const arr=(this.data.posts||[]).map(p=> p.id===id?{...p, expanded:true}:p); this.setData({ posts: arr }) },
  // 渲染完成后测量文本是否超过两行
  measureClamps(){
    const query = wx.createSelectorQuery()
    query.selectAll('.post-card').boundingClientRect()
    query.selectAll('.post-text.clamp').boundingClientRect()
    query.exec(()=>{
      // 逐条测量：以隐藏节点高度对比两行高度
      const posts = (this.data.posts||[]).map(p=>{
        try{
          const id = p.id
          const q = wx.createSelectorQuery()
          q.select(`#text-${id}`).boundingClientRect()
          q.select(`#measure-${id}`).boundingClientRect()
          q.exec(res=>{
            const textRect = (res && res[0]) || null
            const fullRect = (res && res[1]) || null
            if(textRect && fullRect){
              const twoLine = textRect.height
              const needMore = fullRect.height - twoLine > 4 // 容差
              const arr=(this.data.posts||[]).map(x=> x.id===id?{...x, showMore:needMore}:x)
              this.setData({ posts: arr })
            }
          })
        }catch(err){}
        return p
      })
    })
  },
  previewImage(e){ const url=e.currentTarget.dataset.url; const current = url; const urls=(this.data.posts||[]).flatMap(p=> (p.media||[]).filter(m=>m.type==='image').map(m=>m.url)); wx.previewImage({ current, urls }) },
  likePost(e){
    e.stopPropagation && e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    // 从全局与storage兜底取 userId/userType
    let userId = (app&&app.globalData&&app.globalData.userInfo&& (app.globalData.userInfo.userId || app.globalData.userInfo.id)) || 0
    let userType = (app&&app.globalData&&app.globalData.userRole) || 'student'
    try{
      if(!userId){ const ui = require('../../utils/auth').getUserInfo(); if(ui){ userId = ui.userId || ui.id || 0; userType = ui.role || userType } }
    }catch(_){}
    const body = { postId: id, userId, userType }
    api.likePost(body).then(r=>{
      if(r&&r.success){
        const liked = !!(r.data&&r.data.liked);
        const delta = liked?1:-1;
        const posts=(this.data.posts||[]).map(p=> p.id===id?{...p, liked, likeCount: Math.max(0,(p.likeCount||0)+delta)}:p);
        this.setData({ posts })
      }
    })
  },
  goDetail(e){ e.stopPropagation && e.stopPropagation(); const id=e.currentTarget.dataset.id; wx.navigateTo({ url: `/pages/community/detail/detail?id=${id}` }) },

  openResource(e){
    const url = this.toAbsolute(e.currentTarget.dataset.url)
    const id = e.currentTarget.dataset.id
    if(!url){ wx.showToast({ title:'无下载地址', icon:'none' }); return }
    this.handleDownload({ url, id })
  },

  async onDownload(e){
    e.stopPropagation && e.stopPropagation()
    const url = this.toAbsolute(e.currentTarget.dataset.url)
    const id = e.currentTarget.dataset.id
    this.handleDownload({ url, id })
  },

  onKeywordInput(e) {
    this.setData({ 'query.keyword': e.detail.value })
  },

  onSearch() {
    this.refreshList()
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      // 重新加载所有数据
      await Promise.all([
        this.fetchStatistics(),
        this.fetchTopResources(),
        this.fetchFollowingResources(),
        this.loadSubjects(),
        this.refreshList()
      ])
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      })
    } catch (error) {
      console.error('刷新失败:', error)
      wx.showToast({
        title: '刷新失败',
        icon: 'none',
        duration: 1000
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  goMoreResources(){ 
    console.log('点击了更多按钮')
    wx.navigateTo({ url: '/pages/community/resources/resources' })
  },

  onSelectCategory(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ 'query.categoryId': id })
    this.refreshList()
  },

  // 科目/子类筛选
  async loadSubjects(){
    try{
      const ccApi = require('../../api/courseCategory')
      const res = await ccApi.getCategoryList()
      const arr = (res && res.success && Array.isArray(res.data)) ? res.data : []
      const nameToId = {}
      const idToName = {}
      const names = arr
        .filter(x=> (x.level||x.level===0) ? x.level===1 : (x.parentId==null))
        .map(x=>{ const name = x.name || x.categoryName || x.category_name; const id = x.id || x.categoryId || x.category_id; if(name){ nameToId[name]=id; idToName[String(id)] = name } return name })
        .filter(Boolean)
      this.setData({ subjectTabs: ['全部'].concat(names), subjectMap: nameToId, subjectIdNameMap: idToName })
    }catch(e){}
  },
  switchSubject(e){ const key = e.currentTarget.dataset.key; this.setData({ activeSubject: key }, ()=> this.refreshList()) },
  switchSub(e){ const key=e.currentTarget.dataset.key; this.setData({ subType: key }, ()=> this.refreshList()) },

  onTapPost(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/community/detail/detail?id=${id}` })
  },

  goCreate(){ wx.navigateTo({ url: '/pages/community/create/create' }) },

  onShow() {
    const ui = require('../../utils/auth').getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    const app = getApp()
    const userRole = app.globalData.userRole
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      if (userRole === 'student') {
        this.getTabBar().setSelected(3)
      }
    }
    // 渲染后测量文本
    setTimeout(()=> this.measureClamps(), 50)
  },

  onPullDownRefresh() {
    this.refreshList()
  },

  onReachBottom() {
    this.loadMore()
  },

  onShareAppMessage() {
    return {
      title: '社区',
      path: '/pages/community/community'
    }
  }
  ,
  onFabChange(e){
    const { x, y } = e.detail || {}
    if(typeof x === 'number' && typeof y === 'number'){
      this.setData({ fabX: x, fabY: y })
      try{ wx.setStorageSync('community_fab_pos', { x, y }) }catch(err){}
    }
  },
  onFabRelease(){
    try{ wx.setStorageSync('community_fab_pos', { x: this.data.fabX, y: this.data.fabY }) }catch(err){}
  }
  ,
  async handleDownload({ url, id }){
    if(!url){ wx.showToast({ title:'无下载地址', icon:'none' }); return }
    try{
      if(id){
        await api.addResourceDownload?.(id)
      }
    }catch(err){
      console.log('记录下载失败:', err)
    }
    wx.showLoading({ title:'下载中...' })
    wx.downloadFile({
      url,
      success: res => {
        wx.hideLoading()
        const filePath = res.tempFilePath
        if(!filePath){ wx.showToast({ title:'下载失败', icon:'none' }); return }
        wx.openDocument({
          filePath,
          showMenu: true,
          success: ()=>{ wx.showToast({ title:'打开成功', icon:'success' }) },
          fail: ()=>{ wx.showToast({ title:'打开失败', icon:'none' }) }
        })
      },
      fail: ()=>{
        wx.hideLoading()
        wx.showToast({ title:'下载失败', icon:'none' })
      }
    })
  }
  ,
  toAbsolute(url){
    if(!url) return ''
    if(/^https?:\/\//i.test(url)) return url
    try{
      const app = getApp()
      const base = (app && app.globalData && app.globalData.apiBaseUrl) || require('../../config/env').getCurrentEnv().apiBaseUrl
      if(!base) return url
      if(url.startsWith('/')) return `${base}${url}`
      return `${base}/${url}`
    }catch(e){
      return url
    }
  }
})