const request = require('../../../utils/request.js')

Page({
  data:{ bindCode:'', students:[], avatarFull:'', inputCode:'' },
  onLoad(){ this.loadCode(); this.loadStudents(); this.loadAvatar() },
  async loadCode(){
    try{ const res = await request.get('/mini/invite/parent/bind-code'); if(res&&res.success){ this.setData({ bindCode: (res.data&&res.data.bindCode)||'' }) } }
    catch(e){ console.error('load parent bind code error:', e) }
  },
  async loadStudents(){
    try{ const r = await request.get('/mini/parent/students'); if(r&&r.success){ this.setData({ students: r.data||[] }) } }
    catch(e){ console.error('load students error:', e) }
  },
  loadAvatar(){ try{ const u=getApp().globalData.userInfo||{}; this.setData({ avatarFull: u.avatar||u.avatarFull||'' }) }catch(e){} },
  onCodeInput(e){ this.setData({ inputCode: (e.detail&&e.detail.value)||'' }) },
  async submitBind(){
    const code = (this.data.inputCode||'').trim()
    if(!code){ wx.showToast({ title:'请输入绑定码', icon:'none' }); return }
    try{
      const r = await request.post('/mini/invite/accept-bind', { code })
      if(r && r.success){ wx.showToast({ title:'绑定成功', icon:'success' }); this.loadStudents() }
      else{ wx.showToast({ title:(r&&r.message)||'提交失败', icon:'none' }) }
    }catch(e){ console.error('submit bind error:', e); wx.showToast({ title:'网络错误', icon:'none' }) }
  }
})


