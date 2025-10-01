const api = require('../../../api/community')

Page({
  data:{ keyword:'', fileType:'', items:[], pageNum:1, pageSize:10, total:0, loading:false },
  onLoad(){
    const auth = require('../../../utils/auth')
    const ui = auth.getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
    this.reload()
  },
  onShow(){
    const auth = require('../../../utils/auth')
    const ui = auth.getUserInfo()
    if (ui && ui.needRoleSelection){ wx.reLaunch({ url:'/pages/role-select/role-select' }); return }
  },
  onKeywordInput(e){ this.setData({ keyword: e.detail.value }) },
  onSearch(){ this.reload() },
  async reload(){ this.setData({ pageNum:1, items:[] }); await this.load() },
  async load(){ if(this.data.loading) return; this.setData({ loading:true })
    try{
      const r = await api.getResources({ keyword:this.data.keyword, fileType:this.data.fileType, pageNum:this.data.pageNum, pageSize:this.data.pageSize })
      if(r && r.success){
        const list=(r.data&&r.data.list)||[]; const total=(r.data&&r.data.total)||0;
        const normalized = list.map(it=>{
          const cover = this.toAbsolute(it.coverUrl || it.cover)
          const file = this.toAbsolute(it.fileUrl)
          return {
            ...it,
            coverUrl: cover || '/images/profile/doc-thumb-placeholder.png',
            fileUrl: file,
            displayTime: this.formatTime(it.createTime)
          }
        })
        const merged=(this.data.pageNum===1?[]:this.data.items).concat(normalized);
        this.setData({ items: merged, total })
      }
    }catch(e){} finally{ this.setData({ loading:false }) }
  },
  formatTime(ts){
    try{
      if(!ts) return ''
      let s=String(ts).replace('T',' ').replace('Z','').replace(/-/g,'/').trim()
      let d=new Date(s)
      if(isNaN(d.getTime())){ const m=String(ts).match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/); if(m){ d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)) } }
      if(isNaN(d.getTime())) return ts
      const y=d.getFullYear(), mm=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'), hh=String(d.getHours()).padStart(2,'0'), mi=String(d.getMinutes()).padStart(2,'0')
      return `${y}-${mm}-${dd} ${hh}:${mi}`
    }catch(e){ return ts||'' }
  },
  switchType(e){ const t=e.currentTarget.dataset.type||''; this.setData({ fileType:t }, ()=> this.reload()) },
  onReachBottom(){ if(this.data.items.length < this.data.total){ this.setData({ pageNum: this.data.pageNum+1 }, ()=> this.load()) } },
  onPullDownRefresh(){ this.reload().finally(()=> wx.stopPullDownRefresh()) },
  async onDownload(e){ 
    const url=this.toAbsolute(e.currentTarget.dataset.url); 
    const id=e.currentTarget.dataset.id; 
    if(!url){ 
      wx.showToast({ title:'无下载地址', icon:'none' }); 
      return 
    }
    
    // 记录下载次数
    try{ 
      await api.addResourceDownload?.(id)
    }catch(e){
      console.log('记录下载失败:', e)
    }
    
    // 开始下载
    wx.showLoading({ title: '下载中...' })
    wx.downloadFile({ 
      url, 
      success: res=>{
        wx.hideLoading()
        const fp=res.tempFilePath; 
        wx.openDocument({ 
          filePath: fp, 
          showMenu: true,
          success: () => {
            wx.showToast({ title: '打开成功', icon: 'success' })
          },
          fail: () => {
            wx.showToast({ title: '打开失败', icon: 'none' })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  }
  ,
  toAbsolute(url){
    if(!url) return ''
    if(/^https?:\/\//i.test(url)) return url
    try{
      const app = getApp()
      const base = (app && app.globalData && app.globalData.apiBaseUrl) || require('../../../config/env').getCurrentEnv().apiBaseUrl
      if(!base) return url
      if(url.startsWith('/')) return `${base}${url}`
      return `${base}/${url}`
    }catch(e){
      return url
    }
  }
})


