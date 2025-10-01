// miniprogram-frontend/pages/orders/orders.js
const api = require('../../utils/request.js')

Page({
  data: {
    currentTab: 0,
    tabs: ['全部', '待付款', '待评价', '已完成', '售后'],
    orders: {
      loading: false,
      list: [],
      allList: [],
      pageNum: 1,
      pageSize: 10,
      hasMore: true,
      total: 0
    }
  },

  onLoad(options) {
    console.log('Orders page loaded with options:', options)
    
    // 确保导航栏有返回按钮（防止从某些页面reLaunch过来时没有返回按钮）
    wx.setNavigationBarTitle({
      title: '我的订单'
    })
    
    // 保存进入来源的用户类型（student/parent），默认student
    const userType = (options && options.userType) ? options.userType : 'student'
    this.setData({ userType })
    this.loadOrders()
  },

  // 自定义返回按钮处理
  onNavigationBarButtonTap() {
    // 返回到家长profile页面而非历史返回
    wx.navigateTo({
      url: '/pages/parent/profile/profile'
    })
  },

  onPullDownRefresh() {
    this.refreshOrders()
  },

  onReachBottom() {
    this.loadMoreOrders()
  },

  // 切换页签
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    console.log('Switch tab to index:', index)
    this.setData({ 
      currentTab: index,
      'orders.list': [],
      'orders.pageNum': 1,
      'orders.hasMore': true
    })
    this.applyFilter()
  },

  // 加载订单列表
  async loadOrders() {
    if (this.data.orders.loading) return

    try {
      this.setData({ 'orders.loading': true })

      const { pageNum, pageSize } = this.data.orders
      console.log('Loading orders, pageNum:', pageNum, 'pageSize:', pageSize)

      const response = await api.get('/mini/order/list', {
        pageNum,
        pageSize,
        userType: this.data.userType
      })

      console.log('Orders API response:', response)

      if (response && response.success) {
        const { orders = [], total = 0, totalPages = 0 } = response.data || {}
        
        // 处理数据
        const processedOrders = orders.map(order => ({
          ...order,
          createTimeFormatted: this.formatTime(order.createTime),
          payTimeFormatted: order.payTime ? this.formatTime(order.payTime) : '',
          statusColor: this.getStatusColor(order.orderStatus),
          orderStatusText: this.getStatusText(order.orderStatus),
          actions: this.getOrderActions(order),
          teacherAvatarFull: this.toAbsolute(order.teacherAvatar),
          studentAvatarFull: this.toAbsolute(order.studentAvatar),
          courseTypeText: this.getCourseTypeText(order.courseType),
          coverUrlFull: !order.coverUrl ? '/images/sijiaokecheng.jpeg' : this.toAbsolute(order.coverUrl)
        }))

        const mergedAll = pageNum === 1 ? processedOrders : [...(this.data.orders.allList||[]), ...processedOrders]
        this.setData({
          'orders.allList': mergedAll,
          'orders.total': total,
          'orders.hasMore': pageNum < totalPages
        })
        this.applyFilter()
      } else {
        wx.showToast({
          title: response?.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('Load orders error:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ 'orders.loading': false })
      wx.stopPullDownRefresh()
    }
  },

  // 加载更多
  loadMoreOrders() {
    if (!this.data.orders.hasMore || this.data.orders.loading) return
    
    this.setData({ 'orders.pageNum': this.data.orders.pageNum + 1 })
    this.loadOrders()
  },

  // 刷新数据
  refreshOrders() {
    this.setData({
      'orders.list': [],
      'orders.allList': [],
      'orders.pageNum': 1,
      'orders.hasMore': true
    })
    this.loadOrders()
  },

  // 应用顶部页签筛选
  applyFilter() {
    const all = this.data.orders.allList || []
    const tab = this.data.currentTab
    let filtered = all
    switch (tab) {
      case 1: // 待付款
        filtered = all.filter(o => o.orderStatus === 1)
        break
      case 2: // 待评价（已支付且未评价）
        filtered = all.filter(o => (o.orderStatus === 2 || o.orderStatus === 3) && !o.hasReviewed)
        break
      case 3: // 已完成（已评价）
        filtered = all.filter(o => (o.orderStatus === 3) && !!o.hasReviewed)
        break
      case 4: // 售后（已取消、已退款或售后中）
        filtered = all.filter(o => o.orderStatus === 4 || o.orderStatus === 5 || o.orderStatus === 6)
        break
      default: // 全部
        filtered = all
    }
    this.setData({ 'orders.list': filtered })
  },

  // 订单操作
  onOrderAction(e) {
    const { action, orderid } = e.currentTarget.dataset
    console.log('Order action:', action, 'orderId:', orderid)

    switch (action) {
      case 'pay':
        this.payOrder(orderid)
        break
      case 'cancel':
        this.cancelOrder(orderid)
        break
      case 'evaluate':
        this.evaluateOrder(orderid)
        break
      case 'viewReview':
        this.viewReview(orderid)
        break
      case 'detail':
        this.viewOrderDetail(orderid)
        break
      default:
        console.log('Unknown action:', action)
    }
  },

  // 支付订单
  payOrder(orderId) {
    console.log('Pay order:', orderId)
    const order = this.data.orders.list.find(item => item.id === orderId)
    if (order) {
      const orderData = {
        ...order,
        mode: 'pay'
      }
      wx.navigateTo({
        url: `/pages/order/checkout/checkout?data=${encodeURIComponent(JSON.stringify(orderData))}`
      })
    }
  },

  // 取消订单（弹窗输入原因）
  async cancelOrder(orderId) {
    try {
      const res = await wx.showModal({
        title: '取消订单',
        content: '',
        editable: true,
        placeholderText: '如：临时有事无法上课',
        confirmText: '提交',
        cancelText: '再想想'
      })

      if (!res.confirm) return
      const reason = (res.content || '').trim()

      wx.showLoading({ title: '取消中...' })

      const response = await api.post(`/mini/order/${orderId}/cancel`, {
        cancelReason: reason || '用户主动取消'
      })

      wx.hideLoading()

      if (response && response.success) {
        wx.showToast({
          title: (response.message || '取消成功'),
          icon: 'success'
        })
        this.refreshOrders()
      } else {
        wx.showToast({
          title: response?.message || '取消失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('Cancel order error:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    }
  },

  // 评价订单
  evaluateOrder(orderId) {
    console.log('Evaluate order:', orderId)
    const order = this.data.orders.list.find(item => item.id === orderId)
    if (order) {
      wx.navigateTo({
        url: `/pages/order/review/review?orderId=${order.id}&teacherId=${order.teacherId}&courseName=${encodeURIComponent(order.courseName)}`
      })
    }
  },

  // 查看评价（只读）
  viewReview(orderId) {
    const order = this.data.orders.list.find(item => item.id === orderId)
    if (order) {
      wx.navigateTo({
        url: `/pages/order/review/review?orderId=${order.id}&teacherId=${order.teacherId}&courseName=${encodeURIComponent(order.courseName)}&readonly=1`
      })
    }
  },

  // 查看订单详情
  viewOrderDetail(orderId) {
    console.log('View order detail:', orderId)
    const order = this.data.orders.list.find(item => item.id === orderId)
    if (order) {
      const orderData = {
        ...order,
        mode: 'detail'
      }
      wx.navigateTo({
        url: `/pages/order/checkout/checkout?data=${encodeURIComponent(JSON.stringify(orderData))}`
      })
    }
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 获取状态颜色
  getStatusColor(status) {
    switch (status) {
      case 1: return '#ff6b35' // 待付款
      case 2: return '#4CAF50' // 已支付
      case 3: return '#2196F3' // 已完成
      case 4: return '#9E9E9E' // 已取消
      case 5: return '#FF5722' // 已退款
      case 6: return '#FF9800' // 售后中
      default: return '#9E9E9E'
    }
  },

  // 获取状态文本
  getStatusText(status) {
    switch (status) {
      case 1: return '待付款'
      case 2: return '已支付'
      case 3: return '已完成'
      case 4: return '已取消'
      case 5: return '已退款'
      case 6: return '售后中'
      default: return '未知状态'
    }
  },

  // 获取订单操作按钮
  getOrderActions(order) {
    const actions = []
    
    switch (order.orderStatus) {
      case 1: // 待付款
        actions.push({ text: '取消订单', action: 'cancel', type: 'default' })
        if (this.data.userType === 'parent') {
          actions.push({ text: '立即支付', action: 'pay', type: 'primary' })
        }
        break
      case 2: // 已支付
        actions.push({ text: '查看订单', action: 'detail', type: 'default' })
        break
      case 3: // 已完成
        if (order.hasReviewed) {
          actions.push({ text: '查看评价', action: 'viewReview', type: 'default' })
        } else {
          actions.push({ text: '去评价', action: 'evaluate', type: 'default' })
        }
        actions.push({ text: '查看订单', action: 'detail', type: 'default' })
        break
      case 4: // 已取消
      case 5: // 已退款
      case 6: // 售后中
        actions.push({ text: '查看订单', action: 'detail', type: 'default' })
        break
      default:
        actions.push({ text: '查看订单', action: 'detail', type: 'default' })
    }
    
    return actions
  },

  // 处理头像URL（参考profile页面逻辑）
  toAbsolute(url) {
    try {
      if (!url) return ''
      if (url.startsWith('http')) return url
      const app = getApp()
      const { getApiBaseUrl } = require('../../config/env')
      const base = (app && app.globalData && app.globalData.apiBaseUrl) ? app.globalData.apiBaseUrl : getApiBaseUrl().replace(/\/api$/, '')
      return `${base}${url}`
    } catch (e) {
      return url || ''
    }
  },

  // 获取课程类型文本
  getCourseTypeText(courseType) {
    if (courseType === 'one_to_one' || courseType === 'trial') {
      return '1对1'
    } else {
      return '班课'
    }
  }
})