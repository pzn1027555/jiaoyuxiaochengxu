const api = require('../../../utils/request');

Page({
  data: {
    currentTab: 0, // 0: 收藏老师, 1: 点赞帖子
    tabs: ['收藏老师', '点赞帖子'],
    
    // 收藏老师数据
    teachers: [],
    teachersLoading: false,
    teachersPageNum: 1,
    teachersPageSize: 10,
    teachersTotal: 0,
    teachersNoMore: false,
    
    // 点赞帖子数据
    posts: [],
    postsLoading: false,
    postsPageNum: 1,
    postsPageSize: 10,
    postsTotal: 0,
    postsNoMore: false,

    subjectNameMap: {}
  },

  async onLoad() {
    await this.loadSubjectMap()
    this.loadFavoriteTeachers()
  },
  onShow(){
    // 进入页面时刷新点赞帖子，确保社区点赞后能看到
    if(this.data.currentTab===1){ this.refreshPosts(); } else { this.refreshTeachers(); }
  },

  onPullDownRefresh() {
    if (this.data.currentTab === 0) {
      this.refreshTeachers();
    } else {
      this.refreshPosts();
    }
  },

  onReachBottom() {
    if (this.data.currentTab === 0) {
      this.loadMoreTeachers();
    } else {
      this.loadMorePosts();
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    
    this.setData({ currentTab: tab });
    
    if (tab === 0) {
      if (this.data.teachers.length === 0) {
        this.loadFavoriteTeachers();
      }
    } else {
      if (this.data.posts.length === 0) {
        this.loadLikedPosts();
      }
    }
  },

  // 加载收藏的教师
  async loadFavoriteTeachers() {
    if (this.data.teachersLoading) return;
    
    // 调试：检查用户信息和手机号
    this.setData({ teachersLoading: true });
    
    try {
      const res = await api.get('/mini/student/favorites/teachers', {
        pageNum: this.data.teachersPageNum,
        pageSize: this.data.teachersPageSize
      });
      
      if (res.success && res.data) {
        const { list, total } = res.data;
        
        // 处理科目显示
        list.forEach(teacher => {
          if (teacher.subjectsMap && typeof teacher.subjectsMap === 'object') {
            teacher.subjectsText = Object.values(teacher.subjectsMap).join('、')
          } else if (teacher.subjectsText) {
            // 已有文本
          } else if (teacher.subjects) {
            try {
              const subjects = typeof teacher.subjects === 'string' 
                ? JSON.parse(teacher.subjects) 
                : teacher.subjects
              const idName = this.data.subjectNameMap || {}
              teacher.subjectsText = Array.isArray(subjects)
                ? subjects.map(s => idName[String(s)] || idName[s] || s).join('、')
                : subjects
            } catch (e) {
              teacher.subjectsText = teacher.subjects
            }
          } else {
            teacher.subjectsText = ''
          }
        });
        
        this.setData({
          teachers: this.data.teachersPageNum === 1 ? list : this.data.teachers.concat(list),
          teachersTotal: total,
          teachersNoMore: this.data.teachers.length + list.length >= total
        });
      }
    } catch (error) {
      console.error('加载收藏教师失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ teachersLoading: false });
      wx.stopPullDownRefresh();
    }
  },

  async loadSubjectMap() {
    try {
      const subjectApi = require('../../../api/subject')
      const res = await subjectApi.getSubjectCategories()
      if (res && res.success && res.data && Array.isArray(res.data.categories)) {
        const map = {}
        res.data.categories.forEach(level1 => {
          (level1.children || []).forEach(level2 => {
            if (level2 && level2.id != null) {
              map[String(level2.id)] = level2.categoryName || level2.name || ''
            }
          })
        })
        this.setData({ subjectNameMap: map })
      }
    } catch (e) {
      this.setData({ subjectNameMap: {} })
    }
  },

  // 加载点赞的帖子
  async loadLikedPosts() {
    if (this.data.postsLoading) return;
    
    this.setData({ postsLoading: true });
    
    try {
      const res = await api.get('/mini/student/favorites/posts', {
        pageNum: this.data.postsPageNum,
        pageSize: this.data.postsPageSize
      });
      
      if (res.success && res.data) {
        const { list, total } = res.data;
        
        // 处理帖子内容
        list.forEach(post => {
          // 处理时间显示
          if (post.createTime) {
            post.relativeTime = this.getRelativeTime(post.createTime);
          }
          
          // 处理图片
          if (post.images && post.images !== 'null') {
            try {
              const images = typeof post.images === 'string' 
                ? JSON.parse(post.images) 
                : post.images;
              post.media = Array.isArray(images) 
                ? images.map(url => ({ type: 'image', url }))
                : [];
            } catch (e) {
              post.media = [];
            }
          } else {
            post.media = [];
          }
        });
        
        // 绝对化图片URL
        try{
          const { toAbsolute } = require('../../../utils/urlUtils')
          list.forEach(post=>{
            if(Array.isArray(post.media)){
              post.media = post.media.map(m=> m && m.url ? { ...m, url: toAbsolute(m.url, 'static') } : m)
            }
          })
        }catch(_){ }
        const merged = this.data.postsPageNum === 1 ? list : this.data.posts.concat(list)
        this.setData({
          posts: merged,
          postsTotal: total,
          postsNoMore: merged.length >= total
        });
      }
    } catch (error) {
      console.error('加载点赞帖子失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ postsLoading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 刷新收藏教师
  async refreshTeachers() {
    this.setData({
      teachersPageNum: 1,
      teachers: [],
      teachersNoMore: false
    });
    await this.loadFavoriteTeachers();
  },

  // 刷新点赞帖子
  async refreshPosts() {
    this.setData({
      postsPageNum: 1,
      posts: [],
      postsNoMore: false
    });
    await this.loadLikedPosts();
  },

  // 加载更多教师
  async loadMoreTeachers() {
    if (this.data.teachersLoading || this.data.teachersNoMore) return;
    
    this.setData({
      teachersPageNum: this.data.teachersPageNum + 1
    });
    await this.loadFavoriteTeachers();
  },

  // 加载更多帖子
  async loadMorePosts() {
    if (this.data.postsLoading || this.data.postsNoMore) return;
    
    this.setData({
      postsPageNum: this.data.postsPageNum + 1
    });
    await this.loadLikedPosts();
  },

  // 点击教师卡片
  onTeacherTap(e) {
    const teacherId = e.currentTarget.dataset.id;
    if (!teacherId) {
      return;
    }
    wx.navigateTo({
      url: `/pages/teacher/homepage/homepage?teacherId=${teacherId}`
    });
  },

  // 点击帖子卡片
  onPostTap(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/detail/detail?id=${postId}`
    });
  },

  // 获取相对时间
  getRelativeTime(timeStr) {
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now - time;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < week) {
      return Math.floor(diff / day) + '天前';
    } else if (diff < month) {
      return Math.floor(diff / week) + '周前';
    } else {
      return time.toLocaleDateString();
    }
  },

  // 跳转到教师列表
  goToTeacherList() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 跳转到社区
  goToCommunity() {
    wx.switchTab({
      url: '/pages/community/community'
    });
  }
})

