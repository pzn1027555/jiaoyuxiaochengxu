// miniprogram-frontend/pages/student/booking/booking.js
const { request } = require('../../../utils/request.js')

Page({
  data: {
    teacherId: null,
    teacherInfo: {},
    headerHeight: 0,
    
    // 日历相关
    year: 0,
    month: 0,
    days: [],
    selectedDate: '',
    
    // 教师课程安排数据（用于判断哪些日期有课，哪些时间段有课）
    teacherSchedule: {},
    
    // 固定的三个时间段
    fixedTimeSlots: [
      {
        id: 'morning',
        name: '早上',
        startTime: '08:30',
        endTime: '12:00',
        duration: 210 // 分钟
      },
      {
        id: 'afternoon', 
        name: '下午',
        startTime: '13:30',
        endTime: '18:00',
        duration: 270 // 分钟
      },
      {
        id: 'evening',
        name: '晚上', 
        startTime: '19:00',
        endTime: '22:00',
        duration: 180 // 分钟
      }
    ],
    
    // 当前可用的时间段
    availableTimeSlots: [],
    loading: false,
    
    // 预约弹窗
    showBookingModal: false,
    selectedTimeSlot: null,
    
    // 时间选择（改为原生 time picker）
    selectedTime: '',
    timePickerStart: '08:00',
    timePickerEnd: '22:00',
    
    // 时长选择相关
    selectedDuration: 'trial',
    durationOptions: [
      { id: 'trial', name: '40分钟', type: 'trial', price: 9.9 },
      { id: 'formal', name: '2小时', type: 'formal', price: 0 }
    ],
    
    // 试听价格
    trialPrice: 9.9
  },

  // 准备家长代付流程（弹出选择器并加载家长列表）
  async prepareParentPay(){
    try{
      const { request } = require('../../../utils/request.js')
      // 复用 checkout 页面的接口：/mini/parent/bind-list
      const res = await request.get('/mini/parent/bind-list')
      if(res && res.success){
        const parents = res.data || []
        const primary = parents.find(p=>p.isPrimary===1)
        this.setData({ parents, selectedParent: primary || (parents[0]||null), showParentPicker: true })
      }else{
        wx.showToast({ title: (res&&res.message)||'未查询到绑定家长', icon:'none' })
      }
    }catch(e){ wx.showToast({ title:'加载家长失败', icon:'none' }) }
  },

  hideParentPicker(){ this.setData({ showParentPicker:false }) },
  selectParent(e){
    const parentId = e.currentTarget.dataset.parentid
    const parent = (this.data.parents||[]).find(p=>p.parentId===parentId)
    if(parent){ this.setData({ selectedParent: parent, showParentPicker:false }); this.sendParentPay(parent) }
  },

  // 发送家长代付请求（占位：调用下单接口创建一笔待支付订单并通知家长）
  async sendParentPay(parent){
    try{
      const api = require('../../../utils/api')
      // 创建“试听预约代付订单”，关键字段走订单表，扩展信息放 remark(JSON)
      const payload = {
        teacherId: parseInt(this.data.teacherId),
        courseName: '试听预约',
        courseType: 'trial',
        lessonCount: 1,
        unitPrice: Number(this.data.trialPrice),
        totalAmount: Number(this.data.trialPrice),
        actualAmount: Number(this.data.trialPrice),
        paymentMethod: 'wechat',
        remark: JSON.stringify({
          orderType: 'trial_booking',
          parentId: parent.parentId,
          date: this.data.selectedDate,
          time: this.data.selectedTime
        })
      }
      const r = await api.order.create(payload)
      if(r && r.success){ wx.showToast({ title:'已通知家长付款', icon:'success' }) }
      else{ wx.showToast({ title:(r&&r.message)||'创建代付订单失败', icon:'none' }) }
    }catch(e){ wx.showToast({ title:'网络错误', icon:'none' }) }
  },

  onLoad(options) {
    const teacherId = options.teacherId
    if (!teacherId) {
      wx.showToast({
        title: '缺少教师信息',
        icon: 'none'
      })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ teacherId })
    
    // 初始化日历（从明天开始）
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 明天
    this.setData({ 
      year: tomorrow.getFullYear(), 
      month: tomorrow.getMonth() + 1 
    })
    this.buildMonth(tomorrow.getFullYear(), tomorrow.getMonth() + 1)
    this.setSelected(this.dateToStr(tomorrow))
    
    // 加载教师信息和课程安排
    this.loadTeacherInfo()
    this.loadTeacherSchedule()
    this.loadLessonPrice()
  },

  async loadLessonPrice(){
    try{
      const api = require('../../../utils/api')
      const res = await api.lessonPrice.current()
      if(res && (res.success || res.code===200) && res.data && res.data.price!=null){
        const price = Number(res.data.price)
        // 覆盖试听与正式课单价（试听保持原价9.9不变，这里仅设置正式课参考价）
        const opts = (this.data.durationOptions||[]).map(o=> o.id==='formal' ? ({...o, price}) : o)
        this.setData({ durationOptions: opts })
      }
    }catch(e){}
  },

  // onHeaderReady(e) {
  //   this.setData({ headerHeight: e.detail.totalHeight || 0 })
  // },

  // 加载教师信息
  async loadTeacherInfo() {
    try {
      console.log('Loading teacher info for:', this.data.teacherId)
      
      // 这里可以调用获取教师详情的接口
      // 暂时使用占位数据
      const teacherInfo = {
        id: this.data.teacherId,
        name: '教师姓名',
        avatar: '/images/default-avatar.png',
        subjects: 'AP经济 | NEC经济竞赛'
      }
      
      this.setData({ teacherInfo })
    } catch (error) {
      console.error('Load teacher info error:', error)
    }
  },

  // 加载教师课程安排数据
  async loadTeacherSchedule() {
    try {
      console.log('Loading teacher schedule for teacher:', this.data.teacherId)
      
      // 这里应该调用后端接口获取教师的课程安排
      // 暂时使用模拟数据
      const teacherSchedule = {
        // 格式：日期 -> 时间段数组
        '2025-07-01': ['morning', 'afternoon'], // 有早上和下午的课
        '2025-07-03': ['evening'], // 有晚上的课
        '2025-07-05': ['morning'], // 有早上的课
        '2025-07-10': ['afternoon', 'evening'], // 有下午和晚上的课
        // 可以继续添加更多日期...
      }
      
      this.setData({ teacherSchedule })
      
      // 重新构建日历以显示有课日期的标记
      this.buildMonth(this.data.year, this.data.month)
      
      // 更新当前选中日期的可用时间段
      this.updateAvailableTimeSlots()
      
    } catch (error) {
      console.error('Load teacher schedule error:', error)
      wx.showToast({
        title: '加载课程安排失败',
        icon: 'none'
      })
    }
  },

  // 日历相关方法
  dateToStr(d) {
    const y = d.getFullYear()
    const m = ('0' + (d.getMonth() + 1)).slice(-2)
    const da = ('0' + d.getDate()).slice(-2)
    return `${y}-${m}-${da}`
  },

  buildMonth(year, month) {
    const first = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const res = []
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month - 1, i)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      currentDate.setHours(0, 0, 0, 0)
      
      // 构建日期字符串
      const dateStr = `${year}-${('0' + month).slice(-2)}-${('0' + i).slice(-2)}`
      
      // 检查该日期是否有课程安排
      const hasClass = this.data.teacherSchedule[dateStr] && this.data.teacherSchedule[dateStr].length > 0
      
      res.push({ 
        date: i, 
        isCurrent: true, 
        selected: false, 
        isToday: currentDate.getTime() === today.getTime(),
        isPast: currentDate.getTime() <= today.getTime(), // 今天和过去都不可选
        hasClass: hasClass // 是否有课程安排
      })
    }
    
    this.setData({ days: res })
  },

  setSelected(dateStr) {
    const d = new Date(dateStr.replace(/-/g, '/'))
    const sel = d.getDate()
    const selectedYear = d.getFullYear()
    const selectedMonth = d.getMonth() + 1
    
    // 只有在选中日期的年月与当前显示的年月一致时才设置选中状态
    const isCurrentMonth = selectedYear === this.data.year && selectedMonth === this.data.month
    
    const days = this.data.days.map((x, idx) => ({ 
      ...x, 
      selected: isCurrentMonth && (idx + 1) === sel 
    }))
    this.setData({ days, selectedDate: dateStr })
    
    // 更新该日期的可用时间段
    this.updateAvailableTimeSlots()
  },

  // 更新当前选中日期的可用时间段
  updateAvailableTimeSlots() {
    const { selectedDate, teacherSchedule, fixedTimeSlots } = this.data
    
    if (!selectedDate) {
      this.setData({ availableTimeSlots: [] })
      return
    }
    
    // 获取该日期教师的课程安排
    const busySlots = teacherSchedule[selectedDate] || []
    
    // 过滤出可用的时间段（没有被占用的时间段）
    const availableTimeSlots = fixedTimeSlots.filter(slot => {
      return !busySlots.includes(slot.id)
    }).map(slot => ({
      ...slot,
      status: 'available',
      type: 'trial'
    }))
    
    console.log('Selected date:', selectedDate)
    console.log('Busy slots:', busySlots)
    console.log('Available slots:', availableTimeSlots)
    
    this.setData({ availableTimeSlots })
  },

  prevMonth() {
    let { year, month } = this.data
    month--
    if (month === 0) {
      month = 12
      year--
    }
    this.setData({ year, month })
    this.buildMonth(year, month)
  },

  nextMonth() {
    let { year, month } = this.data
    month++
    if (month === 13) {
      month = 1
      year++
    }
    this.setData({ year, month })
    this.buildMonth(year, month)
  },

  onSelectDay(e) {
    const idx = e.currentTarget.dataset.index
    const day = idx + 1
    const y = this.data.year
    const m = ('0' + this.data.month).slice(-2)
    const d = ('0' + day).slice(-2)
    const ds = `${y}-${m}-${d}`
    
    // 检查是否是过去的日期
    const selectedDate = new Date(y, this.data.month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate.getTime() <= today.getTime()) {
      wx.showToast({
        title: '只能预约明天及以后的日期',
        icon: 'none'
      })
      return
    }
    
    this.setSelected(ds)
  },

  // 预约试听
  onBookTrial(e) {
    const slotId = e.currentTarget.dataset.slotid
    const timeSlot = this.data.availableTimeSlots.find(slot => slot.id === slotId)
    
    if (!timeSlot) return
    
    if (timeSlot.status !== 'available') {
      wx.showToast({
        title: '该时间段不可预约',
        icon: 'none'
      })
      return
    }
    
    // 同步限制 time-picker 的 start/end
    const tpStart = timeSlot.startTime || '08:00'
    const tpEnd = timeSlot.endTime || '22:00'
    this.setData({
      selectedTimeSlot: timeSlot,
      showBookingModal: true,
      timePickerStart: tpStart,
      timePickerEnd: tpEnd,
      selectedTime: ''
    })
  },

  // 隐藏预约弹窗
  hideBookingModal() {
    this.setData({
      showBookingModal: false,
      selectedTimeSlot: null,
      showTimePicker: false,
      selectedHour: '',
      selectedMinute: '',
      selectedTime: '',
      selectedDuration: 'trial'
    })
  },

  // 原生时间选择器
  onTimeChange(e){
    try{
      const val = e.detail.value // HH:mm
      const { selectedTimeSlot, selectedDuration } = this.data
      if (!selectedTimeSlot){ this.setData({ selectedTime: val }); return }
      const startLimit = selectedTimeSlot.startTime
      const endLimit = selectedTimeSlot.endTime
      const durMinutes = selectedDuration === 'trial' ? 40 : 120
      if (!this.isWithinSlot(val, durMinutes, startLimit, endLimit)){
        wx.showToast({ title:'超出时间段范围', icon:'none' })
        // 自动校正为可行的最晚开始时间
        const latest = this.calcLatestStart(endLimit, durMinutes)
        if (this.compareTime(latest, startLimit) < 0){
          this.setData({ selectedTime: '' })
        } else {
          this.setData({ selectedTime: latest })
        }
      } else {
        this.setData({ selectedTime: val })
      }
    }catch(err){ this.setData({ selectedTime: e.detail.value }) }
  },

  // 切换时长时也校验
  onDurationSelect(e) {
    const durationId = e.currentTarget.dataset.id
    const old = this.data.selectedDuration
    if (durationId === old) return
    const durMinutes = durationId === 'trial' ? 40 : 120
    const { selectedTime, selectedTimeSlot } = this.data
    this.setData({ selectedDuration: durationId })
    if (selectedTime && selectedTimeSlot){
      if (!this.isWithinSlot(selectedTime, durMinutes, selectedTimeSlot.startTime, selectedTimeSlot.endTime)){
        wx.showToast({ title:'时长超出时间段，已为你调整开始时间', icon:'none' })
        const latest = this.calcLatestStart(selectedTimeSlot.endTime, durMinutes)
        if (this.compareTime(latest, selectedTimeSlot.startTime) < 0){
          this.setData({ selectedTime: '' })
        } else {
          this.setData({ selectedTime: latest })
        }
      }
    }
  },

  // 工具：时间比较 a<b 返回 -1, a=b 返回0, a>b 返回1
  compareTime(a, b){
    const [ah, am] = a.split(':').map(n=>parseInt(n,10))
    const [bh, bm] = b.split(':').map(n=>parseInt(n,10))
    if (ah === bh){ return am === bm ? 0 : (am < bm ? -1 : 1) }
    return ah < bh ? -1 : 1
  },
  // 工具：加分钟，返回 HH:mm
  addMinutes(hhmm, minutes){
    let [h, m] = hhmm.split(':').map(n=>parseInt(n,10))
    let total = h*60 + m + minutes
    const nh = Math.floor(total/60), nm = total%60
    return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`
  },
  // 工具：计算在 slotEnd 之前允许的最晚开始时间
  calcLatestStart(slotEnd, duration){
    let [eh, em] = slotEnd.split(':').map(n=>parseInt(n,10))
    let totalEnd = eh*60 + em
    totalEnd -= duration
    if (totalEnd < 0) totalEnd = 0
    const nh = Math.floor(totalEnd/60), nm = totalEnd%60
    return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`
  },
  // 校验开始时间+时长是否在时间段内
  isWithinSlot(startTime, durationMinutes, slotStart, slotEnd){
    if (!startTime || !slotStart || !slotEnd) return false
    const end = this.addMinutes(startTime, durationMinutes)
    return this.compareTime(startTime, slotStart) >= 0 && this.compareTime(end, slotEnd) <= 0
  },

  // 选择时长
  onDurationSelect(e) {
    const durationId = e.currentTarget.dataset.id
    this.setData({ selectedDuration: durationId })
  },

  // 确认预约（40分钟：跳转问卷；2小时：直接生成预约信息）
  async confirmBooking() {
    const { selectedTime, selectedDuration, teacherId, selectedDate, selectedTimeSlot } = this.data
    
    // 验证必填项
    if (!selectedTime) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      })
      return
    }
    // 校验选择的时间是否在时间段范围内
    const durMinutes = selectedDuration === 'trial' ? 40 : 120
    if (!this.isWithinSlot(selectedTime, durMinutes, selectedTimeSlot.startTime, selectedTimeSlot.endTime)){
      wx.showToast({ title:'开始时间不在可用范围内', icon:'none' })
      return
    }
    
    const isTrial = selectedDuration === 'trial'

    if (isTrial) {
      // 试听课：检查预约次数限制，然后检查是否已填写过问卷
      try {
        wx.showLoading({ title: '检查预约条件...' })
        
        const api = require('../../../utils/api')
        const auth = require('../../../utils/auth')
        const userInfo = auth.getUserInfo() || {}
        const studentId = userInfo?.student_info?.id || userInfo?.id
        
        if (studentId) {
          // 1. 检查预约次数限制
          const countRes = await api.survey.getBookingCount(parseInt(teacherId), studentId, 'trial')
          if (countRes && countRes.success && countRes.data && countRes.data.count >= 3) {
            wx.hideLoading()
            wx.showModal({
              title: '预约限制',
              content: '您已预约该教师3次试听课，无法继续预约试听课',
              showCancel: false
            })
            return
          }

          // 2. 检查是否已填写过问卷
          const detailRes = await api.survey.checkStudentDetail(studentId)
          if (detailRes && detailRes.success && detailRes.data && detailRes.data.hasDetail) {
            // 已填写过问卷：给用户选择“直接使用/重新填写”
            wx.hideLoading()
            this.hideBookingModal()
            wx.showActionSheet({
              itemList: ['直接使用', '重新填写'],
              success: async (res) => {
                if (res.tapIndex === 0) {
                  // 直接使用：按原逻辑创建预约
                  try {
                    wx.showLoading({ title: '创建预约...' })
                    const createRes = await api.survey.createBooking({
                      teacherId: parseInt(teacherId),
                      studentId: studentId,
                      detailId: detailRes.data.detailId,
                      courseTitle: `试听课预约 - ${selectedDate} ${selectedTime}`,
                      bookingDate: selectedDate,
                      bookingStartTime: selectedTime,
                      bookingDuration: selectedDuration,
                      bookingPrice: this.data.trialPrice,
                      bookingType: 'trial'
                    })
                    wx.hideLoading()
                    if (createRes && createRes.success) {
                      wx.showToast({ title: '预约创建成功', icon: 'success' })
                      setTimeout(() => { wx.navigateBack() }, 1500)
                    } else {
                      wx.showToast({ title: (createRes && createRes.message) || '创建预约失败', icon: 'none' })
                    }
                  } catch (err) {
                    wx.hideLoading()
                    console.error('创建预约失败:', err)
                    wx.showToast({ title: '创建预约失败', icon: 'none' })
                  }
                } else if (res.tapIndex === 1) {
                  // 重新填写：跳转问卷页面，提交将覆盖旧问卷
                  const bookingData = {
                    teacherId: parseInt(teacherId),
                    selectedDate: selectedDate,
                    selectedTime: selectedTime,
                    timeSlotName: selectedTimeSlot && selectedTimeSlot.name,
                    duration: selectedDuration,
                    trialPrice: this.data.trialPrice,
                    courseTitle: `试听课预约 - ${selectedDate} ${selectedTime}`
                  }
                  wx.navigateTo({
                    url: `/pages/student/survey/survey?readonly=0&teacherId=${encodeURIComponent(teacherId)}&bookingData=${encodeURIComponent(JSON.stringify(bookingData))}`
                  })
                }
              }
            })
            return
          }
        }
        
        wx.hideLoading()
        this.hideBookingModal()
        
        // 未填写过问卷，跳转到问卷页面
        const bookingData = {
          teacherId: parseInt(teacherId),
          selectedDate: selectedDate,
          selectedTime: selectedTime,
          timeSlotName: selectedTimeSlot && selectedTimeSlot.name,
          duration: selectedDuration,
          trialPrice: this.data.trialPrice,
          courseTitle: `试听课预约 - ${selectedDate} ${selectedTime}`
        }
        
        wx.navigateTo({
          url: `/pages/student/survey/survey?readonly=0&teacherId=${encodeURIComponent(teacherId)}&bookingData=${encodeURIComponent(JSON.stringify(bookingData))}`
        })
        
      } catch (error) {
        wx.hideLoading()
        console.error('检查预约条件失败:', error)
        wx.showToast({
          title: '检查预约条件失败，请重试',
          icon: 'none'
        })
      }
    } else {
      // 正式课（2小时）：检查是否已填写过问卷，然后决定流程
      try {
        wx.showLoading({ title: '检查问卷状态...' })
        
        const api = require('../../../utils/api')
        const auth = require('../../../utils/auth')
        const userInfo = auth.getUserInfo() || {}
        const studentId = userInfo?.student_info?.id || userInfo?.id
        
        if (studentId) {
          // 检查是否已填写过问卷
          const detailRes = await api.survey.checkStudentDetail(studentId)
          
          if (detailRes && detailRes.success && detailRes.data && detailRes.data.hasDetail) {
            // 已填写过问卷：给用户选择“直接使用/重新填写”
            wx.hideLoading()
            this.hideBookingModal()
            wx.showActionSheet({
              itemList: ['直接使用', '重新填写'],
              success: async (res) => {
                if (res.tapIndex === 0) {
                  // 直接使用：发起预约通知
                  try {
                    wx.showLoading({ title: '发起预约通知...' })
                    const surveyData = {
                      teacherId: parseInt(teacherId),
                      studentId: studentId,
                      detailId: detailRes.data.detailId,
                      courseTitle: `正式课预约 - ${selectedDate} ${selectedTime}`,
                      bookingDate: selectedDate,
                      bookingStartTime: selectedTime,
                      bookingDuration: 'formal',
                      bookingType: 'formal',
                      paid: 0,
                      status: 0
                    }
                    const response = await api.survey.createBooking(surveyData)
                    wx.hideLoading()
                    if (response && response.success) {
                      wx.showModal({
                        title: '预约通知已发送',
                        content: '您的正式课预约通知已发送给教师，请等待教师确认。教师同意后可以排学习计划。',
                        showCancel: false,
                        success: () => { wx.navigateBack() }
                      })
                    } else {
                      wx.showToast({ title: (response && response.message) || '发起预约失败', icon: 'none' })
                    }
                  } catch (err) {
                    wx.hideLoading()
                    console.error('发起预约失败:', err)
                    wx.showToast({ title: '发起预约失败', icon: 'none' })
                  }
                } else if (res.tapIndex === 1) {
                  // 重新填写：跳转问卷页面，提交将覆盖旧问卷
                  const bookingData = {
                    teacherId: parseInt(teacherId),
                    selectedDate: selectedDate,
                    selectedTime: selectedTime,
                    timeSlotName: selectedTimeSlot && selectedTimeSlot.name,
                    duration: 'formal',
                    courseTitle: `正式课预约 - ${selectedDate} ${selectedTime}`,
                    bookingType: 'formal'
                  }
                  wx.navigateTo({
                    url: `/pages/student/survey/survey?readonly=0&teacherId=${encodeURIComponent(teacherId)}&bookingData=${encodeURIComponent(JSON.stringify(bookingData))}`
                  })
                }
              }
            })
            return
          }
        }
        
        // 未填写过问卷，跳转到问卷页面
        wx.hideLoading()
        this.hideBookingModal()
        
        const bookingData = {
          teacherId: parseInt(teacherId),
          selectedDate: selectedDate,
          selectedTime: selectedTime,
          timeSlotName: selectedTimeSlot && selectedTimeSlot.name,
          duration: 'formal', // 2小时正式课
          courseTitle: `正式课预约 - ${selectedDate} ${selectedTime}`,
          bookingType: 'formal'
        }
        
        wx.navigateTo({
          url: `/pages/student/survey/survey?readonly=0&teacherId=${encodeURIComponent(teacherId)}&bookingData=${encodeURIComponent(JSON.stringify(bookingData))}`
        })
        
      } catch (error) {
        wx.hideLoading()
        console.error('检查问卷状态失败:', error)
        wx.showToast({
          title: '检查问卷状态失败，请重试',
          icon: 'none'
        })
      }
    }
  },

  // 格式化时间长度
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainMinutes = minutes % 60
      return remainMinutes > 0 ? `${hours}小时${remainMinutes}分钟` : `${hours}小时`
    }
  }
})
