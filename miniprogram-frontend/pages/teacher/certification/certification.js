// pages/teacher/certification/certification.js
const badgeManager = require('../../../utils/badgeManager')
const request = require('../../../utils/request')
const api = require('../../../utils/api')
const { toAbsolute } = require('../../../utils/urlUtils')
const { getApiBaseUrl } = require('../../../config/env')

Page({
  data: {
    // 自定义导航栏高度
    headerHeight: 0,
    
    // 表单数据
    formData: {
      realName: '',
      gender: null,
      genderText: '',
      idCardFront: '',
      idCardBack: '',
      graduateSchool: '',
      education: '',
      diplomaCerts: [], // 学历证书数组
      teacherCerts: [], // 教师资格证数组
      awardCerts: [], // 获奖认证数组
      bankCard: '',
      bankName: '' // 开户行
    },
    
    // 弹窗状态
    showGenderPicker: false,
    
    // 选项数据
    educationOptions: ['专科', '本科', '硕士', '博士'],
    
    // 加载状态
    loading: false,
    
    // 显示用的格式化银行卡号
    displayBankCard: '',
    
    // 认证状态
    certificationStatus: null,
    certificationStatusText: '',
    
    // 面试时间
    interviewTime: '',
    formattedInterviewTime: '',
    
    // 评级信息
    gradeInfo: {},
    
    // 是否可编辑（根据认证状态判断）
    isEditable: true,
    
    // 按钮文字
    submitButtonText: '预约面试',
    
    // 通知相关
    notifications: [],
    unreadCount: 0,
    showNotifications: false,

    // 合同
    contractStatus: 0,
    contractUrl: '',

    // 前端展示用的绝对地址
    displayMedia: {
      idCardFront: '',
      idCardBack: '',
      diplomaCerts: [],
      teacherCerts: [],
      awardCerts: []
    }
  },

  onLoad(options) {
    console.log('教师认证页面加载')
    this.initData()
    this.updateDisplayBankCard()
  },

  onShow() {
    console.log('教师认证页面显示')
    // 从其他页面返回时，不重新加载数据，避免覆盖用户已上传的内容
    this.updateDisplayBankCard()
    this.loadNotifications()
    this.markAllNotificationsAsReadOnEnter()
  },

  // 初始化数据
  initData() {
    // 先加载用户基本信息（姓名和性别）
    this.loadUserProfile()
    // 然后加载已有的认证信息
    this.loadCertificationData()
  },

  // 加载用户基本信息
  async loadUserProfile() {
    try {
      // 优先从本地缓存获取，如果需要可以调用接口
      const teacherInfo = wx.getStorageSync('teacher_info')
      if (teacherInfo) {
        this.setData({
          'formData.realName': teacherInfo.name || '',
          'formData.gender': teacherInfo.gender || null,
          'formData.genderText': teacherInfo.gender === 1 ? '男' : (teacherInfo.gender === 2 ? '女' : '')
        })
      } else {
        // 如果缓存中没有，可以调用接口获取
        // const userInfo = await profileApi.getUserProfile()
        // if (userInfo && userInfo.success) {
        //   const data = userInfo.data
        //   this.setData({
        //     'formData.realName': data.teacher_name || '',
        //     'formData.gender': data.gender || null,
        //     'formData.genderText': data.gender === 1 ? '男' : (data.gender === 2 ? '女' : '')
        //   })
        // }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },

  // 加载认证数据
  async loadCertificationData() {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const result = await this.getCertificationStatus()
      
      if (result && result.data) {
        const data = result.data
        const currentFormData = this.data.formData
        
        // 智能合并数据：只有当前端数据为空时才使用服务器数据，避免覆盖用户已上传的内容
        const updates = {
          'formData.idCardFront': data.idCardFront || currentFormData.idCardFront,
          'formData.idCardBack': data.idCardBack || currentFormData.idCardBack,
          'formData.graduateSchool': data.graduateSchool || currentFormData.graduateSchool,
          'formData.education': data.education || currentFormData.education,
          'formData.bankCard': data.bankCard || currentFormData.bankCard,
          'formData.bankName': data.bankName || currentFormData.bankName,
          certificationStatus: data.certificationStatus,
          certificationStatusText: data.certificationStatusText,
          interviewTime: data.interviewTime || '',
          formattedInterviewTime: this.formatInterviewTime(data.interviewTime)
        }

        if (data.idCardFront) {
          updates['displayMedia.idCardFront'] = this.toAbsoluteUrl(data.idCardFront)
        }
        if (data.idCardBack) {
          updates['displayMedia.idCardBack'] = this.toAbsoluteUrl(data.idCardBack)
        }
        
        // 对于数组类型的数据，只有当前为空时才使用服务器数据
        // 服务器返回的可能是JSON字符串，需要解析为数组
    const wrapArray = (val) => {
      if (!val) return []
      if (Array.isArray(val)) return val
      try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed : []
      } catch (_) {
        return []
      }
    }

    const needDiploma = !currentFormData.diplomaCerts || currentFormData.diplomaCerts.length === 0
    if (needDiploma) {
      const diplomaCerts = wrapArray(data.diplomaCerts)
      updates['formData.diplomaCerts'] = diplomaCerts
      updates['displayMedia.diplomaCerts'] = diplomaCerts.map((u) => this.toAbsoluteUrl(u))
    }

    const needTeacherCert = !currentFormData.teacherCerts || currentFormData.teacherCerts.length === 0
    if (needTeacherCert) {
      const teacherCerts = wrapArray(data.teacherCerts)
      updates['formData.teacherCerts'] = teacherCerts
      updates['displayMedia.teacherCerts'] = teacherCerts.map((u) => this.toAbsoluteUrl(u))
    }

    const needAward = !currentFormData.awardCerts || currentFormData.awardCerts.length === 0
    if (needAward) {
      const awardCerts = wrapArray(data.awardCerts)
      updates['formData.awardCerts'] = awardCerts
      updates['displayMedia.awardCerts'] = awardCerts.map((u) => this.toAbsoluteUrl(u))
    }
        
        // 不覆盖从用户信息获取的姓名和性别
        if (!currentFormData.realName) {
          updates['formData.realName'] = data.realName || ''
        }
        if (!currentFormData.gender) {
          updates['formData.gender'] = data.gender || null
          updates['formData.genderText'] = data.gender === 1 ? '男' : (data.gender === 2 ? '女' : '')
        }
        
        // 设置评级信息
        if (data.teacherLevel) {
          const levelMap = {
            'junior': '初级教师',
            'intermediate': '中级教师', 
            'senior': '高级教师',
            'expert': '专家教师'
          }
          
          updates.gradeInfo = {
            teacherLevel: data.teacherLevel,
            teacherLevelText: levelMap[data.teacherLevel] || data.teacherLevel,
            hourlyRate: typeof data.hourlyRate !== 'undefined' ? data.hourlyRate : null,
            gradeTime: data.gradeTime,
            formattedGradeTime: data.gradeTime ? this.formatInterviewTime(data.gradeTime) : '',
            gradeReason: data.gradeReason || ''
          }
        }

        // 合同状态与URL
        if (typeof data.contractStatus !== 'undefined') {
          updates.contractStatus = data.contractStatus
        }
        if (data.contractUrl) {
          updates.contractUrl = data.contractUrl
        }
        
        this.setData(updates)
        this.updateDisplayBankCard()
        
        // 根据认证状态设置页面状态
        this.updatePageStatus(data.certificationStatus)
      }
      
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      console.error('加载认证数据失败:', error)
    }
  },

  // 根据认证状态更新页面状态
  updatePageStatus(status) {
    const statusMap = {
      0: { text: '待审核', editable: true, buttonText: '重新提交' },
      1: { text: '审核通过', editable: false, buttonText: '认证已通过' },
      2: { text: '审核拒绝', editable: true, buttonText: '重新提交' },
      3: { text: '待面试', editable: false, buttonText: '等待面试' },
      4: { text: '面试通过', editable: false, buttonText: '认证已完成' },
      5: { text: '面试不通过', editable: true, buttonText: '重新提交' }
    }
    
    const statusInfo = statusMap[status] || { text: '未知状态', editable: true, buttonText: '预约面试' }
    
    this.setData({
      certificationStatus: status,
      certificationStatusText: statusInfo.text,
      isEditable: statusInfo.editable,
      submitButtonText: statusInfo.buttonText
    })
  },

  // 格式化面试时间
  formatInterviewTime(timeStr) {
    if (!timeStr) return ''
    
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return timeStr
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}年${month}月${day}日 ${hours}:${minutes}`
    } catch (error) {
      console.error('格式化面试时间失败:', error)
      return timeStr
    }
  },

  // 自定义导航栏就绪回调
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({ 
      headerHeight: totalHeight
    })
  },

  // 真实姓名输入
  onRealNameInput(e) {
    if (!this.data.isEditable) {
      return
    }
    this.setData({
      'formData.realName': e.detail.value
    })
  },

  // 真实姓名点击
  onRealNameTap() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    
    const currentValue = this.data.formData.realName || ''
    wx.showModal({
      title: '请输入真实姓名',
      content: `${currentValue}`,
      editable: true,
      placeholderText: currentValue || '请输入真实姓名',
      success: (res) => {
        if (res.confirm) {
          // 如果用户输入了内容，使用新值；否则保持原值
          const newValue = res.content && res.content.trim() ? res.content.trim() : currentValue
          this.setData({
            'formData.realName': newValue
          })
        }
      }
    })
  },

  // 性别点击
  onGenderTap() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showGenderPicker: true
    })
  },

  // 隐藏性别选择器
  hideGenderPicker() {
    this.setData({
      showGenderPicker: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 选择性别
  selectGender(e) {
    const { value, text } = e.currentTarget.dataset
    this.setData({
      'formData.gender': parseInt(value),
      'formData.genderText': text,
      showGenderPicker: false
    })
  },

  // 上传身份证人像面
  onUploadIdCardFront() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    this.uploadImage('idCardFront', '身份证人像面')
  },

  // 上传身份证国徽面
  onUploadIdCardBack() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    this.uploadImage('idCardBack', '身份证国徽面')
  },

  // 毕业院校输入
  onGraduateSchoolInput(e) {
    if (!this.data.isEditable) {
      return
    }
    this.setData({
      'formData.graduateSchool': e.detail.value
    })
  },

  // 毕业院校点击
  onSchoolTap() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    
    const currentValue = this.data.formData.graduateSchool || ''
    wx.showModal({
      title: '请输入毕业院校',
      content: `${currentValue}`,
      editable: true,
      placeholderText: currentValue || '请输入毕业院校',
      success: (res) => {
        if (res.confirm) {
          // 如果用户输入了内容，使用新值；否则保持原值
          const newValue = res.content && res.content.trim() ? res.content.trim() : currentValue
          this.setData({
            'formData.graduateSchool': newValue
          })
        }
      }
    })
  },

  // 学历点击
  onEducationTap() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    
    wx.showActionSheet({
      itemList: this.data.educationOptions,
      success: (res) => {
        const education = this.data.educationOptions[res.tapIndex]
        this.setData({
          'formData.education': education
        })
      }
    })
  },

  // 上传学历证明
  onUploadDiploma() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    this.uploadSingleImageToArray('diplomaCerts', '学历证书')
  },

  // 预览学历证书
  onPreviewDiploma(e) {
    const index = e.currentTarget.dataset.index
    const current = this.data.formData.diplomaCerts[index]
    const urls = this.data.formData.diplomaCerts
    
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  // 删除学历证书
  onRemoveDiploma(e) {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }

    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张证书吗？',
      success: (res) => {
        if (res.confirm) {
          const diplomaCerts = [...(this.data.formData.diplomaCerts || [])]
          const diplomaDisplay = [...(this.data.displayMedia.diplomaCerts || [])]
          diplomaCerts.splice(index, 1)
          diplomaDisplay.splice(index, 1)
          this.setData({
            'formData.diplomaCerts': diplomaCerts,
            'displayMedia.diplomaCerts': diplomaDisplay
          })
        }
      }
    })
  },

  // 上传教师资格证
  onUploadTeacherCert() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    this.uploadSingleImageToArray('teacherCerts', '教师资格证')
  },

  // 上传获奖认证
  onUploadAward() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    this.uploadSingleImageToArray('awardCerts', '获奖证书')
  },

  // 预览教师资格证
  onPreviewTeacherCert(e) {
    const index = e.currentTarget.dataset.index
    const current = this.data.formData.teacherCerts[index]
    const urls = this.data.formData.teacherCerts
    
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  // 删除教师资格证
  onRemoveTeacherCert(e) {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }

    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张证书吗？',
      success: (res) => {
        if (res.confirm) {
          const teacherCerts = [...(this.data.formData.teacherCerts || [])]
          const teacherDisplay = [...(this.data.displayMedia.teacherCerts || [])]
          teacherCerts.splice(index, 1)
          teacherDisplay.splice(index, 1)
          this.setData({
            'formData.teacherCerts': teacherCerts,
            'displayMedia.teacherCerts': teacherDisplay
          })
        }
      }
    })
  },

  // 预览获奖认证
  onPreviewAwardCert(e) {
    const index = e.currentTarget.dataset.index
    const current = this.data.formData.awardCerts[index]
    const urls = this.data.formData.awardCerts
    
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  // 删除获奖认证
  onRemoveAwardCert(e) {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }

    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张证书吗？',
      success: (res) => {
        if (res.confirm) {
          const awardCerts = [...(this.data.formData.awardCerts || [])]
          const awardDisplay = [...(this.data.displayMedia.awardCerts || [])]
          awardCerts.splice(index, 1)
          awardDisplay.splice(index, 1)
          this.setData({
            'formData.awardCerts': awardCerts,
            'displayMedia.awardCerts': awardDisplay
          })
        }
      }
    })
  },

  // 银行卡点击
  onBankCardTap() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    
    // 跳转到银行卡信息页面
    const { bankCard } = this.data.formData
    const params = {
      bankCard: encodeURIComponent(bankCard || ''),
      bankName: encodeURIComponent(this.data.formData.bankName || '')
    }
    
    const query = Object.keys(params)
      .filter(key => params[key])
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    const url = `/pages/teacher/bank-card/bank-card${query ? '?' + query : ''}`
    
    wx.navigateTo({
      url: url,
      fail: (error) => {
        console.error('跳转到银行卡页面失败:', error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 银行卡信息保存回调
  onBankCardSaved(bankCardData) {
    console.log('银行卡信息保存回调:', bankCardData)
    this.setData({
      'formData.bankCard': bankCardData.bankCard,
      'formData.bankName': bankCardData.bankName
    })
    this.updateDisplayBankCard()
  },

  // 更新格式化显示的银行卡号
  updateDisplayBankCard() {
    const { bankCard } = this.data.formData
    if (bankCard) {
      // 格式化银行卡号显示（每4位加空格）
      const cleanCard = bankCard.replace(/\s/g, '')
      const formatted = cleanCard.replace(/(\d{4})(?=\d)/g, '$1 ')
      this.setData({
        displayBankCard: formatted
      })
    } else {
      this.setData({
        displayBankCard: ''
      })
    }
  },

  // 打开并预览合同
  onOpenContract() {
    const url = this.data.contractUrl || require('../../../config/env').getStaticBaseUrl() + '/api/uploads/2025/08/%E6%96%B0%E6%96%87%E6%9E%A2%E6%95%99%E5%B8%88%E5%85%BC%E8%81%8C%E5%90%88%E5%90%8C.doc'
    wx.downloadFile({
      url,
      success: (res) => {
        const filePath = res.tempFilePath
        wx.openDocument({ filePath, fileType: 'doc', showMenu: true })
      },
      fail: () => wx.showToast({ title: '合同下载失败', icon: 'none' })
    })
  },

  // 签署合同（预留第三方入口，当前仅调用后端完成签署标记）
  onSignContract() {
    wx.request({
      url: require('../../../config/env').getApiBaseUrl() + '/mini/teacher/certification/sign-contract',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        // 预留：若未来接入第三方签署后返回合同文件URL，可在此回传合同URL
        // contractUrl: this.data.contractUrl
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          wx.showToast({ title: '签署成功', icon: 'success' })
          // 重新拉取状态，隐藏签署按钮
          this.loadCertificationData()
        } else {
          wx.showToast({ title: (res.data && res.data.message) || '签署失败', icon: 'none' })
        }
      },
      fail: () => wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  // 上传单张图片
  async uploadImage(field, title) {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })
      const filePath = res && res.tempFilePaths && res.tempFilePaths[0]
      if (!filePath) return

      wx.showLoading({ title: '上传中...', mask: true })
      const up = await api.upload.image(filePath)
      wx.hideLoading()

      const url = up && up.data && (up.data.url || up.data.path)
      if (url) {
        const displayUrl = this.toAbsoluteUrl(url)
        const update = {}
        update[`formData.${field}`] = url
        update[`displayMedia.${field}`] = displayUrl
        this.setData(update)
        wx.showToast({ title: `${title}上传成功`, icon: 'success' })
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '选择图片失败', icon: 'none' })
    }
  },

  // 上传多张图片（学历证书）
  async uploadMultipleImages(field, title) {
    try {
      const res = await wx.chooseImage({
        count: 3,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })
      const tempPaths = res && res.tempFilePaths
      if (!tempPaths || !tempPaths.length) return

      wx.showLoading({ title: '上传中...', mask: true })
      const uploaded = []
      for (const path of tempPaths) {
        const up = await api.upload.image(path)
        if (up && up.data && (up.data.url || up.data.path)) {
          uploaded.push(up.data.url || up.data.path)
        }
      }
      wx.hideLoading()

      if (uploaded.length) {
        const currentCerts = this.data.formData[field] || []
        const currentDisplays = this.data.displayMedia[field] || []
        const absoluteList = uploaded.map((url) => this.toAbsoluteUrl(url))
        const update = {}
        update[`formData.${field}`] = [...currentCerts, ...uploaded]
        update[`displayMedia.${field}`] = [...currentDisplays, ...absoluteList]
        this.setData(update)
        wx.showToast({ title: `${title}上传成功`, icon: 'success' })
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '选择图片失败', icon: 'none' })
    }
  },

  // 上传单张图片到数组（每次只能上传一张，但可以多次上传）
  async uploadSingleImageToArray(field, title) {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })
      const filePath = res && res.tempFilePaths && res.tempFilePaths[0]
      if (!filePath) return

      wx.showLoading({ title: '上传中...', mask: true })
      const up = await api.upload.image(filePath)
      wx.hideLoading()

      const url = up && up.data && (up.data.url || up.data.path)
      if (url) {
        const currentCerts = this.data.formData[field] || []
        const currentDisplays = this.data.displayMedia[field] || []
        const update = {}
        update[`formData.${field}`] = [...currentCerts, url]
        update[`displayMedia.${field}`] = [...currentDisplays, this.toAbsoluteUrl(url)]
        this.setData(update)
        wx.showToast({ title: `${title}上传成功`, icon: 'success' })
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '选择图片失败', icon: 'none' })
    }
  },

  toAbsoluteUrl(relativePath) {
    return relativePath ? toAbsolute(relativePath, 'static') : ''
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data
    
    if (!formData.realName) {
      wx.showToast({
        title: '请填写真实姓名',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.idCardFront || !formData.idCardBack) {
      wx.showToast({
        title: '请上传身份证正反面',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.graduateSchool) {
      wx.showToast({
        title: '请填写毕业院校',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.education) {
      wx.showToast({
        title: '请选择学历',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.diplomaCerts || formData.diplomaCerts.length === 0) {
      wx.showToast({
        title: '请上传学历证明',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.teacherCerts || formData.teacherCerts.length === 0) {
      wx.showToast({
        title: '请上传教师资格证',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 提交认证信息
  async onSubmit() {
    if (!this.data.isEditable) {
      wx.showToast({
        title: '当前状态不可编辑',
        icon: 'none'
      })
      return
    }
    
    if (!this.validateForm()) {
      return
    }
    
    wx.showLoading({
      title: '提交中...'
    })
    
    try {
      const result = await this.submitCertification(this.data.formData)
      
      wx.hideLoading()
      
      if (result.code === 200 || result.success) {
        wx.showToast({ title: '预约成功', icon: 'success' })
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/teacher/profile/profile' })
        }, 1500)
      } else {
        wx.showToast({
          title: result.message || '提交失败',
          icon: 'none'
        })
      }
      
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
      console.error('提交认证信息失败:', error)
    }
  },

  // 获取认证状态
  async getCertificationStatus() {
    return request.get(`${getApiBaseUrl()}/mini/teacher/certification/status`)
  },

  // 提交认证
  async submitCertification(formData) {
    // 转换数据格式：将数组转换为JSON字符串，以匹配后端期望的格式
    const submitData = {
      ...formData,
      diplomaCerts: JSON.stringify(formData.diplomaCerts || []),
      teacherCerts: JSON.stringify(formData.teacherCerts || []),
      awardCerts: JSON.stringify(formData.awardCerts || [])
    }
    
    return request.post(`${getApiBaseUrl()}/mini/teacher/certification/submit`, submitData)
  },

  // 加载通知
  async loadNotifications() {
    try {
      const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
      const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
      if (!userInfo || !userInfo.id) {
        return
      }

      const res = await this.getNotifications(userInfo.id)
      if (res.success) {
        this.setData({
          notifications: res.data || []
        })
        this.loadUnreadCount(userInfo.id)
      }
    } catch (error) {
      console.error('加载通知失败:', error)
    }
  },

  // 加载未读通知数量
  async loadUnreadCount(teacherId) {
    try {
      const res = await this.getUnreadCount(teacherId)
      if (res.success) {
        this.setData({
          unreadCount: res.data || 0
        })
        // 更新tabBar角标
        this.updateTabBarBadge(res.data || 0)
      }
    } catch (error) {
      console.error('加载未读通知数量失败:', error)
    }
  },

  // 更新tabBar角标
  updateTabBarBadge(count) {
    if (count > 0) {
      wx.setTabBarBadge({
        index: 3, // 假设"我的"页面是第4个tab
        text: count.toString()
      })
    } else {
      wx.removeTabBarBadge({
        index: 3
      })
    }
  },

  // 显示/隐藏通知列表
  toggleNotifications() {
    this.setData({
      showNotifications: !this.data.showNotifications
    })
  },

  // 标记通知为已读
  async markNotificationAsRead(e) {
    const { notificationId } = e.currentTarget.dataset
    const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
    const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
    
    try {
      const res = await this.markAsRead(notificationId, userInfo.id)
      if (res.success) {
        // 重新加载通知列表和未读数量
        this.loadNotifications()
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  },

  // 标记所有通知为已读
  async markAllAsRead() {
    const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
    const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
    
    try {
      const res = await this.markAllAsReadAPI(userInfo.id)
      if (res.success) {
        wx.showToast({
          title: '全部已读',
          icon: 'success'
        })
        this.loadNotifications()
      }
    } catch (error) {
      console.error('标记全部已读失败:', error)
    }
  },

  // 进入页面时自动标记所有通知为已读（静默执行）
  async markAllNotificationsAsReadOnEnter() {
    const userInfoStr = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || '{}'
    const userInfo = typeof userInfoStr === 'string' ? JSON.parse(userInfoStr) : userInfoStr
    
    if (!userInfo || !userInfo.id) {
      return
    }
    
    try {
      // 使用新的红点系统隐藏教师认证红点
      await badgeManager.hideBadge(userInfo.id, 'teacher', 'certification')
      
      // 继续处理老的通知系统（向后兼容）
      await this.markAllAsReadAPI(userInfo.id)
      // 静默执行，不显示提示
      // 重新加载通知列表和未读数量
      this.loadNotifications()
      
      console.log('教师认证红点已隐藏')
    } catch (error) {
      console.error('自动标记全部已读失败:', error)
      // 失败时不显示错误提示，保持用户体验
    }
  },

  // API方法：获取通知列表
  async getNotifications(teacherId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${getApiBaseUrl()}/mini/notification/list`,
        method: 'GET',
        data: { teacherId },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  // API方法：获取未读通知数量
  async getUnreadCount(teacherId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${getApiBaseUrl()}/mini/notification/unread-count`,
        method: 'GET',
        data: { teacherId },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  // API方法：标记通知为已读
  async markAsRead(notificationId, teacherId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${getApiBaseUrl()}/mini/notification/mark-read`,
        method: 'POST',
        data: { notificationId, teacherId },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  // API方法：标记所有通知为已读
  async markAllAsReadAPI(teacherId) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${getApiBaseUrl()}/mini/notification/mark-all-read`,
        method: 'POST',
        data: { teacherId },
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('网络请求失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '教师认证',
      path: '/pages/teacher/certification/certification'
    }
  }
})
