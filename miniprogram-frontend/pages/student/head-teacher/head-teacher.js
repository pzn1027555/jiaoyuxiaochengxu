const request = require('../../../utils/request.js')

Page({
  data:{ qrUrl:'', name:'', phone:'' },
  onLoad(){ this.load() },
  onPullDownRefresh(){ this.load().finally(() => wx.stopPullDownRefresh()) },
  async load(){
    try{
      const r = await request.get('/mini/head-teacher/my')
      if(r && r.success){
        const d = r.data || {}
        this.setData({
          qrUrl: this.toAbsolute(d.wechatQrUrl || ''),
          name: d.name || '',
          phone: d.phone || ''
        })
      } else {
        wx.showToast({ title: (r&&r.message)||'加载失败', icon:'none' })
      }
    }catch(e){
      console.error('load head-teacher error:', e)
      wx.showToast({ title: '网络错误', icon:'none' })
    }
  },
  toAbsolute(url){
    const { toAbsolute } = require('../../../utils/urlUtils')
    return toAbsolute(url, 'static')
  }
})

