// pages/teacher/resources/resources.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const { getApiBaseUrl, getStaticBaseUrl } = require('../../../config/env')

Page({
  data: {
    resources: [],
    loading: false,
    showUploadModal: false,
    showDetailModal: false,
    selectedResource: null
  },

  onLoad() {
    console.log('教师资源中心加载')
    this.initPage()
  },

  onShow() {
    this.checkAuth()
    this.loadResources()
    // 设置TabBar选中状态（资源中心是第1个）
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1)
    }
  },

  onPullDownRefresh() {
    this.loadResources().finally(() => {
      wx.stopPullDownRefresh()
    })
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

  // 初始化页面
  initPage() {
    if (!this.checkAuth()) return
    this.loadResources()
  },

  // 加载资源列表
  async loadResources() {
    this.setData({ loading: true })
    
    try {
      // 拉取三类资源并合并展示
      const [materials, videos, certs] = await Promise.all([
        api.teacherResource.getList({ type: 'material', page: 1, size: 20 }),
        api.teacherResource.getList({ type: 'trial_video', page: 1, size: 20 }),
        api.teacherResource.getList({ type: 'certificate', page: 1, size: 20 })
      ])

      const toList = (res, fallbackType) => {
        const arr = res && res.success
          ? (Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.records) ? res.data.records : []))
          : []
        return arr.map(it => ({
          id: it.id,
          title: it.title,
          type: it.type || fallbackType,
          price: it.price || 0,
          preview: this.resolvePreview(it),
          description: it.description || '',
          fileUrl: it.fileUrl || '',
          coverUrl: it.coverUrl || '',
          createTime: this.formatTime(it.createTime || it.time),
          fileSizeText: it.fileSizeText || ''
        }))
      }

      const list = [
        ...toList(materials, 'material'),
        ...toList(videos, 'trial_video'),
        ...toList(certs, 'certificate')
      ]

      this.setData({ resources: list })
    } catch (error) {
      console.error('加载资源失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 解析预览图：优先 coverUrl，否则按扩展名给默认图标
  resolvePreview(item) {
    if (item && item.coverUrl) return this.toAbsolute(item.coverUrl)
    const url = item && item.fileUrl ? item.fileUrl.toLowerCase() : ''
    if (url) {
      const abs = this.toAbsolute(item.fileUrl)
      if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif') || url.endsWith('.webp')) return abs
      if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) return '/images/icons/video.png'
    }
    return '/images/icons/document.png'
  },

  // 将相对地址转为可访问的绝对地址
  toAbsolute(url) {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    const base = getStaticBaseUrl()
    if (!base) return url
    if (url.startsWith('/')) return `${base}${url}`
    return `${base}/${url}`
  },

  // 时间格式化（yyyy-MM-dd HH:mm）
  formatTime(v) {
    if (!v) return ''
    try {
      const d = typeof v === 'string' ? new Date(v) : new Date(v.time || v)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch(_) { return '' }
  },

  // 显示上传选项 - 跳转到上传页面
  showUploadOptions() {
    wx.navigateTo({
      url: '/pages/teacher/upload/upload'
    })
  },

  // 隐藏上传弹窗
  hideUploadModal() {
    this.setData({
      showUploadModal: false
    })
  },

  // 选择上传类型
  selectUploadType(e) {
    const type = e.currentTarget.dataset.type
    console.log('选择上传类型:', type)
    
    this.hideUploadModal()
    
    switch (type) {
      case 'document':
        this.uploadDocument()
        break
      case 'video':
        this.uploadVideo()
        break
      case 'image':
        this.uploadImage()
        break
    }
  },

  // 上传文档
  uploadDocument() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        console.log('选择文档:', res)
        this.handleFileUpload(res.tempFiles[0], 'document')
      },
      fail: (error) => {
        console.error('选择文档失败:', error)
      }
    })
  },

  // 上传视频
  uploadVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        console.log('选择视频:', res)
        this.handleFileUpload({
          path: res.tempFilePath,
          size: res.size,
          name: '视频文件'
        }, 'video')
      },
      fail: (error) => {
        console.error('选择视频失败:', error)
      }
    })
  },

  // 上传图片
  uploadImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择图片:', res)
        res.tempFilePaths.forEach(filePath => {
          this.handleFileUpload({
            path: filePath,
            name: '图片文件'
          }, 'image')
        })
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
      }
    })
  },

  // 处理文件上传
  async handleFileUpload(file, type) {
    try {
      wx.showLoading({ title: '上传中...' })
      
      console.log('上传文件:', file, type)
      
      // 这里调用上传API
      // const result = await api.upload.file(file.path, type)
      
      wx.hideLoading()
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
      
      // 重新加载资源列表
      this.loadResources()
      
    } catch (error) {
      wx.hideLoading()
      console.error('文件上传失败:', error)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    }
  },

  // 删除资源
  deleteResource(e) {
    const resourceId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '删除资源',
      content: '确定要删除这个资源吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.confirmDeleteResource(resourceId)
        }
      }
    })
  },

  // 确认删除资源
  async confirmDeleteResource(resourceId) {
    try {
      wx.showLoading({ title: '删除中...' })
      await api.teacherResource.remove(resourceId)

      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
      // 重新加载资源列表
      this.loadResources()
      
    } catch (error) {
      wx.hideLoading()
      console.error('删除资源失败:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  // 重新上传资源
  reuploadResource(e) {
    const resourceId = e.currentTarget.dataset.id
    const resource = this.data.resources.find(r => r.id === resourceId)
    
    if (!resource) {
      wx.showToast({
        title: '资源信息未找到',
        icon: 'none'
      })
      return
    }
    
    console.log('重新上传资源:', resourceId, resource)
    
    // 跳转到上传页面的编辑模式
    wx.navigateTo({
      url: `/pages/teacher/upload/upload?mode=edit&id=${resourceId}&title=${encodeURIComponent(resource.title)}&price=${resource.price}&description=${encodeURIComponent(resource.description || '')}&type=${resource.type}&coverUrl=${encodeURIComponent(resource.coverUrl || '')}&fileUrl=${encodeURIComponent(resource.fileUrl || '')}`
    })
  },

  // 显示资源详情
  showResourceDetail(e) {
    const resourceId = e.currentTarget.dataset.id
    const resource = this.data.resources.find(r => r.id === resourceId)
    
    if (resource) {
      this.setData({
        selectedResource: resource,
        showDetailModal: true
      })
    }
  },

  // 隐藏详情弹窗
  hideDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedResource: null
    })
  },

  // 下载资源
  downloadResource() {
    const resource = this.data.selectedResource
    if (!resource) return
    
    wx.showLoading({ title: '准备下载...' })
    
    // 这里实现下载逻辑
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '下载完成',
        icon: 'success'
      })
    }, 2000)
  },

  // 编辑资源
  editResource() {
    const resource = this.data.selectedResource
    if (!resource) return
    
    this.hideDetailModal()
    
    wx.navigateTo({
      url: `/pages/teacher/edit-resource/edit-resource?id=${resource.id}`
    })
  },

  // 显示菜单
  showMenu() {
    wx.showActionSheet({
      itemList: ['批量管理', '导入资源', '导出列表', '设置'],
      success: (res) => {
        console.log('菜单选择:', res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            this.batchManage()
            break
          case 1:
            this.importResources()
            break
          case 2:
            this.exportList()
            break
          case 3:
            this.showSettings()
            break
        }
      }
    })
  },

  // 批量管理
  batchManage() {
    wx.showToast({
      title: '批量管理功能开发中',
      icon: 'none'
    })
  },

  // 导入资源
  importResources() {
    wx.showToast({
      title: '导入资源功能开发中',
      icon: 'none'
    })
  },

  // 导出列表
  exportList() {
    wx.showToast({
      title: '导出列表功能开发中',
      icon: 'none'
    })
  },

  // 显示设置
  showSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  // 阻止弹窗关闭
  preventClose() {
    // 空函数，阻止事件冒泡
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '新文枢教育 - 教师资源中心',
      path: '/pages/teacher/resources/resources'
    }
  }
})