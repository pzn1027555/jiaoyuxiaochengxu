const api = require('../../utils/api')

Page({
  data:{
    type: 'teacher', // teacher | course
    keyword: '',
    mode: 'history', // history | result
    historyKey: 'search_history_general',
    history: [],
    teachers: [],
    courses: []
  },
  onLoad(options){
    const type = (options && options.type) || 'teacher'
    this.setData({ type })
    this.loadHistory()
  },
  loadHistory(){
    try{ const arr = wx.getStorageSync(this.data.historyKey) || []; this.setData({ history: arr }) }catch(e){}
  },
  saveHistory(word){
    try{ if(!word) return; const arr = wx.getStorageSync(this.data.historyKey) || []; const i = arr.indexOf(word); if(i>=0) arr.splice(i,1); arr.unshift(word); if(arr.length>10) arr.pop(); wx.setStorageSync(this.data.historyKey, arr); this.setData({ history: arr }) }catch(e){}
  },
  clearHistory(){ try{ wx.removeStorageSync(this.data.historyKey); this.setData({ history: [] }) }catch(e){} },
  tapHistory(e){ const key = e.currentTarget.dataset.key; this.setData({ keyword: key }, ()=> this.onSearch()) },
  onInput(e){ this.setData({ keyword: e.detail.value }) },
  async onSearch(){
    const kw = (this.data.keyword||'').trim(); if(!kw){ this.setData({ mode:'history' }); return }
    this.saveHistory(kw)
    this.setData({ mode:'result' })
    if(this.data.type==='teacher'){
      const res = await api.search.teachers({ q: kw, page:1, size:50 })
      const items = (res && res.success && (res.data.items||res.data.records||res.data)) || []
      const toAbs = this.toAbsolute
      const map = (t)=>({
        id: t.id,
        name: t.teacherName || t.name || '',
        avatar: toAbs(t.avatar),
        genderSymbol: t.gender===1?'♂':(t.gender===2?'♀':''),
        district: t.district || '',
        tags: Array.isArray(t.teacherTags) ? t.teacherTags : (typeof t.teacherTags==='string'?JSON.parseSafe(t.teacherTags):[]),
        subjectsText: Array.isArray(t.subjectsNameList)?t.subjectsNameList.join(' | '):'',
        intro: t.introduction || '',
        price: (t.hourlyRate!=null?t.hourlyRate:0)
      })
      this.setData({ teachers: items.map(map) })
    }else{
      const res = await api.course.getList({ page:1, size:50, keyword: kw })
      const items = (res && res.success && (res.data.items||res.data.records||res.data)) || []
      const toAbs = this.toAbsolute
      const list = items.map(it=> ({ id: it.id, title: it.title, coverUrl: it.coverUrl, coverFullUrl: toAbs(it.coverFullUrl || it.coverUrl), intro: it.intro || '', tags: (typeof it.courseTags === 'string' ? JSON.parseSafe(it.courseTags) : (it.courseTags||[])) }))
      this.setData({ courses: list })
    }
  },
  goTeacher(e){ const id = e.currentTarget.dataset.id; if(!id) return; wx.navigateTo({ url:`/pages/teacher/homepage/homepage?teacherId=${id}` }) },
  goCourse(e){ const id = e.currentTarget.dataset.id; if(!id) return; wx.navigateTo({ url:`/pages/course/detail/detail?id=${id}` }) },

  toAbsolute(url){
    try{
      if(!url) return ''
      if(typeof url==='string' && (url.startsWith('http://')||url.startsWith('https://'))) return url
      const app = getApp();
      const base = (app&&app.globalData&&app.globalData.apiBaseUrl) ? app.globalData.apiBaseUrl : require('../../config/env').getCurrentEnv().apiBaseUrl.replace(/\/api$/, '')
      return `${base}${url}`
    }catch(e){ return url }
  }
})


