const request = require('../../../utils/request.js')

Page({
  data:{ headerHeight:0, inviteCode:'', inputCode:'', avatarFull:'' },
  onHeaderReady(e){ this.setData({ headerHeight: e.detail || 0 }) },
  onLoad(){ this.loadCode() },
  async loadCode(){
    try{
      const res = await request.get('/mini/invite/code')
      if(res && res.success){
        const d = res.data || {}
        this.setData({ inviteCode: d.inviteCode || '', avatarFull: (getApp().globalData.userInfo && getApp().globalData.userInfo.avatar) || '' })
      }
    }catch(e){ console.error('load code error:', e) }
  },
  onInputCode(e){ this.setData({ inputCode: (e.detail.value||'').trim().toUpperCase() }) },
  async submitInvite(){
    if(!this.data.inputCode){ wx.showToast({ title: '请输入邀请码', icon: 'none' }); return }
    if(this.data.inputCode === this.data.inviteCode){ wx.showToast({ title: '不能填写自己的邀请码', icon: 'none' }); return }
    try{
      const res = await request.post('/mini/invite/accept', { code: this.data.inputCode })
      if(res && res.success){
        wx.showToast({ title: '提交成功', icon: 'success' })
      }else{
        wx.showToast({ title: (res && res.message) ? res.message : '提交失败', icon:'none' })
      }
    }catch(e){
      wx.showToast({ title: (e && e.message) ? e.message : '提交失败', icon:'none' })
    }
  },
  goList(){
    // 暂无列表页，先用通用提示，或你提供页面后替换路径
    try{ wx.navigateTo({ url: '/pages/student/invite/list/list' }) }catch(e){ wx.showToast({ title:'列表页未就绪', icon:'none' }) }
  }
})

