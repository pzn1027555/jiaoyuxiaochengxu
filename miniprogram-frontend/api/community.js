const request = require('../utils/request')

// 社区相关 API 封装
const communityApi = {
  // 获取分类列表
  getCategories() {
    return request.get('/community/categories')
  },

  // 分页获取帖子列表
  getPosts(params = {}) {
    // 后端为 POST /community/posts/list，接受分页与筛选参数
    return request.post('/community/posts/list', params)
  },

  // 获取帖子详情
  getPostDetail(id, params = {}) {
    return request.get(`/community/posts/${id}`, params)
  },

  // 获取社区统计
  getStatistics() {
    return request.get('/community/statistics')
  },

  // 点赞（后端接收 JSON: { postId, userId }）
  likePost(data) {
    return request.post(`/community/posts/${data.postId}/like`, { postId: data.postId, userId: data.userId, userType: data.userType || 'student' })
  },

  // 评论
  getComments(postId, params={}) {
    return request.get(`/community/posts/${postId}/comments`, params)
  },
  addComment(postId, data) {
    return request.post(`/community/posts/${postId}/comments`, data)
  },
  deleteComment(id, postId) {
    return request.delete(`/community/comments/${id}`, { postId })
  },

  // 评论点赞
  likeComment(commentId, data) {
    return request.post(`/community/comments/${commentId}/like`, { userId: data.userId, userType: data.userType || 'student' })
  },

  // 发帖
  createPost(data) {
    return request.post('/community/posts', data)
  },

  // 顶部资源下载
  getTopResources(limit=2){
    return request.get('/community/resources/top', { limit })
  },

  // 关注老师的资源
  getFollowingResources(params){
    return request.get('/community/resources/following', params)
  },

  // 按科目+二级分类筛选帖子
  filterPosts(params){
    return request.get('/community/posts/filter', params)
  },

  // 资源列表（支持关键字）
  getResources(params){
    return request.get('/community/resources', params)
  },

  // 记录资源下载
  addResourceDownload(id){
    return request.post(`/community/resources/${id}/download`)
  }
}

module.exports = communityApi


