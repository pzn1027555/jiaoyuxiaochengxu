const request = require('../../../utils/request.js')
const api = require('../../../utils/api')

Page({
  data: {
    orderId: '',
    teacherId: '',
    courseName: '',
    teacherName: '',
    rating: 5,
    form: {
      reviewContent: '',
      isAnonymous: false
    },
    images: [],
    readonly: false
  },

  onLoad(options) {
    this.setData({
      orderId: options.orderId || '',
      teacherId: options.teacherId || '',
      courseName: decodeURIComponent(options.courseName || ''),
      teacherName: options.teacherName || '',
      readonly: options.readonly === '1'
    })
    
    // 获取教师信息
    if (options.teacherId) {
      this.loadTeacherInfo(options.teacherId)
    }

    // 只读模式下，加载评价详情
    if (this.data.readonly && this.data.orderId) {
      this.loadReviewDetail(this.data.orderId)
    }
  },

  // 获取教师信息
  async loadTeacherInfo(teacherId) {
    try {
      const response = await request.get(`/mini/teacher/${teacherId}`)
      if (response && response.success) {
        this.setData({
          teacherName: response.data.teacherName || response.data.name || ''
        })
      }
    } catch (error) {
      console.error('Load teacher info error:', error)
    }
  },

  // 加载评价详情
  async loadReviewDetail(orderId) {
    try {
      const res = await request.get(`/mini/review/detail/${orderId}`)
      if (res && res.success && res.data) {
        const d = res.data
        const imgs = Array.isArray(d.reviewImages) ? d.reviewImages.map(url => ({ url })) : []
        this.setData({
          rating: d.starRating || 0,
          'form.reviewContent': d.reviewContent || '',
          'form.isAnonymous': !!d.isAnonymous,
          images: imgs
        })
      }
    } catch (e) {
      console.error('Load review detail error:', e)
    }
  },

  // 评分点击
  onRatingTap(e) {
    if (this.data.readonly) return
    const rating = e.currentTarget.dataset.rating
    this.setData({ rating })
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      'form.reviewContent': e.detail.value
    })
  },

  // 匿名选项变化
  onAnonymousChange(e) {
    try {
      const values = e.detail.value || []
      const checked = values.indexOf('anonymous') !== -1
      this.setData({ 'form.isAnonymous': checked })
    } catch(err) {
      this.setData({ 'form.isAnonymous': false })
    }
  },

  // 选择图片
  async onChooseImage() {
    try {
      const currentCount = this.data.images.length
      const maxCount = 3
      const remainingCount = maxCount - currentCount
      
      if (remainingCount <= 0) {
        wx.showToast({ 
          title: `最多只能上传${maxCount}张图片`, 
          icon: 'none' 
        })
        return
      }
      
      const result = await wx.chooseMedia({ 
        count: remainingCount, 
        mediaType: ['image'] 
      })
      
      if (result.tempFiles && result.tempFiles.length > 0) {
        const newImages = result.tempFiles.map(file => ({
          url: file.tempFilePath,
          size: file.size
        }))
        
        this.setData({
          images: [...this.data.images, ...newImages]
        })
      }
    } catch (error) {
      console.error('Choose image error:', error)
    }
  },

  // 预览图片
  onPreview(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.images.map(img => img.url)
    wx.previewImage({
      current: urls[index],
      urls: urls
    })
  },

  // 删除图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 上传图片到服务器（统一使用 utils/api.js 的上传封装）
  async uploadImages() {
    if (this.data.images.length === 0) return []
    
    try {
      const uploadPromises = this.data.images.map(async (image) => {
        const up = await api.upload.image(image.url)
        const data = up && (up.data || up)
        const rel = (data && (data.url || data.path)) || ''
        const { toAbsolute } = require('../../../utils/urlUtils')
        const full = toAbsolute(rel, 'upload')
        return full
      })
      
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Upload images error:', error)
      throw error
    }
  },

  // 提交评价
  async onSubmit() {
    // 验证必填项
    if (!this.data.form.reviewContent.trim()) {
      wx.showToast({
        title: '请填写评价内容',
        icon: 'none'
      })
      return
    }

    if (!this.data.orderId || !this.data.teacherId) {
      wx.showToast({
        title: '订单信息缺失',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    try {
      // 上传图片
      let imageUrls = []
      if (this.data.images.length > 0) {
        imageUrls = await this.uploadImages()
      }

      // 提交评价
      const response = await request.post('/mini/review/submit', {
        orderId: this.data.orderId,
        teacherId: this.data.teacherId,
        starRating: this.data.rating,
        reviewContent: this.data.form.reviewContent.trim(),
        reviewImages: imageUrls,
        isAnonymous: this.data.form.isAnonymous ? 1 : 0
      })

      wx.hideLoading()

      if (response && response.success) {
        wx.showModal({
          title: '评价成功',
          content: '感谢您的评价！',
          showCancel: false,
          confirmText: '确定',
          success: () => {
            wx.navigateBack()
          }
        })
      } else {
        throw new Error(response?.message || '提交失败')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('Submit review error:', error)
      wx.showToast({
        title: error.message || '提交失败，请重试',
        icon: 'none'
      })
    }
  }
})
