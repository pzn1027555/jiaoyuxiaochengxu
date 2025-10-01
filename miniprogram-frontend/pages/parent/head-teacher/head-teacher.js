const request = require('../../../utils/request.js')

Page({
  data:{ list:[] },
  onLoad(){ this.load() },
  async load(){
    try{
      // 获取家长绑定的学生
      const s = await request.get('/mini/parent/students')
      if(!(s&&s.success)){ wx.showToast({ title:(s&&s.message)||'加载失败', icon:'none' }); return }
      const students = s.data || []
      const items = []
      for(const st of students){
        // 对每个学生调用学生端接口，拿其班主任（若未绑定则自动分配）
        const ht = await request.get('/mini/head-teacher/my', { studentId: st.studentId })
        const d = (ht&&ht.success) ? (ht.data||{}) : {}
        const url = this.toAbsolute(d.wechatQrUrl || d.qrcodeUrl || '')
        items.push({ studentId: st.studentId, studentName: st.studentName, phone: d.phone||'', wechatQrUrlFull: url })
      }
      this.setData({ list: items })
    }catch(e){ console.error('load parent head-teachers error:', e); wx.showToast({ title:'网络错误', icon:'none' }) }
  },
  toAbsolute(url){
    const { toAbsolute } = require('../../../utils/urlUtils')
    return toAbsolute(url, 'static')
  }
})


