const request = require('../../../utils/request.js')

Page({
  data:{ headerHeight:0, inviteCode:'', inputCode:'', avatarFull:'' },
  onHeaderReady(e){ this.setData({ headerHeight: e.detail || 0 }) },
  onLoad(){ this.loadCode() },
  async loadCode(){
    try{
      const res = await request.get('/mini/invite/parent/bind-code')
      if(res && res.success){
        const d = res.data || {}
        this.setData({ inviteCode: d.bindCode || '', avatarFull: (getApp().globalData.userInfo && getApp().globalData.userInfo.avatar) || '' })
      }
    }catch(e){ console.error('load parent bind-code error:', e) }
  },
  onInputCode(e){
    // 仅保留数字并限制6位
    const raw = String(e.detail.value||'')
    const digits = raw.replace(/\D/g,'').slice(0,6)
    this.setData({ inputCode: digits })
  },
  async submitInvite(){
    if(!this.data.inputCode){ wx.showToast({ title: '请输入绑定码', icon: 'none' }); return }
    if(this.data.inputCode === this.data.inviteCode){ wx.showToast({ title: '不能填写自己的绑定码', icon: 'none' }); return }
    try{
      const res = await request.post('/mini/invite/accept-bind', { code: this.data.inputCode })
      if(res && res.success){
        wx.showToast({ title: '绑定成功', icon: 'success' })
      }else{
        wx.showToast({ title: (res && res.message) ? res.message : '绑定失败', icon:'none' })
      }
    }catch(e){ wx.showToast({ title: (e && e.message) ? e.message : '绑定失败', icon:'none' }) }
  }
})


