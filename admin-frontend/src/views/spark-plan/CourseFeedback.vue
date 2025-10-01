<template>
  <div class="page-container">
    <div class="content-box">
      <h2>课程反馈</h2>
      
      

      <!-- 搜索筛选区域 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="学生姓名">
            <el-input 
              v-model="searchForm.studentName" 
              placeholder="请输入学生姓名"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="教师姓名">
            <el-input 
              v-model="searchForm.teacherName" 
              placeholder="请输入教师姓名"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="评分">
            <el-select v-model="searchForm.starRating" placeholder="请选择评分" clearable>
              <el-option label="5星" :value="5"></el-option>
              <el-option label="4星" :value="4"></el-option>
              <el-option label="3星" :value="3"></el-option>
              <el-option label="2星" :value="2"></el-option>
              <el-option label="1星" :value="1"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable>
              <el-option label="待审核" :value="0"></el-option>
              <el-option label="审核通过" :value="1"></el-option>
              <el-option label="审核拒绝" :value="2"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      

      <!-- 角色类型页签 -->
      <el-tabs v-model="activeRole" @tab-click="onRoleChanged" style="margin-bottom: 12px;">
        <el-tab-pane label="教师反馈" name="teacher"></el-tab-pane>
        <el-tab-pane label="学生评价" name="student"></el-tab-pane>
      </el-tabs>

      <!-- 反馈列表表格 -->
      <div class="table-container">
        <el-table
          ref="feedbackTable"
          :data="feedbackList"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          
          <el-table-column label="学生信息" width="160" fixed="left">
            <template slot-scope="scope">
              <div class="user-info">
                <el-avatar :size="40">
                  {{ scope.row.studentName ? scope.row.studentName.charAt(0) : '' }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ scope.row.studentName }}</div>
                  <div class="user-no">{{ scope.row.studentNo }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="教师信息" width="160">
            <template slot-scope="scope">
              <div class="user-info">
                <el-avatar :size="40">
                  {{ scope.row.teacherName ? scope.row.teacherName.charAt(0) : '' }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ scope.row.teacherName }}</div>
                  <div class="user-level">{{ getTeacherLevelText(scope.row.teacherLevel) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="courseName" label="课程名称" width="200" show-overflow-tooltip></el-table-column>
          
          <el-table-column v-if="activeRole==='student'" label="评分" width="120" align="center">
            <template slot-scope="scope">
              <el-rate 
                :value="scope.row.starRating || 0" 
                disabled 
                show-score 
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="反馈内容" width="300" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="review-content">
                <p>{{ scope.row.reviewContent || '暂无文字评价' }}</p>
                <div v-if="scope.row.reviewTags && scope.row.reviewTags.length" class="review-tags">
                  <el-tag 
                    v-for="tag in scope.row.reviewTags" 
                    :key="tag" 
                    size="mini"
                    style="margin: 2px"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="反馈时间" width="150" align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleViewDetail(scope.row)">查看</el-button>
              <el-button 
                v-if="scope.row.auditStatus === 0"
                size="mini" 
                type="success" 
                @click="handleQuickAudit(scope.row, 1)"
              >
                通过
              </el-button>
              <el-button 
                v-if="scope.row.auditStatus === 0"
                size="mini" 
                type="danger" 
                @click="handleQuickAudit(scope.row, 2)"
              >
                拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <span class="pagination-info">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
          </span>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 反馈详情对话框 -->
    <el-dialog title="课程反馈详情" :visible.sync="detailDialogVisible" width="600px">
      <div v-if="currentFeedback" class="feedback-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentFeedback.studentName }}</el-descriptions-item>
          <el-descriptions-item label="教师姓名">{{ currentFeedback.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ currentFeedback.courseName }}</el-descriptions-item>
          <el-descriptions-item label="评分">
            <el-rate 
              :value="currentFeedback.starRating || 0" 
              disabled 
              show-score 
              text-color="#ff9900"
            />
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="feedback-content">
          <h4>反馈内容</h4>
          <p>{{ currentFeedback.reviewContent || '暂无文字评价' }}</p>
          
          <div v-if="currentFeedback.reviewTags && currentFeedback.reviewTags.length">
            <h4>评价标签</h4>
            <el-tag 
              v-for="tag in currentFeedback.reviewTags" 
              :key="tag" 
              style="margin: 4px"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="currentFeedback && currentFeedback.auditStatus === 0" 
          type="success" 
          @click="handleQuickAudit(currentFeedback, 1)"
        >
          通过审核
        </el-button>
        <el-button 
          v-if="currentFeedback && currentFeedback.auditStatus === 0" 
          type="danger" 
          @click="handleQuickAudit(currentFeedback, 2)"
        >
          拒绝审核
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'CourseFeedback',
  data() {
    return {
      loading: false,
      activeRole: 'teacher',
      filterType: 'all',
      searchForm: {
        studentName: '',
        teacherName: '',
        starRating: null,
        auditStatus: null
      },
      feedbackList: [],
      selectedFeedbacks: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 统计数据
      totalReviews: 156,
      pendingReviews: 23,
      excellentReviews: 108,
      averageRating: 4.3,
      
      // 对话框
      detailDialogVisible: false,
      currentFeedback: null
    }
  },
  
  computed: {
    hasSelection() {
      return this.selectedFeedbacks.length > 0
    }
  },
  
  mounted() {
    this.fetchList()
  },
  
  methods: {
    async fetchList(){
      this.loading = true
      try{
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          roleType: this.activeRole,
          studentName: this.searchForm.studentName || undefined,
          teacherName: this.searchForm.teacherName || undefined,
          starRating: this.searchForm.starRating || undefined
        }
        // 改为新的后台聚合接口（联表）
        const res = await request({ url: '/spark/feedback/list', method: 'get', params })
        const page = res.data || res
        this.feedbackList = page.list || []
        this.total = page.total || 0
      }catch(e){ this.$message.error('加载失败') }
      finally{ this.loading = false }
    },

    onRoleChanged(){
      this.currentPage = 1
      this.fetchList()
    },
    
    // 生成模拟反馈数据
    generateMockFeedbacks() {
      const mockData = []
      const studentNames = ['陈舍', '孙小通', 'Bella', 'Duoduo', 'Camellia']
      const teacherNames = ['张明教授', '李华老师', '王老师', '刘英语']
      const courseNames = ['IGCSE数学基础', 'A-Level物理', 'IGCSE化学', '雅思口语']
      const reviewContents = [
        '老师讲课非常清楚，耐心回答问题，孩子的成绩提升很快！',
        '课程很有趣，实验讲解很详细，孩子受益匪浅。',
        '老师很专业，但有时候讲得有点快。',
        '课程安排很合理，知识点讲解到位。'
      ]
      
      for (let i = 0; i < 20; i++) {
        mockData.push({
          id: i + 1,
          studentName: studentNames[Math.floor(Math.random() * studentNames.length)],
          studentNo: 'S' + (1000 + i),
          teacherName: teacherNames[Math.floor(Math.random() * teacherNames.length)],
          teacherLevel: ['expert', 'senior', 'intermediate'][Math.floor(Math.random() * 3)],
          courseName: courseNames[Math.floor(Math.random() * courseNames.length)],
          starRating: Math.floor(Math.random() * 5) + 1,
          reviewContent: reviewContents[Math.floor(Math.random() * reviewContents.length)],
          reviewTags: ['讲课清楚', '耐心', '成绩提升'],
          auditStatus: Math.floor(Math.random() * 3),
          createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        })
      }
      
      return mockData
    },
    
    handleSearch() { this.currentPage = 1; this.fetchList() },
    
    resetSearch() {
      this.searchForm = {
        studentName: '',
        teacherName: '',
        starRating: null,
        auditStatus: null
      }
      this.handleSearch()
    },
    
    switchFilter(type) {
      this.filterType = type
      this.currentPage = 1
      this.handleSearch()
    },
    
    handleSelectionChange(selection) {
      this.selectedFeedbacks = selection
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.handleSearch()
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.handleSearch()
    },
    
    // 批量审核
    async handleBatchAudit(auditStatus) {
      const ids = (this.selectedFeedbacks||[]).map(i=>i.id)
      if (!ids.length) return
      try{
        await request({ url: '/student/review/batch-audit', method: 'post', data: { ids, status: auditStatus } })
        const statusText = auditStatus === 1 ? '通过' : '拒绝'
        this.$message.success(`批量审核${statusText}成功`)
        this.fetchStatistics(); this.fetchList()
      }catch(e){ this.$message.error('操作失败') }
    },
    
    // 查看详情
    handleViewDetail(row) {
      this.currentFeedback = row
      this.detailDialogVisible = true
    },
    
    // 快速审核
    async handleQuickAudit(row, auditStatus) {
      try{
        await request({ url: `/student/review/${row.id}/audit`, method: 'put', params: { status: auditStatus } })
        const statusText = auditStatus === 1 ? '通过' : '拒绝'
        this.$message.success(`审核${statusText}成功`)
        if (this.detailDialogVisible) this.detailDialogVisible = false
        this.fetchStatistics(); this.fetchList()
      }catch(e){ this.$message.error('操作失败') }
    },
    
    // 工具方法
    getTeacherLevelText(level) {
      const textMap = {
        'junior': '初级',
        'intermediate': '中级',
        'senior': '高级',
        'expert': '专家'
      }
      return textMap[level] || '初级'
    },
    
    getAuditStatusTagType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return typeMap[status] || ''
    },
    
    getAuditStatusText(status) {
      const textMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return textMap[status] || '未知'
    },
    
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-cards {
  margin-bottom: 24px;
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
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
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #606266;
      }
    }
    
    &.total {
      .stat-icon { background: #409eff; }
      .stat-value { color: #409eff; }
    }
    
    &.pending {
      .stat-icon { background: #e6a23c; }
      .stat-value { color: #e6a23c; }
    }
    
    &.excellent {
      .stat-icon { background: #67c23a; }
      .stat-value { color: #67c23a; }
    }
    
    &.average-rating {
      .stat-icon { background: #f56c6c; }
      .stat-value { color: #f56c6c; }
    }
  }
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-container {
  .user-info {
    display: flex;
    align-items: center;
    
    .user-details {
      margin-left: 12px;
      
      .user-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .user-no, .user-level {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.feedback-detail {
  .feedback-content {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 10px;
      color: #303133;
    }
    
    p {
      margin-bottom: 16px;
      line-height: 1.6;
      color: #606266;
    }
  }
}
</style>