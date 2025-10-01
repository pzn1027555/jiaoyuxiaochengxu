// pages/parent/recharge/recharge.js
const accountApi = require('../../../api/account')

Page({
  data: {
    headerHeight: 0,
    amount: '',
    payMethod: 'wechat',
    submitting: false
  },

  onHeaderReady(e){
    const { totalHeight } = e.detail || {}
    if (totalHeight) this.setData({ headerHeight: totalHeight })
  },

  onAmountInput(e){
    const val = e.detail.value.replace(/[^\d.]/g, '')
    this.setData({ amount: val })
  },

  selectWechat(){ this.setData({ payMethod: 'wechat' }) },

  async onSubmit(){
    if (this.data.submitting) return
    const amountNum = Number(this.data.amount)
    if (!amountNum || amountNum <= 0){
      wx.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try{
      // 模拟支付：调用后端模拟充值接口，后端写入充值流水并更新余额
      const storageUser = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || {}
      const phone = storageUser.phone || storageUser?.parent_info?.phone || storageUser?.student_info?.phone || storageUser?.teacher_info?.phone
      const res = await accountApi.parentRechargeSimulate({ amount: amountNum, ...(phone?{ phone }: {}) })
      if (res && res.success){
        wx.showToast({ title: '充值成功', icon: 'success' })
        setTimeout(()=>{ wx.navigateBack() }, 600)
      }else{
        wx.showToast({ title: res && res.message || '充值失败', icon: 'none' })
      }
    }catch(e){
      wx.showToast({ title: '充值失败', icon: 'none' })
    }finally{
      this.setData({ submitting: false })
    }
  }
})


