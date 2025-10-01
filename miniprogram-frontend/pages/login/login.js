// pages/login/login.js
const api = require('../../utils/api')
const auth = require('../../utils/auth')

Page({
  data: {
    phone: '',
    code: '',
    agreed: true,
    canSendCode: false,
    canLogin: false,
    codeButtonText: '获取验证码',
    countdown: 0,
    loginLoading: false,
    wxLoginLoading: false,
    showWxLogin: true,
    
    // 输入框焦点状态
    phoneFocused: false,
    codeFocused: false,
    
    // 弹窗相关
    showModal: false,
    modalTitle: '',
    modalContent: '',
    
    // 协议内容
    serviceAgreement: '服务协议内容...\n\n1. 服务内容\n本平台为用户提供在线教育相关服务...\n\n2. 用户权利和义务\n用户有权使用本平台提供的各项服务...\n\n3. 平台权利和义务\n平台有权对违规用户进行处理...',
    privacyAgreement: '隐私协议内容...\n\n1. 信息收集\n我们会收集您的基本信息用于提供服务...\n\n2. 信息使用\n收集的信息仅用于改善服务质量...\n\n3. 信息保护\n我们采用行业标准的安全措施保护您的信息...'
  },

  onLoad(options) {
    console.log('登录页面加载', options)
    
    // 检查是否已登录
    if (auth.isLoggedIn()) {
      this.redirectToHome()
      return
    }
    
    // 检查是否支持微信登录
    this.checkWxLoginSupport()
    
    // 初始化按钮状态
    this.updateButtonStates()
  },

  onShow() {
    // 页面显示时重新检查登录状态
    if (auth.isLoggedIn()) {
      this.redirectToHome()
    }
  },

  // 检查微信登录支持
  checkWxLoginSupport() {
    const canUseLogin = wx.canIUse('login')
    const canUseGetUserProfile = wx.canIUse('getUserProfile')
    
    this.setData({
      showWxLogin: canUseLogin && canUseGetUserProfile
    })
  },

  // 手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({
      phone: phone
    })
    this.updateButtonStates()
  },

  // 手机号获得焦点
  onPhoneFocus() {
    this.setData({
      phoneFocused: true
    })
  },

  // 手机号失去焦点
  onPhoneBlur() {
    this.setData({
      phoneFocused: false
    })
  },

  // 验证码输入
  onCodeInput(e) {
    const code = e.detail.value
    this.setData({
      code: code
    })
    this.updateButtonStates()
  },

  // 验证码获得焦点
  onCodeFocus() {
    this.setData({
      codeFocused: true
    })
  },

  // 验证码失去焦点
  onCodeBlur() {
    this.setData({
      codeFocused: false
    })
  },

  // 更新按钮状态
  updateButtonStates() {
    const { phone, code, agreed, countdown } = this.data
    const phoneValid = this.validatePhone(phone)
    const codeValid = code.length === 6
    
    const canSendCode = phoneValid && countdown === 0
    const canLogin = phoneValid && codeValid && agreed
    
    // console.log('更新按钮状态:', {
    //   phone,
    //   code,
    //   agreed,
    //   countdown,
    //   phoneValid,
    //   codeValid,
    //   canSendCode,
    //   canLogin
    // })
    
    this.setData({
      canSendCode: canSendCode,
      canLogin: canLogin
    })
  },

  // 验证手机号
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  },

  // 发送验证码
  async sendCode() {
    console.log('点击发送验证码', this.data)
    if (!this.data.canSendCode) {
      console.log('不能发送验证码，当前状态:', {
        canSendCode: this.data.canSendCode,
        phone: this.data.phone,
        countdown: this.data.countdown
      })
      return
    }
    
    const { phone } = this.data
    
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '发送中...' })
      
      // 调用发送验证码接口
      const res = await api.sendSmsCode(phone)
      
      wx.hideLoading()
      
      if (res.success) {
        wx.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        
        // 开始倒计时
        this.startCountdown()
        
        // 开发环境下显示验证码
        if (res.data && res.data.code) {
          console.log('验证码:', res.data.code)
        }
      } else {
        throw new Error(res.message || '发送失败')
      }
      
    } catch (error) {
      wx.hideLoading()
      console.error('发送验证码失败:', error)
      wx.showToast({
        title: error.message || '发送失败，请重试',
        icon: 'none'
      })
    }
  },

  // 开始倒计时
  startCountdown() {
    let countdown = 60
    this.setData({
      countdown: countdown,
      codeButtonText: `${countdown}秒后重发`,
      canSendCode: false
    })

    const timer = setInterval(() => {
      countdown--
      if (countdown > 0) {
        this.setData({
          countdown: countdown,
          codeButtonText: `${countdown}秒后重发`
        })
      } else {
        clearInterval(timer)
        this.setData({
          countdown: 0,
          codeButtonText: '获取验证码'
        })
        this.updateButtonStates()
      }
    }, 1000)
  },

  // 手机号登录
  async handleLogin() {
    if (!this.data.canLogin || this.data.loginLoading) return

    const { phone, code, agreed } = this.data

    if (!agreed) {
      wx.showToast({
        title: '请先同意服务协议和隐私协议',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loginLoading: true })

      const res = await api.phoneLogin({
        phone: phone,
        code: code
      })

      if (res.success) {
        // 登录成功
        const loginData = res.data
        
        // 保存用户基础信息
        auth.setToken(loginData.token)
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 检查用户是否存在于任何角色表中
        console.log('登录响应数据:', loginData)
        
        if (loginData.needRoleSelection) {
          console.log('需要角色选择')
          // 需要选择角色，保存基础用户信息
          auth.setUserInfo({
            phone: phone,
            needRoleSelection: true,
            token: loginData.token
          })
          
          // 立即跳转到角色选择页
          wx.redirectTo({
            url: '/pages/role-select/role-select'
          })
        } else {
          console.log('用户已有角色，userInfo:', loginData.userInfo)
          // 用户已有角色信息，保存完整用户信息，并补充 userId
          const mergedUserInfo = {
            ...loginData.userInfo,
            token: loginData.token,
            needRoleSelection: false
          }
          if (!mergedUserInfo.userId && loginData.userId) {
            mergedUserInfo.userId = loginData.userId
          }
          auth.setUserInfo(mergedUserInfo)
          
          // 保存用户信息到全局状态
          const app = getApp()
          if (app.login) {
            console.log('调用app.login，传入userInfo:', mergedUserInfo)
            app.login(mergedUserInfo)
          }
          
          // 不再本地再次路由，避免重复跳转；app.login 内部已根据角色路由
        }
      }

    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loginLoading: false })
    }
  },

  // 微信登录
  async wxLogin() {
    if (this.data.wxLoginLoading) return

    try {
      this.setData({ wxLoginLoading: true })

      // 获取微信授权码
      const code = await auth.getWxAuth()
      
      // 获取用户信息（如果需要）
      let userInfo = null
      try {
        userInfo = await auth.getWxUserInfo()
      } catch (e) {
        console.log('用户拒绝授权用户信息:', e)
      }

      // 调用登录接口
      const res = await api.wxLogin({
        code: code,
        userInfo: userInfo
      })

      if (res.success) {
        const userInfo = res.data
        
        // 保存用户信息到全局状态
        const app = getApp()
        app.login(userInfo)
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 检查是否需要选择角色
        if (!userInfo.role || userInfo.isFirstLogin) {
          // 跳转到角色选择页
          wx.redirectTo({
            url: '/pages/role-select/role-select'
          })
        } else {
          // 直接跳转到首页
          this.redirectToHome()
        }
      }

    } catch (error) {
      console.error('微信登录失败:', error)
      wx.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ wxLoginLoading: false })
    }
  },

  // 协议同意状态改变
  onAgreementChange(e) {
    const agreed = e.detail.value.includes('agree')
    this.setData({ agreed })
    this.updateButtonStates()
  },

  // 切换协议同意状态
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    })
    this.updateButtonStates()
  },

  // 显示协议
  showAgreement(e) {
    const type = e.currentTarget.dataset.type
    let title = ''
    let content = ''

    if (type === 'service') {
      title = '服务协议'
      content = this.data.serviceAgreement
    } else if (type === 'privacy') {
      title = '隐私协议'
      content = this.data.privacyAgreement
    }

    this.setData({
      showModal: true,
      modalTitle: title,
      modalContent: content
    })
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    })
  },

  // 阻止弹窗关闭
  preventClose() {
    // 空函数，阻止事件冒泡
  },

  // 跳转到首页（按角色默认页）
  redirectToHome() {
    const app = getApp()
    if (app && typeof app.routeByRole === 'function' && app.globalData && app.globalData.userRole) {
      app.routeByRole(app.globalData.userRole)
    } else {
      // 未取到角色时，默认到课程页
      wx.reLaunch({ url: '/pages/courses/courses' })
    }
  }
})