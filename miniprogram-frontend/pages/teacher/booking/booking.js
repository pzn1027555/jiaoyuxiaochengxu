// pages/teacher/booking/booking.js
Page({
  data: {
    headerHeight: 0,
    list: [],
    loading: false
  },

  onLoad() {
    this.loadList().then(()=>{ this.hasLoaded = true })
  },
  onShow() {
    // 参照 my-students：仅在显式更新标记时刷新，避免重复请求
    const app = getApp()
    if (app && app.globalData && app.globalData.bookingUpdated) {
      app.globalData.bookingUpdated = false
      this.loadList()
    }
  },

  onHeaderReady(e) {
    const { totalHeight } = e.detail || {}
    this.setData({ headerHeight: totalHeight || 0 })
  },

  // 从后端加载预约列表（基于 student_survey + student_info）
  async loadList() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try{
      const api = require('../../../utils/api')
      const res = await api.survey.list()
      const raw = Array.isArray(res && res.data) ? res.data : (Array.isArray(res && res.list) ? res.list : [])
      if(res && res.success && Array.isArray(raw)){
        const mapped = await Promise.all(raw.map(async x => {
          const baseData = {
            id: String(x.id||''),
            name: (x.name||'').trim(),
            avatar: x.avatar || '/images/workspace/default-avatar.png',
            studentId: String(x.studentId||''),
            courseName: x.courseName || '',
            // 预约信息（用于 booking-info 展示）
            bookingDate: x.bookingDate || '',
            bookingStartTime: x.bookingStartTime || '',
            bookingDuration: x.bookingDuration || '',
            bookingPrice: typeof x.bookingPrice === 'number' ? x.bookingPrice : Number(x.bookingPrice || 0),
            bookingType: x.bookingType || '',
            // 时间描述：优先后端 timeDesc；否则由 bookingDate + bookingStartTime 或 createTime 兜底
            timeDesc: x.timeDesc || (x.bookingDate && x.bookingStartTime ? `${x.bookingDate} ${x.bookingStartTime}` : (x.createTime || '')),
            status: x.status || 'pending',
            hasStudyPlan: false,
            studyPlanId: null
          }
          
          // 对于已同意的正式课程，检查是否已有学习计划
          if (baseData.status === 'approved' && baseData.bookingType !== 'trial') {
            try {
              const planRes = await api.studyPlan.getStudentPlans(baseData.studentId)
              if (planRes && (planRes.success || planRes.code === 200) && planRes.data && planRes.data.length > 0) {
                // 找到当前教师创建的学习计划
                const teacherPlan = planRes.data.find(plan => plan.teacherId === this.getCurrentTeacherId())
                if (teacherPlan) {
                  baseData.hasStudyPlan = true
                  baseData.studyPlanId = teacherPlan.id
                }
              }
            } catch (error) {
              console.error('检查学习计划失败:', error)
            }
          }
          
          return baseData
        }))
        this.setData({ list: mapped })
      } else {
        this.setData({ list: [] })
      }
    }catch(e){ this.setData({ list: [] }) }
    finally { this.setData({ loading: false }); if(!this.hasLoaded) this.hasLoaded = true }
  },




  onApprove(e) {
    const { id } = e.currentTarget.dataset
    const api = require('../../../utils/api')
    wx.showLoading({ title:'处理中...' })
    api.survey.approve(id).then(()=>{
      const list = this.data.list.map(it => it.id === id ? { ...it, status: 'approved' } : it)
      this.setData({ list })
      wx.hideLoading(); wx.showToast({ title: '已同意预约', icon: 'success' })
    }).catch(()=>{ wx.hideLoading(); wx.showToast({ title:'操作失败', icon:'none' }) })
  },

  onReject(e) {
    const { id } = e.currentTarget.dataset
    const api = require('../../../utils/api')
    const that = this
    wx.showModal({
      title: '填写拒绝原因', editable: true, placeholderText: '请输入拒绝原因',
      success(res){
        if(res.confirm){
          const reason = res.content || ''
          wx.showLoading({ title:'处理中...' })
          api.survey.reject(id, reason).then(()=>{
            const list = that.data.list.map(it => it.id === id ? { ...it, status: 'rejected', rejectReason: reason } : it)
            that.setData({ list }); wx.hideLoading(); wx.showToast({ title:'已拒绝', icon:'none' })
          }).catch(()=>{ wx.hideLoading(); wx.showToast({ title:'操作失败', icon:'none' }) })
        }
      }
    })
  },

  // 同意后：填写学习计划
  writePlan(e){
    const { id } = e.currentTarget.dataset
    const item = (this.data.list||[]).find(x=>x.id===id)
    if(!item){ return }
    const students = [{ id: String(item.studentId||''), name: item.name, avatar: item.avatar }]
    const param = encodeURIComponent(JSON.stringify(students))
    wx.navigateTo({ url: `/pages/teacher/schedule-plan/schedule-plan?students=${param}` })
  },

  // 同意后：查看问卷
  viewSurvey(e){
    const { id } = e.currentTarget.dataset
    const item = (this.data.list||[]).find(x=>x.id===id)
    if(!item){ return }
    // 从后端按学生ID查询问卷
    wx.navigateTo({ url: `/pages/student/survey/survey?readonly=1&studentId=${encodeURIComponent(item.studentId||'')}` })
  },

  // 查看学习计划
  viewPlan(e){
    debugger
    const { id } = e.currentTarget.dataset
    const item = (this.data.list||[]).find(x=>x.id===id)
    if(!item || !item.studyPlanId){ return }
    // 跳转到学习计划确认页面，但是教师查看模式
    wx.navigateTo({ 
      url: `/pages/student/schedule-confirm/schedule-confirm?planId=${item.studyPlanId}&viewMode=teacher`
    })
  },

  // 获取当前教师ID
  getCurrentTeacherId() {
    const app = getApp()
    return app.globalData?.userInfo?.id || null
  }
})


