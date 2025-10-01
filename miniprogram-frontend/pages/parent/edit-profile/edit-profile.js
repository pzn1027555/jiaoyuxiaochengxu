const profileApi = require('../../../api/profile')
const api = require('../../../utils/api')
const { toAbsolute } = require('../../../utils/urlUtils')

Page({
  data: {
    headerHeight: 0,
    userProfile: {
      avatar: '',
      name: '',
      gender: '',
      province: '',
      city: '',
      district: '',
      detailAddress: '',
      phone: '',
      introduction: ''
    },
    genderOptions: ['男', '女'],
    regionPickerRange: [[], [], []],
    regionPickerValue: [0,0,0],
    regionData: [],
    regionText: '',
    showAddressModal: false,
    showNameModal: false,
    tempDetailAddress: '',
    tempDetailName: ''
  },

  onLoad(){
    this.loadRegionData()
    this.loadParentProfile()
  },

  onHeaderReady(e){
    const { totalHeight } = e.detail || {}
    if(typeof totalHeight === 'number') this.setData({ headerHeight: totalHeight })
  },

  async loadParentProfile(){
    try{
      const storageUser = wx.getStorageSync('user_info') || wx.getStorageSync('userInfo') || {}
      const phone = storageUser.phone || storageUser?.parent_info?.phone
      const res = await profileApi.getParentProfile(phone ? { phone } : {})
      if(res && res.success){
        const p = res.data || {}
        const userProfile = {
          avatar: p.avatar || '',
          name: p.name || p.parentName || '',
          gender: this.convertGenderToText(p.gender),
          province: p.province || '',
          city: p.city || '',
          district: p.district || '',
          detailAddress: p.address || '',
          phone: p.phone || '',
          introduction: p.introduction || ''
        }
        this.setData({ userProfile })
        this.updateRegionText()
      }
    }catch(e){ console.error(e) }
  },

  // 地区
  loadRegionData(){
    const regionData = [
      { name:'北京市', cities:[{name:'北京市', districts:['东城区','西城区','朝阳区','丰台区','海淀区']}] },
      { name:'上海市', cities:[{name:'上海市', districts:['黄浦区','徐汇区','长宁区','静安区','普陀区']}] },
      { name:'广东省', cities:[{name:'广州市', districts:['越秀区','天河区','海珠区']}] }
    ]
    const provinces = regionData.map(i=>i.name)
    const cities = regionData[0].cities.map(i=>i.name)
    const districts = regionData[0].cities[0].districts
    this.setData({ regionData, regionPickerRange:[provinces, cities, districts] })
  },
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

  // 输入与弹窗
  selectAvatar(){
    wx.chooseImage({
      count:1,
      sizeType:['compressed'],
      sourceType:['album','camera'],
      success: async (res)=>{
        try{
          const filePath = res && res.tempFilePaths && res.tempFilePaths[0]
          if(!filePath) return
          wx.showLoading({ title:'上传中...' })
          const up = await api.upload.image(filePath)
          const rel = (up && up.data && (up.data.url || up.data.path)) || (up && up.url) || ''
          const url = toAbsolute(rel, 'upload')
          wx.hideLoading()
          if(url){
            this.setData({'userProfile.avatar': url})
            wx.showToast({ title:'上传成功', icon:'success' })
          }else{
            wx.showToast({ title:'上传失败', icon:'none' })
          }
        }catch(e){
          wx.hideLoading()
          console.error('上传头像失败:', e)
          wx.showToast({ title:'上传失败', icon:'none' })
        }
      }
    })
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

  // 保存到后端（沿用 profileApi.updateUserProfile）
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
        province: userProfile.province,
        city: userProfile.city,
        district: userProfile.district,
        address: userProfile.detailAddress,
        phone: userProfile.phone,
        introduction: userProfile.introduction,
        role: 'parent'
      }
      const resp = await profileApi.updateUserProfile(body)
      if(resp && resp.success){
        const app = getApp(); if(app && app.globalData) app.globalData.profileUpdated = true
        wx.showToast({ title:'保存成功', icon:'success' })
        setTimeout(()=> wx.navigateBack(), 800)
      }else{
        wx.showToast({ title:'保存失败', icon:'none' })
      }
    }catch(e){ wx.showToast({ title:'保存失败', icon:'none' }) }
    finally{ wx.hideLoading() }
  },

  preventClose(){}
})


