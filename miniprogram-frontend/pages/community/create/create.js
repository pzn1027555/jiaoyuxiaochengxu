const communityApi = require('../../../api/community')
const api = require('../../../utils/api')

Page({
  data:{
    categories: [],
    subjects: [],
    subjectMap: {},
    subjectPickerIndex: 0,
    types: [
      { key:'question', name:'问答' },
      { key:'share', name:'分享' },
      { key:'discussion', name:'讨论' }
    ],
    form:{
      category_id: '',
      categoryName: '',
      post_type: 'question',
      post_type_label: '问答',
      post_title: '',
      post_content: ''
    },
    images: []
  },
  onLoad(){ this.loadSubjects() },
  
  // 使用与社区主页面相同的科目分类逻辑
  async loadSubjects(){
    try{
      console.log('=== 开始加载科目分类 ===')
      const ccApi = require('../../../api/courseCategory')
      const res = await ccApi.getCategoryList()
      console.log('API响应:', res)
      
      const arr = (res && res.success && Array.isArray(res.data)) ? res.data : []
      console.log('原始数据数组:', arr)
      
      const nameToId = {}
      const subjects = []
      
      // 筛选一级分类
      const filteredArr = arr.filter(x=> (x.level||x.level===0) ? x.level===1 : (x.parentId==null))
      console.log('筛选后的一级分类:', filteredArr)
      
      filteredArr.forEach(x => {
        const name = x.name || x.categoryName || x.category_name
        const id = x.id || x.categoryId || x.category_id
        console.log(`处理科目: name=${name}, id=${id}`)
        
        if(name && id){ 
          nameToId[name] = id
          subjects.push({ id, name })
        }
      })
      
      console.log('最终的subjects数组:', subjects)
      console.log('最终的nameToId映射:', nameToId)
      
      this.setData({ subjects, subjectMap: nameToId })
      console.log('设置后的data.subjects:', this.data.subjects)
      
    }catch(e){
      console.error('加载科目分类失败:', e)
      wx.showToast({ title: '加载科目失败', icon: 'none' })
    }
  },
  // picker 科目选择变化
  onSubjectPickerChange(e){
    const index = parseInt(e.detail.value)
    const subjects = this.data.subjects || []
    const subject = subjects[index]
    
    if(subject){
      console.log('选择的科目:', subject)
      this.setData({ 
        'form.category_id': subject.id, 
        'form.categoryName': subject.name,
        subjectPickerIndex: index
      })
      console.log('设置后的form:', this.data.form)
    }
  },
  onPickType(){ wx.showActionSheet({ itemList: this.data.types.map(t=>t.name), success: ({tapIndex})=>{
    const t = this.data.types[tapIndex]
    this.setData({ 'form.post_type': t.key, 'form.post_type_label': t.name })
  }}) },
  onTitleInput(e){ this.setData({ 'form.post_title': e.detail.value }) },
  onContentInput(e){ this.setData({ 'form.post_content': e.detail.value }) },
  async onChooseImage(){
    try{
      // 检查当前已有图片数量
      const currentCount = this.data.images.length
      const maxCount = 3
      const remainingCount = maxCount - currentCount
      
      if(remainingCount <= 0){
        wx.showToast({ title: `最多只能上传${maxCount}张图片`, icon: 'none' })
        return
      }
      
      const r = await wx.chooseMedia({ count: remainingCount, mediaType:['image'] })
      const files = r.tempFiles||[]
      
      wx.showLoading({ title: '上传中...' })
      
      for(const f of files){
        await this.uploadOne(f.tempFilePath)
      }
      
      wx.hideLoading()
      
    }catch(e){
      wx.hideLoading()
      console.error('选择图片失败:', e)
    }
  },
  uploadOne(path){
    return new Promise(async (resolve)=>{
      try{
        const up = await api.upload.image(path)
        const data = up && (up.data || up)
        let url = (data && (data.url || data.path)) || ''
        if(url){
          const { toAbsolute } = require('../../../utils/urlUtils')
          const fullUrl = toAbsolute(url, 'upload')
          const images = this.data.images.slice()
          images.push({ url: fullUrl })
          this.setData({ images })
          console.log('图片上传成功:', fullUrl)
        } else {
          wx.showToast({ title: '图片上传失败', icon: 'none' })
        }
      }catch(e){
        console.error('上传失败:', e)
        wx.showToast({ title: '图片上传失败', icon: 'none' })
      }
      resolve()
    })
  },
  onDeleteImage(e){
    const index = parseInt(e.currentTarget.dataset.index)
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images })
    wx.showToast({ title: '图片已删除', icon: 'success', duration: 1000 })
  },
  async onSubmit(){
    const { form, images } = this.data
    if(!form.category_id){ wx.showToast({ title:'请选择科目', icon:'none' }); return }
    if(!form.post_title){ wx.showToast({ title:'请填写标题', icon:'none' }); return }
    if(!form.post_content){ wx.showToast({ title:'请填写内容', icon:'none' }); return }
    
    wx.showLoading({ title: '发布中...' })
    
    try {
      const payload = {
        post_title: form.post_title,
        post_content: form.post_content,
        post_type: form.post_type,
        category_id: form.category_id,
        images: JSON.stringify(images.map(i=>i.url)),
        author_id: (getApp().globalData.userInfo && getApp().globalData.userInfo.id) || 0,
        author_type: (getApp().globalData.userRole)||'student'
      }
      
      const r = await communityApi.createPost(payload)
      if(r&&r.success){ 
        wx.hideLoading()
        wx.showToast({ title:'发布成功', icon:'success' })
        setTimeout(()=> wx.navigateBack(), 1000) 
      } else {
        wx.hideLoading()
        wx.showToast({ title: r.message || '发布失败', icon:'none' })
      }
    } catch(e) {
      wx.hideLoading()
      wx.showToast({ title:'发布失败，请重试', icon:'none' })
      console.error('发布帖子失败:', e)
    }
  },
  onPreview(e){ const i = e.currentTarget.dataset.index; const urls=this.data.images.map(x=>x.url); wx.previewImage({ current: urls[i], urls }) }
})


