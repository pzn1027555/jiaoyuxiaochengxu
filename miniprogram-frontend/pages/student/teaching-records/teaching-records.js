const api = require('../../../utils/api')

Page({
  data:{ selectedDate:'', selectedYear:'', selectedMonth:'', selectedDay:'', headerHeight:0, loading:false, courseList:[], showReviewModal:false, rvView:false, rvCourseId:null, rvContent:'', rvStar:5 },
  onLoad(){ const today=new Date(); const ds=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`; this.setData({ selectedDate:ds, selectedYear:String(today.getFullYear()), selectedMonth:String(today.getMonth()+1), selectedDay:String(today.getDate()) }); this.loadList() },
  onHeaderReady(e){ const { totalHeight } = e.detail || {}; this.setData({ headerHeight: totalHeight||0 }) },
  onDateChange(e){ const val=String(e.detail.value||''); let { selectedYear:y, selectedMonth:m, selectedDay:d } = this.data; if(/^\d{4}$/.test(val)){ y=val } else if(/^\d{4}-\d{2}$/.test(val)){ const [yy,mm]=val.split('-'); y=yy; m=String(parseInt(mm,10)) } else if(/^\d{4}-\d{2}-\d{2}$/.test(val)){ const [yy,mm,dd]=val.split('-'); y=yy; m=String(parseInt(mm,10)); d=String(parseInt(dd,10)) } const pad2=n=>String(n).padStart(2,'0'); const ds=`${y}-${pad2(m)}-${pad2(d)}`; this.setData({ selectedYear:y, selectedMonth:m, selectedDay:d, selectedDate:ds }); this.loadList() },
  async loadList(){ this.setData({ loading:true }); try{ const res = await api.studentSchedule.getDay({ date: this.data.selectedDate }); const arr = res && res.success && res.data && Array.isArray(res.data.items) ? res.data.items : []; const list = arr.map(it=>({ id: it.id, startTime: (it.startTime||'').replace('T',' ').slice(11,16), endTime:(it.endTime||'').replace('T',' ').slice(11,16), courseTitle: it.title, lessonNumber: it.lessonNumber||1, totalLessons: it.totalLessons||1, classType: it.classType, coverFullUrl: this.toAbs(it.coverUrl) })); const rvRes = await Promise.all(list.map(it=> api.studentSchedule.getReview(it.id).catch(()=>null))); rvRes.forEach((r,i)=>{ const has = r && (r.success || r.code===200) && r.data && r.data.hasReview; list[i].hasReview = !!has; list[i].reviewContent = has ? r.data.content : ''; list[i].reviewStar = has ? (r.data.starRating||5) : 0; }); this.setData({ courseList: list }) } finally { this.setData({ loading:false }) } },
  toAbs(url){ const { toAbsolute } = require('../../../utils/urlUtils'); return toAbsolute(url, 'static') },
  writeReview(e){ const id=e.currentTarget.dataset.id; this.setData({ showReviewModal:true, rvView:false, rvCourseId:id, rvContent:'', rvStar:5 }) },
  viewReview(e){ const id=e.currentTarget.dataset.id; const it=(this.data.courseList||[]).find(x=>x.id===id); this.setData({ showReviewModal:true, rvView:true, rvCourseId:id, rvContent:(it&&it.reviewContent)||'', rvStar:(it&&it.reviewStar)||5 }) },
  onRvInput(e){ this.setData({ rvContent:e.detail.value }) },
  onRvStarChange(e){ this.setData({ rvStar: Number(e.currentTarget.dataset.star)||5 }) },
  closeRv(){ this.setData({ showReviewModal:false, rvContent:'', rvCourseId:null, rvView:false, rvStar:5 }) },
  async submitRv(){ const id=this.data.rvCourseId; const txt=(this.data.rvContent||'').trim(); const star=this.data.rvStar||0; if(!star){ wx.showToast({ title:'请先选择星级', icon:'none' }); return } try{ await api.studentSchedule.submitReview(id, { content: txt, starRating: star }); wx.showToast({ title:'已提交', icon:'success' }); const list=(this.data.courseList||[]).map(it=> it.id===id ? { ...it, hasReview:true, reviewContent:txt, reviewStar:star } : it); this.setData({ courseList:list }); this.closeRv() }catch(e){ wx.showToast({ title:'提交失败', icon:'none' }) } }
})


