Page({
  data: {
    headerHeight: 0,
    formData: {
      bankCard: '',
      bankName: ''
    }
  },

  onLoad(options) {
    console.log('银行卡页面加载参数:', options)
    
    // 获取传递过来的银行卡信息
    if (options.bankCard) {
      this.setData({
        'formData.bankCard': decodeURIComponent(options.bankCard)
      })
    }
    
    if (options.bankName) {
      this.setData({
        'formData.bankName': decodeURIComponent(options.bankName)
      })
    }
  },

  // 自定义导航栏就绪回调
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({ 
      headerHeight: totalHeight 
    })
  },

  // 银行卡号输入
  onBankCardInput(e) {
    let value = e.detail.value
    
    // 只允许输入数字和空格
    value = value.replace(/[^\d\s]/g, '')
    
    // 格式化银行卡号（每4位加一个空格）
    value = value.replace(/\s/g, '') // 先去掉所有空格
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ') // 每4位数字后加空格
    
    // 限制最大长度（包含空格）
    if (value.length > 23) { // 19位数字 + 4个空格
      value = value.substring(0, 23)
    }
    
    this.setData({
      'formData.bankCard': value
    })
  },

  // 开户行输入
  onBankNameInput(e) {
    this.setData({
      'formData.bankName': e.detail.value
    })
  },

  // 表单验证
  validateForm() {
    const { bankCard, bankName } = this.data.formData
    
    if (!bankCard || !bankCard.trim()) {
      wx.showToast({
        title: '请填写银行卡号',
        icon: 'none'
      })
      return false
    }
    
    // 验证银行卡号格式（去掉空格后应为纯数字，且长度在16-19位之间）
    const cleanBankCard = bankCard.replace(/\s/g, '')
    if (!/^\d{16,19}$/.test(cleanBankCard)) {
      wx.showToast({
        title: '银行卡号格式不正确',
        icon: 'none'
      })
      return false
    }
    
    if (!bankName || !bankName.trim()) {
      wx.showToast({
        title: '请填写开户行',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 保存银行卡信息
  onSave() {
    if (!this.validateForm()) {
      return
    }
    
    // 获取当前页面栈
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] // 上一个页面
    
    if (prevPage) {
      // 调用上一个页面的回调方法，传递银行卡信息
      if (prevPage.onBankCardSaved) {
        const cleanBankCard = this.data.formData.bankCard.replace(/\s/g, '')
        prevPage.onBankCardSaved({
          bankCard: cleanBankCard,
          bankName: this.data.formData.bankName
        })
      }
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '银行卡信息',
      path: '/pages/teacher/bank-card/bank-card'
    }
  }
})
