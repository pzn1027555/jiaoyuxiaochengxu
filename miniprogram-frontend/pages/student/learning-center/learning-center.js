// pages/student/learning-center/learning-center.js (内容搬运自课程页)
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')

Page({
  data: { weekDays: [], todayClasses: [], currentDate: '', loading: false, showMonthPicker:false, year:0, month:0, monthDays:[] },
  onLoad(){ this.initPage() },
  onShow(){ this.checkAuth(); this.loadData(); if (typeof this.getTabBar === 'function' && this.getTabBar()) { this.getTabBar().setSelected(2) } },
  onPullDownRefresh(){ this.loadData().finally(()=> wx.stopPullDownRefresh()) },
  checkAuth(){ const app = getApp(); if (app.globalData.isLogin && app.globalData.userRole === 'student') return true; const userInfo = auth.getUserInfo(); if (userInfo && userInfo.role === 'student') return true; wx.showToast({ title:'请先登录学生账号', icon:'none' }); setTimeout(()=> wx.reLaunch({ url:'/pages/login/login' }), 1500); return false },
  initPage(){ if (!this.checkAuth()) return; this.buildWeek(this.formatDate(new Date())); this.loadData() },

  async buildWeek(baseDateStr){ const base = new Date(baseDateStr.replace(/-/g,'/')); const dayNames = ['周日','周一','周二','周三','周四','周五','周六']; const monday = new Date(base); const w = monday.getDay() === 0 ? 7 : monday.getDay(); monday.setDate(monday.getDate() - (w-1)); const arr=[]; for(let i=0;i<7;i++){ const d=new Date(monday); d.setDate(monday.getDate()+i); const full = this.formatDate(d); arr.push({ date: full, day: `${d.getMonth()+1}.${d.getDate()}`, dayName: dayNames[d.getDay()], isSelected: full===baseDateStr, hasClass:false }) } this.setData({ weekDays: arr, currentDate: baseDateStr }); await Promise.all(arr.map(async (it, idx)=>{ try{ const res = await api.studentSchedule.getDay({ date: it.date }); const items = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []; const key = `weekDays[${idx}].hasClass`; this.setData({ [key]: items.length>0 }) }catch(e){} })) },
  formatDate(date){ return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` },
  async loadData(){ this.setData({ loading:true }); try{ await this.loadTodayClasses() } finally { this.setData({ loading:false }) } },

  async loadTodayClasses(){ const res = await api.studentSchedule.getDay({ date: this.data.currentDate || this.formatDate(new Date()) }); const arr = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []; const list = arr.map(it=>{ const start = (it.startTime||'').replace('T',' ').slice(11,16); const end = (it.endTime||'').replace('T',' ').slice(11,16); const status = this.computeStatus(it.startTime, it.endTime); return { id: it.id, startTime: start, endTime: end, status: status.status, countdown: status.countdown, courseTitle: it.title, lessonNumber: it.lessonNumber || 1, totalLessons: it.totalLessons || 1, isLive: it.classType !== 'one_to_one'&&it.classType !== 'trial', classType: it.classType, coverUrl: it.coverUrl, coverFullUrl: !it.coverUrl ? '/images/sijiaokecheng.jpeg' : this.toAbsolute(it.coverUrl), teacherName: it.teacherName } }); const rvRes = await Promise.all(list.map(it=> api.studentSchedule.getReview(it.id).catch(()=>null))); rvRes.forEach((r,i)=>{ const has = r && (r.success || r.code===200) && r.data && r.data.hasReview; list[i].hasReview = !!has; list[i].reviewContent = has ? r.data.content : ''; list[i].reviewStar = has ? (r.data.starRating||5) : 0; const now = Date.now(); const endIso = arr[i] && arr[i].endTime; let canWrite = false; try{ const [d,t] = String(endIso||'').split('T'); if(t){ const [h,m]=t.split(':'); const e=new Date(d.replace(/-/g,'/')+' '+h+':'+m+':00'); canWrite = now>e.getTime() } }catch(err){ canWrite=false } list[i].canWriteReview = canWrite && !list[i].hasReview }); this.setData({ todayClasses: list }) },
  computeStatus(startIso, endIso){ try{ const now = new Date(); const [ds,ts] = String(startIso||'').split('T'); if(!ts) return { status:'pending', countdown:'' }; const [hs,ms] = ts.split(':'); const sDate = new Date(ds.replace(/-/g,'/') + ' ' + hs+':'+ms+':00'); let eDate = sDate; if (endIso){ const [de,te] = String(endIso||'').split('T'); if(te){ const [he,me]=te.split(':'); eDate = new Date(de.replace(/-/g,'/') + ' ' + he+':'+me+':00') } } const diffToStart = sDate.getTime() - now.getTime(); if (diffToStart > 0 && diffToStart <= 30*60*1000){ return { status:'pending', countdown: `${Math.ceil(diffToStart/60000)}分钟后开课` } } if (now.getTime() > eDate.getTime()){ return { status:'completed', countdown:'' } } return { status: now.getTime() >= sDate.getTime() ? 'in_progress' : 'pending', countdown:'' } }catch(e){ return { status:'pending', countdown:'' } } },
  toAbsolute(url){ try{ if(!url) return ''; if(typeof url==='string' && (/^https?:\/\//i.test(url))) return url; const app=getApp(); const env=require('../../config/env'); const base=(app&&app.globalData&&app.globalData.apiBaseUrl)?app.globalData.apiBaseUrl:env.getStaticBaseUrl(); if(!base) return url; return `${base}${url.startsWith('/')?'' : '/'}${url}` }catch(e){ return url } },
  onDateTap(e){ const date = e.currentTarget.dataset.date; const weekDays = this.data.weekDays.map(item=> ({...item, isSelected: item.date===date})); this.setData({ weekDays, currentDate: date }); this.loadTodayClasses() },
  openCalendar(){ const today=new Date(); this.setData({ year:today.getFullYear(), month:today.getMonth()+1, showMonthPicker:true }, ()=> this.buildMonthDays()) },
  closeCalendar(){ this.setData({ showMonthPicker:false }) },
  buildMonthDays(){ const { year, month } = this.data; const daysInMonth = new Date(year, month, 0).getDate(); const arr=[]; for(let i=1;i<=daysInMonth;i++){ arr.push({ date:i, hasCourse:false, selected:false }) } const promises = arr.map(async (d,idx)=>{ const ds = `${year}-${('0'+month).slice(-2)}-${('0'+d.date).slice(-2)}`; try{ const res = await api.studentSchedule.getDay({ date: ds }); const items = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []; const k = `monthDays[${idx}].hasCourse`; this.setData({ [k]: items.length>0 }) }catch(e){} }); this.setData({ monthDays: arr }); Promise.all(promises).then(()=>{}) },
  prevMonth(){ let {year,month}=this.data; month--; if(month===0){month=12; year--} this.setData({year,month}, ()=> this.buildMonthDays()) },
  nextMonth(){ let {year,month}=this.data; month++; if(month===13){month=1; year++} this.setData({year,month}, ()=> this.buildMonthDays()) },
  onPickMonthDay(e){ const d=e.currentTarget.dataset.d; const ds=`${this.data.year}-${('0'+this.data.month).slice(-2)}-${('0'+d).slice(-2)}`; this.setData({ showMonthPicker:false }, ()=>{ this.buildWeek(ds); this.loadTodayClasses() }) },
  viewReview(e){ const id=e.currentTarget.dataset.id; const item=(this.data.todayClasses||[]).find(x=>x.id===id); this.setData({ showReviewModal:true, rvView:true, rvCourseId:id, rvContent:(item&&item.reviewContent)||'', rvStar:(item&&item.reviewStar)||5 }) },
  writeReview(e){ const id=e.currentTarget.dataset.id; this.setData({ showReviewModal:true, rvView:false, rvCourseId:id, rvContent:'', rvStar:5 }) },
  onRvInput(e){ this.setData({ rvContent:e.detail.value }) },
  onRvStarChange(e){ this.setData({ rvStar: Number(e.currentTarget.dataset.star)||5 }) },
  closeRv(){ this.setData({ showReviewModal:false, rvContent:'', rvCourseId:null, rvView:false, rvStar:5 }) },
  async submitRv(){
    if (this.data.rvView){ this.closeRv(); return }
    const id=this.data.rvCourseId; const txt=(this.data.rvContent||'').trim(); const star=this.data.rvStar||0;
    if (!star){ wx.showToast({ title:'请先选择星级', icon:'none' }); return }
    try{
      await api.studentSchedule.submitReview(id, { content: txt, starRating: star });
      wx.showToast({ title:'已提交', icon:'success' });
      const arr=(this.data.todayClasses||[]).map(it=> it.id===id ? { ...it, hasReview:true, reviewContent:txt, reviewStar:star } : it);
      this.setData({ todayClasses: arr });
      this.closeRv()
    }catch(e){ wx.showToast({ title:'提交失败', icon:'none' }) }
  },
  onShareAppMessage(){ return { title:'我的学习中心', path:'/pages/student/learning-center/learning-center' } }
  ,viewAllRecords(){ wx.navigateTo({ url:'/pages/student/teaching-records/teaching-records' }) }
})