const api = require('../../../utils/api')

Page({
  data:{
    id: null,
    course: {},
    teacher: null
  },
  onLoad(options){
    const id = options && options.id ? Number(options.id) : null
    this.setData({ id })
    if(id){ this.loadDetail(id) }
  },
  async loadDetail(id){
    try{
      const res = await api.course.getDetail(id)
      const found = (res && res.success && res.data) ? res.data : {}
      const course = {
        id: found.id,
        title: found.title || '课程',
        coverFullUrl: this.toAbsolute(found.coverFullUrl || found.coverUrl),
        intro: found.intro || '',
        type: found.classType || found.type || '班课',
        startTime: this.formatDateTime(found.startTime) || '',
        remainText: (found.remainSeats!=null ? `${found.remainSeats}位` : '' )
      }
      let teacher = null
      if(found.teacherId){
        // TODO: 后端需提供课程->教师的详情接口，这里用搜索接口兜底
        const tRes = await api.search.teachers({ q:'', page:1, size:50 })
        const arr = (tRes && tRes.success && (tRes.data.items||tRes.data)) || []
        const t = arr.find(x=> String(x.id)===String(found.teacherId)) || null
        if(t){ teacher = {
          id: t.id,
          name: t.teacherName || t.name,
          avatarFull: this.toAbsolute(t.avatar),
          genderSymbol: t.gender===1?'♂':(t.gender===2?'♀':''),
          tags: Array.isArray(t.teacherTags)?t.teacherTags:[],
          subjectsText: Array.isArray(t.subjectsNameList)?t.subjectsNameList.join(' | '):'',
          brief: t.introduction || ''
        } }
      }
      this.setData({ course, teacher })
    }catch(e){ this.setData({ course:{}, teacher:null }) }
  },
  toAbsolute(url){ try{ if(!url) return ''; if(/^https?:\/\//.test(url)) return url; const app=getApp(); const base=(app&&app.globalData&&app.globalData.apiBaseUrl)?app.globalData.apiBaseUrl:require('../../../config/env').getCurrentEnv().apiBaseUrl.replace(/\/api$/, ''); return `${base}${url}` }catch(e){ return url } },
  
  // 格式化日期时间
  formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return ''
    try {
      const date = new Date(dateTimeStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    } catch (e) {
      return dateTimeStr
    }
  },
  goTeacher(){ const t=this.data.teacher; if(!t||!t.id) return; wx.navigateTo({ url:`/pages/teacher/homepage/homepage?teacherId=${t.id}` }) },
  buy(){
    const payload = encodeURIComponent(JSON.stringify({ course: this.data.course, teacher: this.data.teacher }))
    wx.navigateTo({ url: `/pages/order/checkout/checkout?data=${payload}` })
  }
})


