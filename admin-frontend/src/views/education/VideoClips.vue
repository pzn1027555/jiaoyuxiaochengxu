<template>
  <div class="video-clips-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="el-icon-video-play"></i>
          视频打点
        </h1>
        <p class="page-description">管理课程视频的关键时间点标记</p>
      </div>
    </div>

    <!-- 标签页容器 -->
    <TabsContainer 
      :tabs="tabs" 
      v-model="activeTab"
      @tab-change="handleTabChange"
    >
      <template v-slot="{ activeTab }">
        <!-- 未打点视频 -->
        <div v-if="activeTab === 'unclipped'" class="tab-panel">
          <div class="clips-section">
            <div class="section-header">
              <h3>未打点视频</h3>
            </div>
            
            <!-- 搜索栏 -->
            <div class="search-container">
              <el-form :model="searchForm" class="search-form" inline>
                <el-form-item label="课程名">
                  <el-input
                    v-model="searchForm.courseName"
                    placeholder="课程名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="科目">
                  <el-input
                    v-model="searchForm.subject"
                    placeholder="科目"
                    clearable
                    style="width: 120px"
                  />
                </el-form-item>
                <el-form-item label="老师名">
                  <el-input
                    v-model="searchForm.teacher"
                    placeholder="老师名"
                    clearable
                    style="width: 120px"
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
              <el-table :data="unclippedList" v-loading="loading" style="width: 100%">
                <el-table-column prop="courseName" label="课程名" width="200" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="lessonName" label="课名" width="180" />
                <el-table-column prop="teacher" label="老师名" width="120" />
                <el-table-column prop="isClipped" label="是否打点" width="100">
                  <template slot-scope="scope">
                    <span class="status-tag pending">未打点</span>
                  </template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上课时间" width="160" />
                <el-table-column label="打点" width="80" align="center">
                  <template slot-scope="scope">
                    <CircleButton 
                      :actions="[{ icon: 'el-icon-video-play', type: 'primary', tooltip: '开始打点', action: 'start-clip', data: scope.row }]"
                      @action-click="handleAction"
                    />
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-wrapper">
                <div class="pagination-info">
                  没有找到匹配的记录
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已打点视频 -->
        <div v-if="activeTab === 'clipped'" class="tab-panel">
          <div class="clips-section">
            <div class="section-header">
              <h3>已打点视频</h3>
            </div>
            
            <!-- 搜索栏 -->
            <div class="search-container">
              <el-form :model="searchForm" class="search-form" inline>
                <el-form-item label="课程名">
                  <el-input
                    v-model="searchForm.courseName"
                    placeholder="课程名"
                    clearable
                    style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="科目">
                  <el-input
                    v-model="searchForm.subject"
                    placeholder="科目"
                    clearable
                    style="width: 120px"
                  />
                </el-form-item>
                <el-form-item label="老师名">
                  <el-input
                    v-model="searchForm.teacher"
                    placeholder="老师名"
                    clearable
                    style="width: 120px"
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
              <el-table :data="clippedList" v-loading="loading" style="width: 100%">
                <el-table-column prop="courseName" label="课程名" width="200" />
                <el-table-column prop="subject" label="科目" width="120" />
                <el-table-column prop="lessonName" label="课名" width="180" />
                <el-table-column prop="teacher" label="老师名" width="120" />
                <el-table-column prop="clipCount" label="打点数量" width="100">
                  <template slot-scope="scope">
                    <el-tag size="small" type="success">{{ scope.row.clipCount || 0 }}个</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上课时间" width="160" />
                <el-table-column prop="updateTime" label="更新时间" width="160" />
                <el-table-column label="操作" width="160" align="center">
                  <template slot-scope="scope">
                    <CircleButton 
                      :actions="[
                        { icon: 'el-icon-view', type: 'primary', tooltip: '查看打点', action: 'view-clips', data: scope.row },
                        { icon: 'el-icon-edit', type: 'warning', tooltip: '编辑打点', action: 'edit-clips', data: scope.row }
                      ]"
                      @action-click="handleAction"
                    />
                  </template>
                </el-table-column>
              </el-table>
              
              <div class="pagination-wrapper">
                <div class="pagination-info">
                  没有找到匹配的记录
                </div>
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
import CircleButton from '@/components/CircleButton.vue'

export default {
  name: 'VideoClips',
  components: {
    TabsContainer,
    CircleButton
  },
  data() {
    return {
      loading: false,
      activeTab: 'unclipped',
      tabs: [
        { key: 'unclipped', label: '未打点视频' },
        { key: 'clipped', label: '已打点视频' }
      ],
      searchForm: {
        courseName: '',
        subject: '',
        teacher: ''
      },
      unclippedList: [],
      clippedList: []
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
    handleAction(actionData) {
      const { action, data } = actionData
      switch (action) {
        case 'start-clip':
          this.startClipping(data)
          break
        case 'view-clips':
          this.viewClips(data)
          break
        case 'edit-clips':
          this.editClips(data)
          break
        default:
          console.log('未知操作:', action)
      }
    },
    startClipping(video) {
      this.$message.info(`开始为视频 "${video.courseName}" 打点`)
    },
    viewClips(video) {
      this.$message.info(`查看视频 "${video.courseName}" 的打点`)
    },
    editClips(video) {
      this.$message.info(`编辑视频 "${video.courseName}" 的打点`)
    },
    async loadData() {
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (this.activeTab === 'unclipped') {
          this.unclippedList = []
        } else {
          this.clippedList = []
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.video-clips-container {
  padding: 24px;
  background-color: var(--background-color, #f8f9fa);
  min-height: 100vh;
}

.tab-panel {
  min-height: 500px;
}

.clips-section {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .video-clips-container {
    padding: 16px;
  }
  
  .clips-section {
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