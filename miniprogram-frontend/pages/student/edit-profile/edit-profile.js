const profileApi = require('../../../api/profile')
const subjectApi = require('../../../api/subject')
const api = require('../../../utils/api')

Page({
  data: {
    headerHeight: 0,
    userProfile: {
      avatar: '',
      name: '',
      gender: '',
      birthDate: '',
      grade: '',
      province: '',
      city: '',
      district: '',
      detailAddress: '',
      phone: '',
      subjects: [],
      introduction: ''
    },
    // picker 与弹窗
    genderOptions: ['男', '女'],
    regionPickerRange: [[], [], []],
    regionPickerValue: [0,0,0],
    subjectOptions: [],
    subjectIdNameMap: {},
    displaySubjects: [],
    showSubjectPicker:false,
    selectedSubjectsForPicker: [],
    showAddressModal: false,
    showNameModal: false,
    tempDetailAddress: '',
    tempDetailName: '',
    regionData: [],
    gradeOptions: ['一年级','二年级','三年级','四年级','五年级','六年级','初一','初二','初三','高一','高二','高三']
  },

  onLoad(){
    this.loadRegionData()
    this.loadSubjectCategories()
    this.loadUserProfile()
  },

  onHeaderReady(e){
    const { totalHeight } = e.detail || {}
    if(typeof totalHeight === 'number'){
      this.setData({ headerHeight: totalHeight })
    }
  },

  async loadUserProfile(){
    try{
      const res = await profileApi.getStudentProfile()
      if(res && res.success){
        const p = res.data || {}
        // 兼容新结构：subjects=[{id,name}], subjectIds=[id]
        const subjectIds = Array.isArray(p.subjectIds) ? p.subjectIds : (Array.isArray(p.subjects) && p.subjects.length && typeof p.subjects[0] === 'object' ? p.subjects.map(s=>s.id) : (p.subjects||[]))
        const subjectDisplayList = Array.isArray(p.subjects) && p.subjects.length && typeof p.subjects[0] === 'object'
          ? p.subjects.map(s => ({ id: s.id, name: s.name }))
          : subjectIds.map(id => ({ id, name: String(id) }))
        const userProfile = {
          avatar: p.avatar || '',
          name: p.name || p.studentName || '',
          gender: this.convertGenderToText(p.gender),
          birthDate: p.birthDate || p.birth_date || '',
          grade: p.grade || '',
          province: p.province || '',
          city: p.city || '',
          district: p.district || '',
          detailAddress: p.address || '',
          phone: p.phone || '',
          subjects: subjectIds,
          introduction: p.introduction || ''
        }
        this.setData({
          userProfile,
          selectedSubjectsForPicker: this.buildSelectedList(subjectIds),
          displaySubjects: subjectDisplayList
        })
        this.refreshDisplaySubjects()
        this.updateRegionText()
      }
    }catch(e){}
  },

  async loadSubjectCategories(){
    try{
      const result = await subjectApi.getSubjectCategories()
      if(result && result.success && result.data && Array.isArray(result.data.categories)){
        const categories = result.data.categories
        const subjectOptions = categories.map(l1=>({
          name: l1.categoryName,
          subjects: (l1.children||[]).map(s=>({ id:s.id, name:s.categoryName }))
        }))
        const idName = {}
        subjectOptions.forEach(l1 => (l1.subjects||[]).forEach(s=>{ idName[String(s.id)] = s.name }))
        this.setData({ subjectOptions, subjectIdNameMap:idName })
        this.refreshDisplaySubjects()
      }
    }catch(e){}
  },

  loadRegionData(){
    // 复用教师端的 regionData（截取前三省，避免体积过大可按需精简）
    const app = getApp()
    try{
      // 简单构造最小可用数据，实际项目可抽出到公共模块
      const regionData = [
        { name:'北京市', cities:[{name:'北京市', districts:['东城区','西城区','朝阳区','丰台区','海淀区']}] },
        { name:'上海市', cities:[{name:'上海市', districts:['黄浦区','徐汇区','长宁区','静安区','普陀区']}] },
        { name:'广东省', cities:[{name:'广州市', districts:['越秀区','天河区','海珠区']}] }
      ]
      const provinces = regionData.map(i=>i.name)
      const cities = regionData[0].cities.map(i=>i.name)
      const districts = regionData[0].cities[0].districts
      this.setData({ regionData, regionPickerRange:[provinces, cities, districts] })
    }catch(e){}
  },

  // 头像/基本输入（选择后立即上传，保存返回URL）
  selectAvatar(){
    wx.chooseImage({ count:1, sizeType:['compressed'], sourceType:['album','camera'], success: async (res)=>{
      try{
        const filePath = res && res.tempFilePaths && res.tempFilePaths[0]
        if(!filePath) return
        wx.showLoading({ title:'上传中...' })
        const up = await api.upload.image(filePath)
        const rel = (up && up.data && (up.data.url || up.data.path)) || (up && up.url) || ''
        const { toAbsolute } = require('../../../utils/urlUtils')
        const url = toAbsolute(rel, 'upload')
        wx.hideLoading()
        if(url){ this.setData({ 'userProfile.avatar': url }); wx.showToast({ title:'上传成功', icon:'success' }) }
        else { wx.showToast({ title:'上传失败', icon:'none' }) }
      }catch(e){ wx.hideLoading(); wx.showToast({ title:'上传失败', icon:'none' }) }
    } })
  },
  onPhoneInput(e){ this.setData({ 'userProfile.phone': e.detail.value }) },
  onIntroductionInput(e){ this.setData({ 'userProfile.introduction': e.detail.value }) },
  editDetailAddress(){ this.setData({ showAddressModal:true, tempDetailAddress:this.data.userProfile.detailAddress }) },
  onDetailAddressInput(e){ this.setData({ tempDetailAddress:e.detail.value }) },
  confirmDetailAddress(){ this.setData({ 'userProfile.detailAddress': this.data.tempDetailAddress, showAddressModal:false }) },
  editDetailName(){ this.setData({ showNameModal:true, tempDetailName:this.data.userProfile.name }) },
  onDetailNameInput(e){ this.setData({ tempDetailName:e.detail.value }) },
  confirmDetailName(){ this.setData({ 'userProfile.name': this.data.tempDetailName, showNameModal:false }) },
  hideNameModal(){ this.setData({ showNameModal:false }) },
  hideAddressModal(){ this.setData({ showAddressModal:false }) },

  // 性别
  selectGender(){ wx.showActionSheet({ itemList:this.data.genderOptions, success:(res)=> this.setData({'userProfile.gender': this.data.genderOptions[res.tapIndex]}) }) },
  convertGenderToText(n){ if(n===1) return '男'; if(n===2) return '女'; return '' },
  convertTextToGender(t){ if(t==='男') return 1; if(t==='女') return 2; return null },

  // 出生日期
  onBirthChange(e){ this.setData({ 'userProfile.birthDate': e.detail.value }) },

  // 年级（改为原生selector，避免某些机型点击无响应）
  onGradePickerChange(e){ const idx = Number(e.detail.value||0); const g=this.data.gradeOptions[idx]; this.setData({ 'userProfile.grade': g }) },

  // 地区
  onRegionColumnChange(e){
    const { column, value } = e.detail
    const { regionPickerValue, regionData, regionPickerRange } = this.data
    if(column===0){
      const newCities = regionData[value]?regionData[value].cities.map(c=>c.name):[]
      const newDistricts = regionData[value] && regionData[value].cities[0]?regionData[value].cities[0].districts:[]
      this.setData({ regionPickerValue:[value,0,0], regionPickerRange:[regionPickerRange[0], newCities, newDistricts] })
    }else if(column===1){
      const newDistricts = regionData[regionPickerValue[0]] && regionData[regionPickerValue[0]].cities[value]?regionData[regionPickerValue[0]].cities[value].districts:[]
      this.setData({ regionPickerValue:[regionPickerValue[0], value, 0], regionPickerRange:[regionPickerRange[0], regionPickerRange[1], newDistricts] })
    }
  },
  onRegionChange(e){
    const [pi, ci, di] = e.detail.value
    const p = this.data.regionData[pi]
    const c = p.cities[ci]
    const d = c.districts[di]
    this.setData({ 'userProfile.province': p.name, 'userProfile.city': c.name, 'userProfile.district': d, regionPickerValue:[pi,ci,di] })
    this.updateRegionText()
  },
  updateRegionText(){
    const { province, city, district } = this.data.userProfile
    this.setData({ regionText: `${province||''}${city||''}${district||''}` })
  },

  // 意向学科（复用教师端多列picker逻辑）
  openSubjectPicker(){
    this.setData({
      showSubjectPicker:true,
      selectedSubjectsForPicker: this.buildSelectedList(this.data.userProfile.subjects)
    })
  },
  closeSubjectPicker(){ this.setData({ showSubjectPicker:false }) },
  onSubjectPickerConfirm(e){
    const value = e.detail && e.detail.value ? e.detail.value : []
    const ids = value.map(item => item.id)
    this.setData({ 
      'userProfile.subjects': ids, 
      showSubjectPicker:false,
      // 页面展示使用对象，便于删除时拿到 id
      displaySubjects: value.map(v => ({ id: v && v.id, name: (v && v.name) || String(v && v.id || '') }))
    })
    this.refreshDisplaySubjects()
  },
  buildSelectedList(ids){
    if(!Array.isArray(ids) || !ids.length) return []
    const list = []
    const options = this.data.subjectOptions || []
    ids.forEach(id => {
      let found = null
      options.forEach(level1 => {
        (level1.subjects || []).forEach(level2 => {
          if(String(level2.id) === String(id)){
            found = { id: level2.id, name: level2.name, parentName: level1.name }
          }
        })
      })
      if(!found){
        const map = this.data.subjectIdNameMap || {}
        const fallback = map[String(id)] || map[id] || String(id)
        found = { id, name: fallback, parentName: '' }
      }
      list.push(found)
    })
    return list
  },
  removeSubject(e){
    const id = e.currentTarget.dataset.id
    let subjects = Array.isArray(this.data.userProfile.subjects)? this.data.userProfile.subjects : []
    if (id !== undefined && id !== null) {
      subjects = subjects.filter(sid => String(sid) !== String(id))
    } else {
      const idx = Number(e.currentTarget.dataset.index)
      if(!isNaN(idx)) subjects = subjects.filter((_,i)=> i!==idx)
    }
    this.setData({ 'userProfile.subjects': subjects })
    this.refreshDisplaySubjects()
  },
  refreshDisplaySubjects(){
    const ids = Array.isArray(this.data.userProfile.subjects)?this.data.userProfile.subjects:[]
    const map = this.data.subjectIdNameMap || {}
    // 先从现有 displaySubjects 里提取已有人性化名称，避免被映射尚未就绪时回退到 id
    const current = Array.isArray(this.data.displaySubjects) ? this.data.displaySubjects : []
    const currentNameById = {}
    current.forEach(it => {
      if (it && it.id != null) {
        currentNameById[String(it.id)] = it.name || String(it.id)
      }
    })
    const items = ids.map(id=>{
      const key = String(id)
      const nameFromMap = map[key] || map[id]
      const name = nameFromMap || currentNameById[key] || String(id)
      return { id, name }
    })
    this.setData({
      displaySubjects: items,
      selectedSubjectsForPicker: this.buildSelectedList(ids)
    })
  },

  // 保存
  async saveProfile(){
    const { userProfile } = this.data
    if(!userProfile.name || !userProfile.name.trim()) return wx.showToast({ title:'请输入姓名', icon:'none' })
    if(!userProfile.phone || !/^1[3-9]\d{9}$/.test(userProfile.phone)) return wx.showToast({ title:'请输入正确的手机号', icon:'none' })
    try{
      wx.showLoading({ title:'保存中...' })
      const body = {
        name: userProfile.name,
        avatar: userProfile.avatar,
        gender: this.convertTextToGender(userProfile.gender),
        birthDate: userProfile.birthDate,
        grade: userProfile.grade,
        province: userProfile.province,
        city: userProfile.city,
        district: userProfile.district,
        address: userProfile.detailAddress,
        phone: userProfile.phone,
        subjects: userProfile.subjects,
        introduction: userProfile.introduction
      }
      const resp = await profileApi.updateUserProfile(body)
      if(resp && resp.success){
        wx.showToast({ title:'已开启学习之路', icon:'success' })
        setTimeout(()=> wx.navigateBack(), 1000)
      }
    }catch(e){ wx.showToast({ title:'保存失败，请重试', icon:'none' }) }
    finally{ wx.hideLoading() }
  },

  preventClose(){}
})

