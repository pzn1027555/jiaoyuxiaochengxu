const request = require('../../../../utils/request.js')

Page({
  data:{ list:[] },
  onLoad(){ this.load() },
  async load(){
    try{ const r = await request.get('/mini/invite/list'); if(r&&r.success){ this.setData({ list: r.data||[] }) } }
    catch(e){ console.error('load invite list error:', e) }
  }
})


