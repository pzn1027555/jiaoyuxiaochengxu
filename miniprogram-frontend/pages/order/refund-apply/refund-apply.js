const request = require('../../../utils/request')

Page({
  data:{ order:{}, reason:'' },
  onLoad(options){ try{ const d = JSON.parse(decodeURIComponent(options.data||'%7B%7D')); this.setData({ order:d||{} }) }catch(e){} },
  onReasonInput(e){ this.setData({ reason: (e.detail.value||'').trim() }) },
  async submit(){
    const reason = (this.data.reason||'').trim()
    if(!reason){ wx.showToast({ title:'请填写申请原因', icon:'none' }); return }
    try{
      wx.showLoading({ title:'提交中...' })
      const r = await request.post('/mini/refund/apply', { orderId: this.data.order.id, refundType: 'refund', reason })
      wx.hideLoading()
      if(r && r.success){ wx.showToast({ title:'提交成功', icon:'success' }); setTimeout(()=>{ wx.navigateBack() }, 600) }
      else{ wx.showToast({ title:(r&&r.message)||'提交失败', icon:'none' }) }
    }catch(e){ wx.hideLoading(); wx.showToast({ title:'网络错误', icon:'none' }) }
  }
})


