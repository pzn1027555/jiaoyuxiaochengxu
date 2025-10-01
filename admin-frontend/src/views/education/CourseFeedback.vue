<template>
  <div class="course-feedback-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="el-icon-chat-dot-round"></i>
          我的课程
        </h1>
        <p class="page-description">管理和查看课程反馈信息</p>
      </div>
    </div>

    <!-- 标签页容器 -->
    <TabsContainer 
      :tabs="tabs" 
      v-model="activeTab"
      @tab-change="handleTabChange"
    >
      <template v-slot="{ activeTab }">
        <!-- 未填写课程反馈 -->
        <div v-if="activeTab === 'unfilled'" class="tab-panel">
          <div class="feedback-section">
            <div class="section-header">
              <h3>未填写课程反馈</h3>
            </div>
            
            <!-- 搜索栏 -->
            <div class="search-container">
              <el-form :model="searchForm" class="search-form" inline>
                <el-form-item label="课程名">
                  <el-input
                    v-model="searchForm.courseName"
                    placeholder="请输入课程名"
                    clearable
                    style="width: 180px"
                  />
                </el-form-item>
                <el-form-item label="科目">
                  <el-input
                    v-model="searchForm.subject"
                    placeholder="请输入科目"
                    clearable
                    style="width: 120px"
                  />
                </el-form-item>
                <el-form-item label="课名">
                  <el-input
                    v-model="searchForm.lessonName"
                    placeholder="请输入课名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="讲师">
                  <el-input
                    v-model="searchForm.teacher"
                    placeholder="请输入讲师名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="handleSearch">
                    查询
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 表格 -->
            <div class="table-container">
              <el-table :data="unfilledList" v-loading="loading" style="width: 100%">
                <el-table-column prop="courseName" label="课程名" width="180" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="lessonName" label="课名" width="180" />
                <el-table-column prop="classDate" label="上课日期" width="120" />
                <el-table-column prop="classTime" label="上课时间" width="120" />
                <el-table-column prop="feedback" label="课程反馈" width="180">
                  <template slot-scope="scope">
                    <span class="feedback-placeholder">{{ scope.row.feedback || '待填写' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="teacher" label="讲师" width="120" />
                <el-table-column prop="duration" label="计时" width="100" />
                <el-table-column prop="officialFeedback" label="官方已反馈" width="140">
                  <template slot-scope="scope">
                    <span :class="['status-tag', scope.row.officialFeedback ? 'active' : 'pending']">
                      {{ scope.row.officialFeedback ? '是' : '否' }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-wrapper">
                <div class="pagination-info">
                  显示 1 - {{ unfilledList.length }} 条，共 {{ unfilledList.length }} 条
                </div>
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="unfilledList.length"
                  :page-size="10"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 已填写课程反馈 -->
        <div v-if="activeTab === 'filled'" class="tab-panel">
          <div class="feedback-section">
            <div class="section-header">
              <h3>已填写课程反馈</h3>
            </div>
            
            <!-- 搜索栏 -->
            <div class="search-container">
              <el-form :model="searchForm" class="search-form" inline>
                <el-form-item label="课程名">
                  <el-input
                    v-model="searchForm.courseName"
                    placeholder="请输入课程名"
                    clearable
                    style="width: 180px"
                  />
                </el-form-item>
                <el-form-item label="科目">
                  <el-input
                    v-model="searchForm.subject"
                    placeholder="请输入科目"
                    clearable
                    style="width: 120px"
                  />
                </el-form-item>
                <el-form-item label="课名">
                  <el-input
                    v-model="searchForm.lessonName"
                    placeholder="请输入课名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="讲师">
                  <el-input
                    v-model="searchForm.teacher"
                    placeholder="请输入讲师名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="handleSearch">
                    查询
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 表格 -->
            <div class="table-container">
              <el-table :data="filledList" v-loading="loading" style="width: 100%">
                <el-table-column prop="courseName" label="课程名" width="180" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="lessonName" label="课名" width="180" />
                <el-table-column prop="classDate" label="上课日期" width="120" />
                <el-table-column prop="classTime" label="上课时间" width="120" />
                <el-table-column prop="feedback" label="课程反馈" width="250" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span class="feedback-content">{{ scope.row.feedback }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="teacher" label="讲师" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <span :class="['status-tag', getStatusClass(scope.row.status)]">
                      {{ getStatusText(scope.row.status) }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-wrapper">
                <div class="pagination-info">
                  显示 1 - {{ filledList.length }} 条，共 {{ filledList.length }} 条
                </div>
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="filledList.length"
                  :page-size="10"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </TabsContainer>
  </div>
</template>

<script>
import TabsContainer from '@/components/TabsContainer.vue'

export default {
  name: 'CourseFeedback',
  components: {
    TabsContainer
  },
  data() {
    return {
      loading: false,
      activeTab: 'unfilled',
      tabs: [
        { key: 'unfilled', label: '未填写课程反馈' },
        { key: 'filled', label: '已填写课程反馈' }
      ],
      searchForm: {
        courseName: '',
        subject: '',
        lessonName: '',
        teacher: ''
      },
      unfilledList: [
        // 模拟数据 - 未填写反馈
      ],
      filledList: [
        // 模拟数据 - 已填写反馈
      ]
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab.key
      this.loadData()
    },
    handleSearch() {
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (this.activeTab === 'unfilled') {
          this.unfilledList = []
        } else {
          this.filledList = []
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'reviewed': '已审核',
        'pending': '待处理'
      }
      return statusMap[status] || '未知'
    },
    getStatusClass(status) {
      const classMap = {
        'completed': 'active',
        'reviewed': 'active',
        'pending': 'pending'
      }
      return classMap[status] || 'default'
    }
  }
}
</script>

<style scoped>
.course-feedback-container {
  padding: 24px;
  background-color: var(--background-color, #f8f9fa);
  min-height: 100vh;
}

.tab-panel {
  min-height: 500px;
}

.feedback-section {
  padding: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0;
}

.feedback-placeholder {
  color: var(--text-placeholder, #c0c4cc);
  font-style: italic;
}

.feedback-content {
  color: var(--text-primary, #303133);
  line-height: 1.4;
}

.no-data {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary, #909399);
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-feedback-container {
    padding: 16px;
  }
  
  .feedback-section {
    padding: 16px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-bottom: 12px;
  }
}
</style>