const request = require('../../../utils/request.js')

Page({
  data:{ bindCode:'', parents:[], avatarFull:'', inputCode:'' },
  onLoad(){ this.loadCode(); this.loadParents(); this.loadAvatar() },
  async loadCode(){
    try{ const res = await request.get('/mini/invite/bind-code'); if(res&&res.success){ this.setData({ bindCode: (res.data&&res.data.bindCode)||'' }) } }
    catch(e){ console.error('load bind code error:', e) }
  },
  async loadParents(){
    try{ const r = await request.get('/mini/parent/bind-list'); if(r&&r.success){ this.setData({ parents: r.data||[] }) } }
    catch(e){ console.error('load parents error:', e) }
  },
  loadAvatar(){ try{ const u=getApp().globalData.userInfo||{}; this.setData({ avatarFull: u.avatar||u.avatarFull||'' }) }catch(e){} }
  ,onCodeInput(e){ this.setData({ inputCode: (e.detail&&e.detail.value)||'' }) }
  ,async submitBind(){
    const code = (this.data.inputCode||'').trim()
    if(!code){ wx.showToast({ title:'请输入绑定码', icon:'none' }); return }
    try{
      const r = await request.post('/mini/invite/accept-bind', { code })
      if(r && r.success){ wx.showToast({ title:'绑定成功', icon:'success' }); this.loadParents() }
      else{ wx.showToast({ title:(r&&r.message)||'提交失败', icon:'none' }) }
    }catch(e){ console.error('submit bind error:', e); wx.showToast({ title:'网络错误', icon:'none' }) }
  }
})

