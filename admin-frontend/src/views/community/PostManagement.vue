<template>
  <div class="page-container">
    <div class="content-box">
      <h2>帖子管理</h2>
      
      
      
      <!-- 搜索筛选 -->
      <el-form :model="queryForm" :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="搜索标题和内容" clearable style="width: 200px"></el-input>
        </el-form-item>
        
        <el-form-item label="发布者">
          <el-input v-model="queryForm.authorName" placeholder="请输入发布者姓名" clearable style="width: 150px"></el-input>
        </el-form-item>
        
        <el-form-item label="帖子状态">
          <el-select v-model="queryForm.postStatus" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="草稿" :value="0"></el-option>
            <el-option label="已发布" :value="2"></el-option>
            <el-option label="已下架" :value="3"></el-option>
            <el-option label="已删除" :value="4"></el-option>
          </el-select>
        </el-form-item>
        
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 批量操作 -->
      <div class="toolbar">
        <div class="toolbar-left">
          
          <el-button 
            type="success" 
            @click="batchPublish" 
            :disabled="selectedPosts.length === 0"
            icon="el-icon-upload">
            批量发布
          </el-button>
          <el-button 
            type="danger" 
            @click="batchTakeDown" 
            :disabled="selectedPosts.length === 0"
            icon="el-icon-download">
            批量下架
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-button type="text" @click="handleRefresh" icon="el-icon-refresh">刷新</el-button>
        </div>
      </div>
      
      <!-- 帖子列表 -->
      <el-table 
        :data="postList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border>
        <el-table-column type="selection" width="55"></el-table-column>
        
        <el-table-column prop="title" label="标题" width="200">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewPostDetail(scope.row)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="authorName" label="发布者" width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.authorName }}</div>
            <el-tag size="mini" :type="getAuthorTypeColor(scope.row.authorType)">
              {{ getAuthorTypeText(scope.row.authorType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryName" label="分类" width="100"></el-table-column>
        
        <el-table-column label="内容预览" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ getContentSummary(scope.row.content) }}
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <div>
              <el-tag :type="getPostStatusType(scope.row.postStatus)">
                {{ getPostStatusText(scope.row.postStatus) }}
              </el-tag>
            </div>
            
          </template>
        </el-table-column>
        
        <el-table-column label="统计数据" width="120">
          <template slot-scope="scope">
            <div>浏览: {{ scope.row.viewCount || 0 }}</div>
            <div>点赞: {{ scope.row.likeCount || 0 }}</div>
            <div>评论: {{ scope.row.commentCount || 0 }}</div>
          </template>
        </el-table-column>
        
        
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            
            
            <el-button 
              v-if="scope.row.postStatus === 2" 
              type="danger" 
              size="mini" 
              @click="takeDownPost(scope.row)">
              下架
            </el-button>
            
            <el-dropdown @command="handleCommand" trigger="click">
              <el-button type="text" size="mini">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{action: 'view', row: scope.row}">查看详情</el-dropdown-item>
                
                
                <el-dropdown-item :command="{action: 'delete', row: scope.row}" style="color: #F56C6C;">删除帖子</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryForm.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    
    <!-- 帖子详情弹窗 -->
    <el-dialog title="帖子详情" :visible.sync="detailDialogVisible" width="800px">
      <div v-if="postDetail">
        <h3>{{ postDetail.title }}</h3>
        <p><strong>发布者:</strong> {{ postDetail.authorName }} ({{ getAuthorTypeText(postDetail.authorType) }})</p>
        <p><strong>分类:</strong> {{ postDetail.categoryName }}</p>
        <p><strong>状态:</strong> {{ getPostStatusText(postDetail.postStatus) }}</p>
        <p v-if="postDetail.postStatus === 3 && postDetail.takeDownReason"><strong>下架原因:</strong> {{ postDetail.takeDownReason }}</p>
        <p><strong>创建时间:</strong> {{ formatDateTime(postDetail.createTime) }}</p>
        <div style="margin-top: 20px;">
          <strong>内容:</strong>
          <div v-html="postDetail.content" style="margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></div>
        </div>
      </div>
    </el-dialog>
    
    
  </div>
</template>

<script>
import { 
  getPostList, 
  getPostDetail, 
  publishPost,
  takeDownPost,
  deletePost
} from '@/api/community'

export default {
  name: 'PostManagement',
  data() {
    return {
      loading: false,
      postList: [],
      total: 0,
      selectedPosts: [],
      
      queryForm: {
        keyword: '',
        authorName: '',
        postStatus: null,
        auditStatus: null,
        pageNum: 1,
        pageSize: 20
      },
      
      detailDialogVisible: false,
      postDetail: null,
      
      
    }
  },
  
  created() {
    this.loadPostList()
  },
  
  methods: {
    async loadPostList() {
      this.loading = true
      try {
        const response = await getPostList(this.queryForm)
        if (response.code === 200) {
          this.postList = response.data.list
          this.total = response.data.total
        }
      } catch (error) {
        this.$message.error('加载帖子列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleSearch() {
      this.queryForm.pageNum = 1
      this.loadPostList()
    },
    
    handleReset() {
      this.queryForm = {
        keyword: '',
        authorName: '',
        postStatus: null,
        auditStatus: null,
        pageNum: 1,
        pageSize: 20
      }
      this.loadPostList()
    },
    
    handleRefresh() {
      this.loadPostList()
    },
    
    handleSizeChange(val) {
      this.queryForm.pageSize = val
      this.queryForm.pageNum = 1
      this.loadPostList()
    },
    
    handleCurrentChange(val) {
      this.queryForm.pageNum = val
      this.loadPostList()
    },
    
    handleSelectionChange(selection) {
      this.selectedPosts = selection
    },
    
    async viewPostDetail(row) {
      try {
        const response = await getPostDetail(row.id)
        if (response.code === 200) {
          this.postDetail = response.data
          this.detailDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取帖子详情失败')
      }
    },
    
    
    async batchPublish() {
      // TODO: 实现批量发布
      this.$message.info('批量发布功能开发中')
    },
    
    async batchTakeDown() {
      // TODO: 实现批量下架
      this.$message.info('批量下架功能开发中')
    },
    
    async takeDownPost(row) {
      try {
        const { value } = await this.$prompt('请输入下架原因', '下架帖子', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: value => value && value.trim().length > 0,
          inputErrorMessage: '请输入下架原因'
        })
        
        const response = await takeDownPost(row.id, value)
        if (response.code === 200) {
          this.$message.success('下架成功')
          this.loadPostList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('下架失败')
        }
      }
    },
    
    handleCommand(command) {
      const { action, row } = command
      
      switch (action) {
        case 'view':
          this.viewPostDetail(row)
          break
        
        case 'delete':
          this.deletePost(row)
          break
      }
    },
    
    
    // 辅助方法
    formatDateTime(dateTime) {
      return dateTime ? new Date(dateTime).toLocaleString() : '-'
    },
    
    getContentSummary(content) {
      if (!content) return ''
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    },
    
    getPostStatusText(status) {
      const texts = { 0: '草稿', 1: '待审核', 2: '已发布', 3: '已下架', 4: '已删除' }
      return texts[status] || '未知状态'
    },
    
    getPostStatusType(status) {
      const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
      return types[status] || ''
    },
    
    
    getAuthorTypeText(type) {
      const texts = { 'student': '学生', 'teacher': '教师', 'parent': '家长', 'admin': '管理员' }
      return texts[type] || '学生'
    },
    
    getAuthorTypeColor(type) {
      const colors = { 'student': '', 'teacher': 'success', 'parent': 'warning', 'admin': 'warning' }
      return colors[type] || ''
    },
    
    
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    
    i {
      font-size: 24px;
      color: white;
    }
  }
  
  .stat-content {
    flex: 1;
    
    .stat-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .toolbar-left {
    display: flex;
    gap: 8px;
  }
}
</style>