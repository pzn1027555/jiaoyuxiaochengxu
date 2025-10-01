const api = require('../../../api/community')

Page({
  data:{ id:null, post:{}, comments:[], newComment:'', 
    cPage:1, cSize:10, cTotal:0, loading:false },
  onLoad(options){ const id = Number(options&&options.id)||null; this.setData({ id }); if(id){ this.loadDetail(); this.reloadComments(); } },
  async loadDetail(){
    const app = getApp();
    let userId = (app&&app.globalData&&app.globalData.userInfo&&(app.globalData.userInfo.userId||app.globalData.userInfo.id))||0
    try{ if(!userId){ const ui=require('../../../utils/auth').getUserInfo(); if(ui){ userId = ui.userId||ui.id||0 } } }catch(_){}
    const r = await api.getPostDetail(this.data.id, { userId });
    if(r&&r.success){ 
      const d=r.data||{}; 
      try{ 
        if(typeof d.images==='string'){ 
          d.images = JSON.parse(d.images) 
        } 
        // 确保图片URL是完整的HTTP地址
        if(d.images && Array.isArray(d.images)){
          const apiBaseUrl = (app && app.globalData && app.globalData.apiBaseUrl) || require('../../../config/env').getCurrentEnv().apiBaseUrl
          d.images = d.images.map(url => {
            if(url && !url.startsWith('http')) {
              return apiBaseUrl + url
            }
            return url
          })
        }
      }catch(e){} 
      d.liked = !!d.liked; 
      this.setData({ post:d }) 
    }
  },
  async reloadComments(){ this.setData({ cPage:1, comments:[] }); await this.loadComments() },
  async loadComments(){ if(this.data.loading) return; this.setData({ loading:true });
    const app = getApp();
    let userId = (app&&app.globalData&&app.globalData.userInfo&&(app.globalData.userInfo.userId||app.globalData.userInfo.id))||0
    let userType = (app&&app.globalData&&app.globalData.userRole)||'student'
    try{ if(!userId){ const ui=require('../../../utils/auth').getUserInfo(); if(ui){ userId = ui.userId||ui.id||0; userType = ui.role||userType } } }catch(_){}
    
    const params = { pageNum:this.data.cPage, pageSize:this.data.cSize }
    if(userId && userId > 0) {
      params.userId = userId
      params.userType = userType
    }
    
    const r = await api.getComments(this.data.id, params)
    if(r&&r.success){ 
      const list=(r.data&&r.data.list)||[]; 
      const total=(r.data&&r.data.total)||0; 
      // 确保每个评论都有liked属性
      const processedList = list.map(comment => ({...comment, liked: !!comment.liked}))
      const merged = (this.data.cPage===1?[]:this.data.comments).concat(processedList); 
      this.setData({ comments: merged, cTotal: total }) 
    }
    this.setData({ loading:false }) },
  onPreview(e){ const url=e.currentTarget.dataset.url; wx.previewImage({ current:url, urls:(this.data.post.images||[]) }) },
  async onLike(){
    const app=getApp();
    let userId=(app.globalData.userInfo&&(app.globalData.userInfo.userId||app.globalData.userInfo.id))||0
    try{ if(!userId){ const ui=require('../../../utils/auth').getUserInfo(); if(ui){ userId=ui.userId||ui.id||0 } }}catch(_){ }
    const r = await api.likePost({ postId:this.data.id, userId, userType:(app.globalData.userRole)||'student' })
    if(r&&r.success){ const liked=!!(r.data && r.data.liked); const delta = liked ? 1 : -1; this.setData({ 'post.liked': liked, 'post.likeCount': Math.max(0, (this.data.post.likeCount||0)+delta) }) }
  },
  onInputComment(e){ this.setData({ newComment: e.detail.value }) },
  async onSend(){ const content=(this.data.newComment||'').trim(); if(!content){ wx.showToast({ title:'请输入内容', icon:'none' }); return } const body={ content, userId: (getApp().globalData.userInfo&&getApp().globalData.userInfo.id)||0, userType: (getApp().globalData.userRole)||'student' }; const r = await api.addComment(this.data.id, body); if(r&&r.success){ wx.showToast({ title:'已发布', icon:'success' }); this.setData({ newComment:'' }); await this.reloadComments(); this.setData({ 'post.commented': true, 'post.commentCount': (this.data.post.commentCount||0)+1 }) } },
  
  async onLikeComment(e){
    e.stopPropagation && e.stopPropagation();
    const commentId = e.currentTarget.dataset.id;
    const app = getApp();
    let userId = (app&&app.globalData&&app.globalData.userInfo&& (app.globalData.userInfo.userId || app.globalData.userInfo.id)) || 0
    let userType = (app&&app.globalData&&app.globalData.userRole) || 'student'
    try{
      if(!userId){ const ui = require('../../../utils/auth').getUserInfo(); if(ui){ userId = ui.userId || ui.id || 0; userType = ui.role || userType } }
    }catch(_){}
    
    if(!userId || userId <= 0){
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const body = { userId, userType }
    const r = await api.likeComment(commentId, body)
    if(r&&r.success){
      const liked = !!(r.data&&r.data.liked);
      const delta = liked ? 1 : -1;
      const comments = (this.data.comments||[]).map(comment => 
        comment.id === commentId ? {
          ...comment, 
          liked, 
          likeCount: Math.max(0, (comment.likeCount||0) + delta)
        } : comment
      );
      this.setData({ comments })
    }
  },
  onReachBottom(){ if(this.data.comments.length < this.data.cTotal){ this.setData({ cPage: this.data.cPage+1 }, ()=> this.loadComments()) } },
  onPullDownRefresh(){ this.reloadComments().finally(()=> wx.stopPullDownRefresh()) }
})


