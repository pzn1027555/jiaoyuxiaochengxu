// utils/api.js - API接口封装
const request = require('./request')
const { getApiBaseUrl } = require('../config/env')

const api = {
  // 基础配置
  baseURL: getApiBaseUrl(),

  // 微信小程序登录
  wxLogin(data) {
    return request.post('/mini/auth/wx-login', data)
  },

  // 问卷接口
  survey: {
    // 查询指定学生的问卷（教师查看）
    getByStudent(studentId, teacherId){
      const params = teacherId ? { teacherId } : {}
      return request.get(`/mini/survey/${studentId}`, params)
    },
    // 兼容旧：保存/更新（仍保留）
    save(data){ return request.post('/mini/survey/save', data) },
    // 新：只创建预约，不覆盖问卷
    createBooking(data){
      const auth = require('./auth')
      const ui = auth.getUserInfo() || {}
      const studentId = ui?.student_info?.id || ui?.id
      const d = { ...(data||{}) }
      if (studentId && d.studentId === undefined) d.studentId = studentId
      return request.post('/mini/survey/booking/create', d)
    },
    // 新：提交问卷明细，返回 detailId；student_survey 只关联 detailId
    createDetail(data){
      const auth = require('./auth')
      const ui = auth.getUserInfo() || {}
      const studentId = ui?.student_info?.id || ui?.id
      const d = { ...(data||{}) }
      if (studentId && d.studentId === undefined) d.studentId = studentId
      return request.post('/mini/survey/detail/create', d)
    },
    getBookingCount(teacherId, studentId, bookingType){
      const params = { teacherId, studentId }
      if (bookingType) params.bookingType = bookingType
      return request.get('/mini/survey/count', params)
    },
      createBookingWithDetail(data){
        const auth = require('./auth')
        const ui = auth.getUserInfo() || {}
        const studentId = ui?.student_info?.id || ui?.id
        const d = { ...(data||{}) }
        if (studentId && d.studentId === undefined) d.studentId = studentId
        return request.post('/mini/survey/create-booking-with-detail', d)
      },
      checkStudentDetail(studentId){
        return request.get('/mini/survey/detail/check', { studentId })
      },
    // 教师端预约列表
    list(params){
      const auth = require('./auth')
      const ui = auth.getUserInfo() || {}
      const teacherId = ui.userId || ui.id || (ui.teacher_info && ui.teacher_info.id)
      const phone = ui.phone || (ui.teacher_info && ui.teacher_info.phone)
      const q = { ...(params||{}) }
      if (teacherId && q.teacherId === undefined) q.teacherId = teacherId
      if (phone && q.phone === undefined) q.phone = phone
      return request.get('/mini/survey/list', q)
    },
    approve(id){
      return request.post(`/mini/survey/${id}/approve`, {})
    },
    reject(id, reason){
      return request.post(`/mini/survey/${id}/reject`, { reason })
    }
  },

  // 教师资源（试听视频 / 学习资料 / 证书）
  teacherResource: {
    // 列表
    getList(params) {
      return request.get('/mini/teacher-resource/list', params)
    },
    // 创建
    create(data) {
      return request.post('/mini/teacher-resource/create', data)
    },
    // 更新
    update(id, data) {
      return request.put(`/mini/teacher-resource/${id}`, data)
    },
    // 详情
    detail(id) {
      return request.get(`/mini/teacher-resource/${id}`)
    },
    // 删除
    remove(id) {
      return request.delete(`/mini/teacher-resource/${id}`)
    }
  },

  // 手机号验证码登录
  phoneLogin(data) {
    return request.post('/mini/auth/phone-login', data)
  },

  // 发送验证码
  sendSmsCode(phone) {
    return request.post('/mini/auth/send-code', { phone })
  },

  // 选择用户角色
  selectRole(data) {
    return request.post('/mini/auth/select-role', data)
  },

  // 验证Token
  verifyToken() {
    return request.get('/mini/auth/verify')
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/mini/user/profile')
  },

  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/mini/user/profile', data)
  },

  // 登出
  logout() {
    return request.post('/mini/auth/logout')
  },

  // 课程相关接口
  course: {
    // 获取课程列表
    getList(params) {
      return request.get('/mini/course/list', params)
    },

    // 获取课程详情
    getDetail(id) {
      return request.get('/mini/course/detail', { id })
    },

    // 获取课程分类
    getCategories() {
      return request.get('/mini/course/categories')
    },

    // 搜索课程
    search(keyword) {
      return request.get('/mini/course/search', { keyword })
    }
  },

  // 教师相关接口
  teacher: {
    // 获取教师列表
    getList(params) {
      return request.get('/mini/teacher/list', params)
    },

    // 获取教师详情（注意：后端实际为 /api/teacher/{id}）
    getDetail(id) {
      return request.get(`/teacher/${id}`)
    },

    // 教师推荐
    getRecommended() {
      return request.get('/mini/teacher/recommended')
    },
    // 推荐老师完整列表（用于无需分页的场景）
    getAllRecommended() {
      return request.get('/mini/teacher/recommended/all')
    },
    // 收藏/取消收藏老师
    favorite(teacherId, action){
      // 后端按 @RequestParam 接收，这里以 query 方式传参，避免 400
      return request.post(`/mini/teacher/favorite?teacherId=${encodeURIComponent(teacherId)}&action=${encodeURIComponent(action)}`, {})
    },
    // 查询是否已收藏
    favoriteStatus(teacherId){
      return request.get('/mini/teacher/favorite/status', { teacherId })
    }
  },

  // 社区相关接口
  community: {
    // 获取帖子列表
    getPosts(params) {
      return request.get('/mini/community/posts', params)
    },

    // 获取帖子详情
    getPostDetail(id) {
      return request.get(`/mini/community/post/${id}`)
    },

    // 发布帖子
    createPost(data) {
      return request.post('/mini/community/post', data)
    },

    // 获取资源列表
    getResources(params) {
      return request.get('/mini/community/resources', params)
    }
  },

  // 订单相关接口
  order: {
    // 获取订单列表
    getList(params) {
      return request.get('/mini/order/list', params)
    },

    // 获取订单详情
    getDetail(id) {
      return request.get(`/mini/order/${id}`)
    },

    // 创建订单
    create(data) {
      return request.post('/mini/order/create', data)
    },

    // 支付订单
    pay(id, paymentData) {
      return request.post(`/mini/order/${id}/pay`, paymentData)
    }
  },

  // 学生相关接口（学生端）
  student: {
    // 获取学习记录
    getLearningRecords(params) {
      return request.get('/mini/student/learning-records', params)
    },

    // 提交课程反馈
    submitFeedback(data) {
      return request.post('/mini/student/feedback', data)
    },

    // 获取课程进度
    getCourseProgress(courseId) {
      return request.get(`/mini/student/course/${courseId}/progress`)
    }
  },

  // 家长相关接口（家长端）
  parent: {
    // 获取孩子信息
    getChildren() {
      return request.get('/mini/parent/students')
    },

    // 添加孩子
    addChild(data) {
      return request.post('/mini/parent/child', data)
    },

    // 获取孩子学习报告
    getChildReport(childId) {
      return request.get(`/mini/parent/child/${childId}/report`)
    }
  },

  // 教师相关接口（教师端）
  teacherPortal: {
    // 获取我的课程
    getMyCourses(params) {
      return request.get('/mini/teacher-portal/courses', params)
    },

    // 获取学生列表
    getStudents(params) {
      return request.get('/mini/teacher-portal/students', params)
    },

    // 提交教学反馈
    submitTeachingFeedback(data) {
      return request.post('/mini/teacher-portal/feedback', data)
    }
  },

  // 教师排课
  teacherSchedule: {
    getDay(params) {
      return request.get('/mini/teacher/schedule/day', params)
    },
    getMonth(params) {
      return request.get('/mini/teacher/schedule/month', params)
    },
    create(data) {
      return request.post('/mini/teacher/schedule/create', data)
    },
    createPlan(data) {
      return request.post('/mini/teacher/schedule/plan', data)
    },
    updateTime(id, data) {
      return request.put(`/mini/teacher/schedule/${id}/time`, data)
    },
    update(id, data) {
      return request.put(`/mini/teacher/schedule/${id}`, data)
    },
    // 查询时间段是否冲突（返回true/false或数量）——复用后端错误消息方式，此处不单独接口
    remove(id) {
      return request.delete(`/mini/teacher/schedule/${id}`)
    },
    detail(id) {
      return request.get(`/mini/teacher/schedule/${id}`)
    },
    getFeedback(id){
      return request.get(`/mini/teacher/schedule/${id}/feedback`)
    },
    submitFeedback(id, data){
      return request.post(`/mini/teacher/schedule/${id}/feedback`, data)
    }
  },

  // 学生课程（日程）与评价
  studentSchedule: {
    getDay(params) {
      const auth = require('./auth')
      const userInfo = auth.getUserInfo() || {}
      const sessionStudentId = userInfo?.student_info?.id || userInfo?.id
      const requestParams = { ...(params || {}) }
      if (requestParams.studentId === undefined && sessionStudentId) {
        requestParams.studentId = sessionStudentId
      }
      if (!requestParams.studentId) {
        return Promise.reject(new Error('studentId 缺失'))
      }
      return request.get('/mini/student/schedule/day', requestParams)
    },
    detail(id) {
      return request.get(`/mini/student/schedule/${id}`)
    },
    getReview(id) {
      return request.get('/mini/student/schedule/review', { scheduleId: id })
    },
    submitReview(id, data) {
      return request.post('/mini/student/schedule/review/submit', { scheduleId: id, ...data })
    }
  },

  // 搜索
  search: {
    teachers(params){
      return request.get('/mini/search/teachers', params)
    }
  },

  // 文件上传
  upload: {
    // 上传图片
    image(filePath) {
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${getApiBaseUrl()}/mini/upload/file`,
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': 'Bearer ' + (wx.getStorageSync('token') || '')
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data)
              if (data.success || data.code == 200) {
                resolve(data)
              } else {
                reject(data)
              }
            } catch (e) {
              reject({ message: '上传失败' })
            }
          },
          fail: reject
        })
      })
    },
    // 上传通用文件（pdf/doc/ppt/video等）
    file(filePath) {
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${getApiBaseUrl()}/mini/upload/file`,
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': 'Bearer ' + (wx.getStorageSync('token') || '')
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data)
              if (data.success || data.code == 200) {
                resolve(data)
              } else {
                reject(data)
              }
            } catch (e) {
              reject({ message: '上传失败' })
            }
          },
          fail: reject
        })
      })
    },
    // 新增：上传视频
    video(filePath) {
      return this.file(filePath)
    },
    // 新增：上传文档
    document(filePath) {
      return this.file(filePath)
    }
  },
  // 磨课相关接口（教师端）
  mooc: {
    apply(teacherId) {
      return request.post('/mini/mooc/apply', { teacherId })
    },
    notifications(teacherId) {
      return request.get('/mini/mooc/notifications', { teacherId })
    },
    readNotification(id) {
      return request.post(`/mini/mooc/notifications/${id}/read`)
    },
    status(teacherId) {
      return request.get('/mini/mooc/status', { teacherId })
    }
  },

  // 学习计划
  studyPlan: {
    // 创建学习计划
    create(data) {
      return request.post('/mini/study-plan/create', data)
    },
    // 获取学习计划详情
    getDetail(planId) {
      return request.get(`/mini/study-plan/${planId}`)
    },
    // 获取学生的学习计划列表
    getStudentPlans(studentId) {
      return request.get(`/mini/study-plan/student/${studentId}`)
    },
    // 确认学习计划并生成订单
    confirmAndCreateOrder(planId) {
      return request.post(`/mini/study-plan/${planId}/confirm`)
    },
    // 更新学习计划状态
    updateStatus(planId, data) {
      return request.put(`/mini/study-plan/${planId}/status`, data)
    }
  },

  // 通知管理
  notification: {
    // 获取学生通知列表
    getStudentNotifications(studentId) {
      return request.get('/mini/notification/student', { studentId, userType: 'student' })
    },
    // 获取家长通知列表
    getParentNotifications() {
      const auth = require('./auth')
      const userInfo = auth.getUserInfo()
      const parentId = userInfo?.parent_info?.id
      if (!parentId) {
        return Promise.reject(new Error('未找到家长信息'))
      }
      return request.get('/mini/notification/parent', { parentId, userType: 'parent' })
    },
    // 标记通知为已读
    markAsRead(notificationId) {
      return request.post('/mini/notification/mark-read', { id: notificationId })
    },
    // 标记所有通知为已读
    markAllAsRead(userType) {
      return request.post('/mini/notification/mark-all-read', { userType })
    }
  },
  // 系统配置（课程页轮播图等）
  system: {
    getCourseBanners() {
      return request.get('/mini/system/course-banners')
    }
  }
}

// 新增导出：统一课时价格（便于各页引用）
api.lessonPrice = {
  current(){ return request.get('/mini/system/lesson-price') }
}

module.exports = api

// 安全JSON解析（用于 teacherTags 字段）
JSON.parseSafe = function (txt){ try{ return JSON.parse(txt) }catch(e){ return [] } }

// 兼容 schedule-edit 调用
if (typeof Page !== 'undefined'){
  try{ Page.prototype.JSON = JSON }catch(e){}
}