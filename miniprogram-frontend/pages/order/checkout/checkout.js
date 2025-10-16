const request = require('../../../utils/request.js')

Page({
  data:{ 
    course:{}, 
    teacher:{}, 
    priceDisplay:'0.00',
    parents: [], // 绑定的家长列表
    selectedParent: null, // 选择的家长
    showParentSelector: false, // 是否显示家长选择器
    showParentPicker: false, // 是否显示家长选择弹窗
    mode: 'pay', // 页面模式: pay-支付模式, detail-查看订单模式
    order: {}, // 订单信息
    hasReviewed: false, // 是否已评价
    showEvaluateBtn: false // 是否显示评价按钮
  },

  // 学生端发起家长代付：弹出家长选择器
  async requestParentPay(){
    try{
      await this.loadBindParents()
      if((this.data.parents||[]).length===0){ 
        wx.showModal({
          title: '提示',
          content: '请先到我的-家长绑定中绑定家长',
          showCancel: false,
          confirmText: '知道了'
        })
        return 
      }
      this.setData({ showParentPicker:true, showParentSelector:true })
    }catch(e){ wx.showToast({ title:'加载家长失败', icon:'none' }) }
  },
  
  onLoad(options){
    try{
      const data = JSON.parse(decodeURIComponent(options.data||'%7B%7D'))
      
      if (data.mode) {
        // 从订单页面跳转过来的情况
        this.setData({ 
          mode: data.mode,
          order: data,
          course: { 
            title: data.courseName,
            coverFullUrl: data.coverUrlFull,
            price: data.actualAmount 
          },
          teacher: { 
            name: data.teacherName,
            avatarFull: data.teacherAvatarFull 
          },
          priceDisplay: (Number(data.actualAmount)||0).toFixed(2)
        })
        
        // 如果是查看订单模式且订单已完成，检查是否已评价
        if (data.mode === 'detail') {
          this.checkReviewStatus(data.id)
          this.loadRefundStatus(data.id)
        }
      } else {
        // 原来的课程购买流程
        const course = data.course || {}
        const teacher = data.teacher || {}
        this.setData({ 
          course, 
          teacher, 
          priceDisplay: (Number(course.price)||9900).toFixed(2),
          mode: 'pay'
        })
      }
      // 保存来源用户类型（影响是否显示支付按钮）
      const app = getApp()
      const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
      const role = (app && app.globalData && app.globalData.userRole) ? app.globalData.userRole : userInfo.role
      this.setData({ userType: role || 'student' })
    }catch(e){ 
      console.error('Parse data error:', e)
    }
  },

  onShow(){
    try{
      if (this.data.mode === 'detail' && this.data.order && this.data.order.id){
        this.loadRefundStatus(this.data.order.id)
      }
    }catch(e){}
  },

  // 加载绑定的家长列表
  async loadBindParents() {
    try {
      console.log('Loading bind parents...')
      // 注意：baseURL 已含 /api 前缀，这里应使用 /mini/ 开头
      const response = await request.get('/mini/parent/bind-list')

      console.log('Bind parents response:', response)

      if (response && response.success) {
        const parents = response.data || []
        // 如果有主要联系人，默认选择主要联系人
        const primaryParent = parents.find(p => p.isPrimary === 1)
        this.setData({
          parents,
          selectedParent: primaryParent || (parents.length > 0 ? parents[0] : null)
        })
        console.log('Selected parent:', this.data.selectedParent)
      } else {
        console.error('Failed to load bind parents:', response?.message)
      }
    } catch (error) {
      console.error('Load bind parents error:', error)
    }
  },

  // 隐藏家长选择器
  hideParentPicker() {
    this.setData({ 
      showParentPicker: false,
      showParentSelector: false 
    })
  },

  // 选择家长
  selectParent(e) {
    const parentId = e.currentTarget.dataset.parentid
    const parent = this.data.parents.find(p => p.parentId === parentId)
    if (parent) {
      this.setData({ 
        selectedParent: parent,
        showParentPicker: false,
        showParentSelector: false
      })
      console.log('Parent selected:', parent)
      
      // 选择家长后立即发送代付请求
      this.confirmPayment()
    }
  },

  // 支付 - 点击后先弹窗选择家长
  async pay(){
    // 家长点击立即支付：直接模拟支付，不再查询学生端的绑定家长
    try{
      wx.showLoading({ title:'支付中...' })
      // 更新订单状态为已支付
      const orderId = (this.data.order && this.data.order.id) ? this.data.order.id : null
      if(!orderId){ wx.hideLoading(); wx.showToast({ title:'订单信息缺失', icon:'none' }); return }
      const r = await request.post(`/mini/order/${orderId}/status`, { orderStatus: 2, paymentStatus: 1 })
      wx.hideLoading()
      if(r && r.success){
        wx.showToast({ title:'支付成功', icon:'success' })
        setTimeout(()=>{ wx.navigateTo({ url:'/pages/orders/orders?userType=parent' }) }, 1400)
      }else{
        wx.showToast({ title:(r&&r.message)||'支付失败', icon:'none' })
      }
    }catch(e){ wx.hideLoading(); wx.showToast({ title:'网络错误', icon:'none' }) }
  },

  // 确认代付请求
  async confirmPayment() {
    if (!this.data.selectedParent) {
      wx.showToast({
        title: '请选择代付家长',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '发送代付请求...' })
    
    try {
      // 调用后端API处理代付请求和学生报名
      const response = await request.post('/mini/course/enroll', {
        courseId: this.data.course.id,
        scheduleId: this.data.course.id, // 假设课程ID就是排课ID
        teacherId: this.data.teacher.id,
        parentId: this.data.selectedParent.parentId,
        amount: this.data.priceDisplay
      })

      wx.hideLoading()
      
      if (response && response.success) {
        wx.showModal({
          title: '代付请求已发送',
          content: `已向 ${this.data.selectedParent.parentName} 发送代付请求，请提醒家长支付订单`,
          showCancel: false,
          confirmText: '确定',
          success: () => {
            // 跳转到订单页面查看待支付状态
            wx.navigateTo({
              url: '/pages/orders/orders'
            })
          }
        })
      } else {
        throw new Error(response?.message || '代付请求失败')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('Payment error:', error)
      wx.showToast({
        title: error.message || '代付请求失败，请重试',
        icon: 'none'
      })
    }
  },

  // 详情页底部：取消订单（待付款）
  async cancelFromDetail(){
    const order = this.data.order || {}
    if(!order.id){ wx.showToast({ title:'无订单信息', icon:'none' }); return }
    try{
      const res = await wx.showModal({
        title: '取消订单',
        content: '',
        editable: true,
        placeholderText: '如：临时有事无法上课',
        confirmText: '提交',
        cancelText: '再想想'
      })
      if(!res.confirm) return
      const reason = (res.content||'').trim()
      wx.showLoading({ title:'取消中...' })
      const r = await request.post(`/mini/order/${order.id}/cancel`, { cancelReason: reason || '用户主动取消' })
      wx.hideLoading()
      if(r && r.success){ wx.showToast({ title:(r.message || '取消成功'), icon:'success' }); setTimeout(()=>{ wx.navigateBack() }, 1000) }
      else{ wx.showToast({ title:(r&&r.message)||'取消失败', icon:'none' }) }
    }catch(e){ wx.hideLoading(); wx.showToast({ title:'网络错误', icon:'none' }) }
  },

  // 检查订单是否已评价（统一调用方式）
  async checkReviewStatus(orderId) {
    try {
      const response = await request.get(`/mini/review/check/${orderId}`)
      if (response && response.success) {
        this.setData({
          hasReviewed: response.data.hasReviewed,
          showEvaluateBtn: !response.data.hasReviewed
        })
      }
    } catch (error) {
      console.error('Check review status error:', error)
      this.setData({ showEvaluateBtn: true })
    }
  },

  async loadRefundStatus(orderId){
    try{
      const r = await request.get('/mini/refund/status', { orderId })
      if(r && r.success){
        const rs = r.data || {}
        // 计算时间轴节点
        const tl = []
        const fmt = (ts)=>{
          try{
            if(!ts) return ''
            let str = String(ts).replace('T',' ').replace('Z','').replace(/-/g,'/')
            let d = new Date(str)
            if (isNaN(d.getTime())){
              const m = String(ts).match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/)
              if(m) d = new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +(m[6]||0))
            }
            if (isNaN(d.getTime())) return ''
            return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
          }catch(e){ return '' }
        }
        if(rs.createTime){ tl.push({ time: fmt(rs.createTime), label: '申请退款', active: true }) }
        if(rs.status==='processing' || rs.status==='completed'){
          tl.push({ time: fmt(rs.updateTime), label: '退款中', active: rs.status!=='applied' })
        }
        if(rs.status==='completed'){
          tl.push({ time: fmt(rs.updateTime), label: '退款完成', active: true })
        }
        const hasActiveRefund = !!(rs && rs.status && rs.status !== 'revoked')
        this.setData({ refundStatus: rs, refundTimeline: tl, hasActiveRefund })
      } else {
        this.setData({ refundStatus: {}, refundTimeline: [], hasActiveRefund: false })
      }
    }catch(e){}
  },

  goRefundApply(){
    const order = {
      ...this.data.order,
      coverFullUrl: this.data.course && this.data.course.coverFullUrl ? this.data.course.coverFullUrl : this.data.order.coverUrlFull
    }
    wx.navigateTo({ url:`/pages/order/refund-apply/refund-apply?data=${encodeURIComponent(JSON.stringify(order))}` })
  },

  async revokeRefund(){
    try{
      const orderId = (this.data.order && this.data.order.id) ? this.data.order.id : null
      if(!orderId){ wx.showToast({ title:'订单信息缺失', icon:'none' }); return }
      const confirm = await wx.showModal({ title:'确认撤回', content:'是否撤回该售后申请？', confirmText:'撤回', cancelText:'取消' })
      if(!confirm.confirm) return
      const r = await request.post(`/mini/refund/${orderId}/revoke`, {})
      if(r && r.success){ wx.showToast({ title:'撤回成功', icon:'success' }); this.loadRefundStatus(orderId) }
      else{ wx.showToast({ title:(r&&r.message)||'撤回失败', icon:'none' }) }
    }catch(e){ wx.showToast({ title:'网络错误', icon:'none' }) }
  },

  // 去评价
  goToReview() {
    const order = this.data.order
    wx.navigateTo({
      url: `/pages/order/review/review?orderId=${order.id}&teacherId=${order.teacherId}&courseName=${encodeURIComponent(order.courseName)}`
    })
  }
})


