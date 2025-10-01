// 上传资料页面
const auth = require('../../../utils/auth')
const api = require('../../../utils/api')

Page({
  data: {
    // 页面模式：new(新建) 或 edit(编辑)
    mode: 'new',
    
    // 编辑的资源ID
    resourceId: null,
    
    // 页面标题
    pageTitle: '上传资料',
    
    // 按钮文字
    buttonText: '确认上传',
    
    // 价格信息
    priceInfo: {
      price: '30.00'
    },
    
    // 资料描述
    description: '',
    
    // 原始资料标题
    originalTitle: '',
    
    // 资料类型
    resourceType: '',
    categoryOptions: ['学习资料', '试听视频', '资质证书'],
    categoryIndex: 0,
    
    // 选中的文件
    selectedFile: null,

    // 已上传结果（用于预览与提交）
    uploaded: {
      success: false,
      fileUrl: '',
      coverUrl: '',
      name: ''
    },
    
    // 上传状态
    uploading: false,
    
    // 顶部导航栏高度
    headerHeight: 0
  },

  // 将相对地址转为可访问的绝对地址
  toAbsolute(url) {
    const { toAbsolute } = require('../../../utils/urlUtils')
    return toAbsolute(url, 'static')
  },

  onLoad(options) {
    console.log('上传资料页面加载', options)
    this.initPageData(options)
    this.checkAuth()
  },

  onShow() {
    console.log('上传资料页面显示')
  },

  // 初始化页面数据
  initPageData(options) {
    if (options.mode === 'edit') {
      // 编辑模式
      const fileUrl = decodeURIComponent(options.fileUrl || '')
      const coverUrl = decodeURIComponent(options.coverUrl || '')
      this.setData({
        mode: 'edit',
        resourceId: options.id,
        pageTitle: '编辑资料',
        buttonText: '确认修改',
        originalTitle: decodeURIComponent(options.title || ''),
        resourceType: options.type || '',
        priceInfo: {
          price: options.price || '30.00'
        },
        description: decodeURIComponent(options.description || ''),
        uploaded: {
          success: !!(fileUrl || coverUrl),
          fileUrl: fileUrl,
          coverUrl: coverUrl,
          name: decodeURIComponent(options.title || '')
        },
        previewCoverUrl: this.toAbsolute(coverUrl)
      })
    } else {
      // 新建模式（默认）
      this.setData({
        mode: 'new',
        resourceId: null,
        pageTitle: '上传资料',
        buttonText: '确认上传',
        originalTitle: '',
        resourceType: 'material',
        priceInfo: {
          price: '30.00'
        },
        description: ''
      })
    }
  },

  // 检查权限
  checkAuth() {
    const app = getApp()
    
    // 首先检查app.globalData
    if (app.globalData.isLogin && app.globalData.userRole === 'teacher') {
      console.log('教师已登录，继续页面操作')
      return true
    }
    
    // 备用检查：检查本地存储
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.role === 'teacher') {
      console.log('从本地存储确认教师身份')
      return true
    }
    
    // 都没有则需要登录
    console.log('教师身份验证失败，跳转登录')
    wx.showToast({
      title: '请先登录教师账号',
      icon: 'none'
    })
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }, 2000)
    return false
  },

  // 顶部导航栏准备完成
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({
      headerHeight: totalHeight
    })
  },

  // 处理返回按钮点击
  onBackTap() {
    // 可以在这里添加自定义返回逻辑
    // 如果没有特殊处理，组件会自动执行默认返回
  },

  // 显示菜单
  showMenu() {
    wx.showActionSheet({
      itemList: ['上传帮助', '文件格式说明', '价格设置说明'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.showUploadHelp()
            break
          case 1:
            this.showFormatHelp()
            break
          case 2:
            this.showPriceHelp()
            break
        }
      }
    })
  },

  // 显示录制选项
  showRecordOptions() {
    wx.showActionSheet({
      itemList: ['录制视频', '录制音频', '屏幕录制'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.recordVideo()
            break
          case 1:
            this.recordAudio()
            break
          case 2:
            this.recordScreen()
            break
        }
      }
    })
  },

  // 选择文件：每次点击都先让用户选择类型，再进入具体选择器
  selectFile() {
    wx.showActionSheet({
      itemList: ['选择文档(微信文件)','选择图片(相册/相机)','选择视频(相册/相机)'],
      success: (r)=>{
        const idx = r.tapIndex
        if (idx === 0){
          // 文档
          wx.chooseMessageFile({
            count: 1,
            type: 'file',
            extension: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
            success: (res) => {
              const file = res.tempFiles[0]
              if (file.size > 50 * 1024 * 1024) { wx.showToast({ title: '文件大小不能超过50MB', icon: 'none' }); return }
              this.setData({ selectedFile: { path: file.path || file.tempFilePath, size: file.size, name: file.name } })
              this.uploadSelectedFile()
            },
            fail: () => wx.showToast({ title: '选择文件失败', icon: 'none' })
          })
        } else if (idx === 1){
          // 图片
          wx.chooseImage({
            count: 1,
            sizeType: ['original','compressed'],
            sourceType: ['album','camera'],
            success: (res) => {
              const file = { path: res.tempFilePaths[0], size: 0, name: 'image.jpg' }
              this.setData({ selectedFile: file })
              this.uploadSelectedFile()
            },
            fail: () => wx.showToast({ title: '选择图片失败', icon: 'none' })
          })
        } else if (idx === 2){
          // 视频：使用通用文件选择器支持更多格式和大体积
          wx.chooseMessageFile({
            count: 1,
            type: 'video',
            success: (res) => {
              const file = res.tempFiles[0]
              const sizeLimit = 500 * 1024 * 1024 // 500MB
              if (file.size > sizeLimit) { wx.showToast({ title: '视频不超过500MB', icon: 'none' }); return }
              this.setData({ selectedFile: { path: file.path || file.tempFilePath, size: file.size, name: file.name || 'video' } })
              this.uploadSelectedFile()
            },
            fail: () => wx.showToast({ title: '选择视频失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 实际上传到后端，返回相对地址
  async uploadSelectedFile() {
    const { selectedFile, categoryIndex } = this.data
    if (!selectedFile) return
    try {
      wx.showLoading({ title: '上传中...', mask: true })
      const filePath = selectedFile.path || selectedFile.filePath
      console.log('开始上传文件:', filePath)
      
      let up
      if (categoryIndex === 1) {
        up = await api.upload.video(filePath)
      } else if (selectedFile.name && selectedFile.name.match(/\.(pdf|doc|docx|ppt|pptx)$/i)) {
        up = await api.upload.document(filePath)
      } else {
        up = await api.upload.file(filePath)
      }
      console.log('上传结果:', up)
      
      wx.hideLoading()
      if (up && (up.code === 200 || up.success) && up.data && up.data.url) {
        const url = up.data.url
        const coverUrl = up.data.coverUrl || ''
        const size = Number(up.data.size || 0)
        console.log('上传成功，文件URL:', url, '封面URL:', coverUrl)
        
        if (categoryIndex === 2) {
          // 证书：仅用封面
          this.setData({
            uploaded: { success: true, fileUrl: '', coverUrl: url, name: selectedFile.name || 'certificate', size },
            previewCoverUrl: this.toAbsolute(url)
          })
        } else {
          this.setData({
            uploaded: { success: true, fileUrl: url, coverUrl: coverUrl, name: selectedFile.name || 'file', size },
            previewCoverUrl: this.toAbsolute(coverUrl || '')
          })
        }
        wx.showToast({ title: '上传成功', icon: 'success' })
      } else {
        console.error('上传失败，返回数据:', up)
        const errorMsg = up && up.message ? up.message : '上传失败，请检查网络连接'
        wx.showToast({ title: errorMsg, icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      console.error('上传异常:', e)
      const errorMsg = e && e.message ? e.message : '上传失败，请重试'
      wx.showToast({ title: errorMsg, icon: 'none' })
    }
  },

  // 选择封面图
  selectCoverImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success: async (res) => {
        try {
          const tempPath = res.tempFilePaths[0]
          wx.showLoading({ title: '上传封面...', mask: true })
          console.log('开始上传封面:', tempPath)
          
          const up = await api.upload.image(tempPath)
          console.log('封面上传结果:', up)
          
          wx.hideLoading()
          if (up && (up.code === 200 || up.success) && up.data && up.data.url) {
            const url = up.data.url
            this.setData({ 'uploaded.coverUrl': url, previewCoverUrl: this.toAbsolute(url) })
            wx.showToast({ title: '封面已更新', icon: 'success' })
          } else {
            console.error('封面上传失败，返回数据:', up)
            const errorMsg = up && up.message ? up.message : '封面上传失败，请检查网络连接'
            wx.showToast({ title: errorMsg, icon: 'none' })
          }
        } catch (e) {
          wx.hideLoading()
          console.error('封面上传异常:', e)
          const errorMsg = e && e.message ? e.message : '封面上传失败，请重试'
          wx.showToast({ title: errorMsg, icon: 'none' })
        }
      }
    })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = Number(e.detail.value)
    let resourceType = 'material'
    if (index === 1) resourceType = 'trial_video'
    else if (index === 2) resourceType = 'certificate'
    this.setData({ categoryIndex: index, resourceType })
  },

  // 设置价格详情
  setPriceDetails() {
    wx.showModal({
      title: '设置售卖价格',
      editable: true,
      placeholderText: '请输入价格（元）',
      success: (res) => {
        if (res.confirm && res.content) {
          const price = parseFloat(res.content)
          if (isNaN(price) || price < 0) {
            wx.showToast({
              title: '请输入有效价格',
              icon: 'none'
            })
            return
          }
          
          this.setData({
            'priceInfo.price': price.toFixed(2)
          })
        }
      }
    })
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    })
  },

  // 确认上传/修改
  async confirmUpload() {
    const { mode, selectedFile, description, resourceType, priceInfo, categoryIndex, uploaded } = this.data
    
    // 校验已上传
    if (!uploaded.success) {
      if (selectedFile) {
        await this.uploadSelectedFile()
      } else {
        wx.showToast({ title: '请先选择并上传文件', icon: 'none' })
        return
      }
    }
    
    if (!description.trim()) {
      wx.showToast({ title: '请填写资料简介', icon: 'none' })
      return
    }
    // 价格校验：material、trial_video 必填；certificate 不需要
    if (resourceType !== 'certificate'){
      const price = Number(priceInfo.price)
      if (isNaN(price) || price < 0){ wx.showToast({ title:'请输入有效价格', icon:'none' }); return }
    }
    
    this.setData({ uploading: true })
    
    // 根据模式显示不同的提示
    const loadingTitle = mode === 'edit' ? '修改中...' : '上传中...'
    const successTitle = mode === 'edit' ? '修改成功' : '上传成功'
    
    wx.showLoading({ title: loadingTitle, mask: true })
    try {
      // 组装类型
      const type = resourceType || (categoryIndex === 1 ? 'trial_video' : categoryIndex === 2 ? 'certificate' : 'material')
      // 证书仅 coverUrl，其它走 fileUrl
      const payload = {
        type,
        title: this.data.originalTitle || (uploaded.name || '未命名资料'),
        description
      }
      if (type !== 'certificate') payload.price = Number(priceInfo.price || 0)
      if (type === 'certificate') {
        payload.coverUrl = uploaded.coverUrl
        payload.fileUrl = ''
      } else {
        payload.fileUrl = uploaded.fileUrl
        // 若后端已生成封面图（视频/文档），一并提交
        if (uploaded.coverUrl) payload.coverUrl = uploaded.coverUrl
        else payload.coverUrl = ''
      }
      if (uploaded.size) payload.fileSize = uploaded.size
      if (mode === 'edit' && this.data.resourceId) {
        await api.teacherResource.update(this.data.resourceId, payload)
      } else {
        await api.teacherResource.create(payload)
      }
      wx.hideLoading()
      this.setData({ uploading: false })
      wx.showToast({ title: successTitle, icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (e) {
      wx.hideLoading(); this.setData({ uploading: false })
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  // 显示上传帮助
  showUploadHelp() {
    wx.showModal({
      title: '上传帮助',
      content: '1. 支持PDF、Word、PPT格式文件\n2. 文件大小不超过50MB\n3. 建议文件名清晰明了\n4. 填写详细的资料描述',
      showCancel: false
    })
  },

  // 显示格式说明
  showFormatHelp() {
    wx.showModal({
      title: '文件格式说明',
      content: '支持的文件格式：\n• PDF文档 (.pdf)\n• Word文档 (.doc, .docx)\n• PowerPoint演示文稿 (.ppt, .pptx)',
      showCancel: false
    })
  },

  // 显示价格说明
  showPriceHelp() {
    wx.showModal({
      title: '价格设置说明',
      content: '• 可设置为免费资料（价格为0）\n• 付费资料建议价格在1-100元之间\n• 价格一旦设定暂不支持修改',
      showCancel: false
    })
  },

  // 录制视频
  recordVideo() {
    wx.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 300, // 5分钟
      success: (res) => {
        console.log('录制视频成功:', res)
        // 处理录制的视频
      }
    })
  },

  // 录制音频
  recordAudio() {
    wx.showToast({
      title: '音频录制功能开发中',
      icon: 'none'
    })
  },

  // 屏幕录制
  recordScreen() {
    wx.showToast({
      title: '屏幕录制功能开发中',
      icon: 'none'
    })
  }
})
