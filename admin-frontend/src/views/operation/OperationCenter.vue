<template>
  <div class="operation-center">
    <!-- 运营概览 -->
    <div class="overview-section">
      <h3 class="section-title">
        <i class="el-icon-office-building"></i>
        运营中心概览
      </h3>
      
      <el-row :gutter="20" class="overview-cards">
        <el-col :span="6">
          <div class="overview-card recommendations">
            <div class="card-header">
              <span class="card-title">推荐教师</span>
              <i class="el-icon-star-on card-icon"></i>
            </div>
            <div class="card-body">
              <div class="main-value">{{ statistics.totalRecommendations || 0 }}</div>
              <div class="sub-values">
                <div class="sub-value">
                  <span class="label">活跃推荐：</span>
                  <span class="value">{{ statistics.activeRecommendations || 0 }}</span>
                </div>
                <div class="sub-value">
                  <span class="label">总点击率：</span>
                  <span class="value">{{ (statistics.avgClickRate * 100).toFixed(2) }}%</span>
                </div>
              </div>
              <div class="trend-info">
                <span class="trend-label">转化率：</span>
                <span class="trend-value positive">{{ (statistics.avgConversionRate * 100).toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="overview-card activities">
            <div class="card-header">
              <span class="card-title">裂变活动</span>
              <i class="el-icon-present card-icon"></i>
            </div>
            <div class="card-body">
              <div class="main-value">{{ statistics.totalActivities || 0 }}</div>
              <div class="sub-values">
                <div class="sub-value">
                  <span class="label">进行中：</span>
                  <span class="value">{{ statistics.activeActivities || 0 }}</span>
                </div>
                <div class="sub-value">
                  <span class="label">总参与：</span>
                  <span class="value">{{ formatNumber(statistics.totalParticipants) || 0 }}</span>
                </div>
              </div>
              <div class="trend-info">
                <span class="trend-label">平均转化率：</span>
                <span class="trend-value positive">{{ (statistics.avgActivityConversionRate * 100).toFixed(2) }}%</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="overview-card revenue">
            <div class="card-header">
              <span class="card-title">推荐收益</span>
              <i class="el-icon-coin card-icon"></i>
            </div>
            <div class="card-body">
              <div class="main-value">¥{{ formatNumber(statistics.totalRevenue) || 0 }}</div>
              <div class="sub-values">
                <div class="sub-value">
                  <span class="label">展示次数：</span>
                  <span class="value">{{ formatNumber(statistics.totalDisplays) || 0 }}</span>
                </div>
                <div class="sub-value">
                  <span class="label">点击次数：</span>
                  <span class="value">{{ formatNumber(statistics.totalClicks) || 0 }}</span>
                </div>
              </div>
              <div class="trend-info">
                <span class="trend-label">转化次数：</span>
                <span class="trend-value">{{ formatNumber(statistics.totalConversions) || 0 }}</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="overview-card rewards">
            <div class="card-header">
              <span class="card-title">奖励发放</span>
              <i class="el-icon-wallet card-icon"></i>
            </div>
            <div class="card-body">
              <div class="main-value">¥{{ formatNumber(statistics.totalRewardAmount) || 0 }}</div>
              <div class="sub-values">
                <div class="sub-value">
                  <span class="label">成功邀请：</span>
                  <span class="value">{{ formatNumber(statistics.totalSuccessInvitations) || 0 }}</span>
                </div>
                <div class="sub-value">
                  <span class="label">平均奖励：</span>
                  <span class="value">¥{{ getAvgReward() }}</span>
                </div>
              </div>
              <div class="trend-info">
                <span class="trend-label">本月发放</span>
                <span class="trend-value">¥{{ formatNumber(monthlyReward) || 0 }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions-section">
      <h3 class="section-title">
        <i class="el-icon-magic-stick"></i>
        快速操作
      </h3>
      
      <el-row :gutter="20" class="action-cards">
        <el-col :span="6">
          <div class="action-card" @click="goToRecommendations">
            <div class="action-icon">
              <i class="el-icon-star-on"></i>
            </div>
            <div class="action-content">
              <div class="action-title">教师推荐榜单</div>
              <div class="action-desc">管理重点推广教师名单</div>
            </div>
            <div class="action-arrow">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="action-card" @click="goToActivities">
            <div class="action-icon">
              <i class="el-icon-present"></i>
            </div>
            <div class="action-content">
              <div class="action-title">裂变活动配置</div>
              <div class="action-desc">配置邀请奖励规则</div>
            </div>
            <div class="action-arrow">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="action-card" @click="showCreateRecommendation">
            <div class="action-icon">
              <i class="el-icon-plus"></i>
            </div>
            <div class="action-content">
              <div class="action-title">新增推荐</div>
              <div class="action-desc">添加教师到推荐榜单</div>
            </div>
            <div class="action-arrow">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="action-card" @click="showCreateActivity">
            <div class="action-icon">
              <i class="el-icon-circle-plus"></i>
            </div>
            <div class="action-content">
              <div class="action-title">创建活动</div>
              <div class="action-desc">新建裂变推广活动</div>
            </div>
            <div class="action-arrow">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 热门推荐和活跃活动 -->
    <div class="content-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="content-card">
            <h3 class="card-title">
              <i class="el-icon-trophy"></i>
              热门推荐教师
              <el-button type="text" size="mini" @click="goToRecommendations">查看全部</el-button>
            </h3>
            
            <div class="recommendation-list">
              <div 
                v-for="(teacher, index) in hotRecommendations" 
                :key="teacher.id"
                class="recommendation-item"
              >
                <div class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</div>
                <div class="teacher-avatar">
                  <img :src="teacher.avatar || '/default-avatar.png'" :alt="teacher.teacherName">
                </div>
                <div class="teacher-info">
                  <div class="teacher-name">{{ teacher.teacherName }}</div>
                  <div class="teacher-subject">{{ teacher.subject }} · {{ teacher.teacherLevel }}</div>
                  <div class="teacher-tags">
                    <el-tag 
                      v-for="tag in getTeacherTags(teacher.tags)" 
                      :key="tag" 
                      size="mini" 
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                <div class="teacher-stats">
                  <div class="stat-item">
                    <span class="stat-label">点击率</span>
                    <span class="stat-value">{{ (teacher.clickRate * 100).toFixed(2) }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">转化率</span>
                    <span class="stat-value">{{ (teacher.conversionRate * 100).toFixed(2) }}%</span>
                  </div>
                </div>
                <div class="teacher-actions">
                  <el-button type="text" size="mini" @click="viewRecommendationDetail(teacher.id)">
                    详情
                  </el-button>
                  <el-button 
                    type="text" 
                    size="mini" 
                    :class="teacher.isTop ? 'text-warning' : ''"
                    @click="toggleTopStatus(teacher)"
                  >
                    {{ teacher.isTop ? '取消置顶' : '置顶' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="content-card">
            <h3 class="card-title">
              <i class="el-icon-present"></i>
              活跃裂变活动
              <el-button type="text" size="mini" @click="goToActivities">查看全部</el-button>
            </h3>
            
            <div class="activity-list">
              <div 
                v-for="activity in activeActivities" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-header">
                  <div class="activity-name">{{ activity.activityName }}</div>
                  <el-tag 
                    :type="getActivityStatusType(activity.status)" 
                    size="mini"
                  >
                    {{ getActivityStatusText(activity.status) }}
                  </el-tag>
                </div>
                <div class="activity-content">
                  <div class="activity-info">
                    <div class="activity-type">{{ getActivityTypeText(activity.activityType) }}</div>
                    <div class="activity-time">
                      {{ formatDateTime(activity.startTime) }} ~ {{ formatDateTime(activity.endTime) }}
                    </div>
                  </div>
                  <div class="activity-stats">
                    <div class="stat-row">
                      <span class="stat-label">参与人数：</span>
                      <span class="stat-value">{{ activity.participantCount || 0 }}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">成功邀请：</span>
                      <span class="stat-value">{{ activity.successInvitations || 0 }}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">转化率：</span>
                      <span class="stat-value highlight">
                        {{ activity.participantCount > 0 ? 
                          ((activity.successInvitations / activity.participantCount) * 100).toFixed(2) : '0.00' }}%
                      </span>
                    </div>
                  </div>
                </div>
                <div class="activity-actions">
                  <el-button type="text" size="mini" @click="viewActivityDetail(activity.id)">
                    详情
                  </el-button>
                  <el-button type="text" size="mini" @click="editActivity(activity.id)">
                    编辑
                  </el-button>
                  <el-button 
                    type="text" 
                    size="mini"
                    :class="activity.status === 1 ? 'text-warning' : 'text-success'"
                    @click="toggleActivityStatus(activity)"
                  >
                    {{ activity.status === 1 ? '暂停' : '启动' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 效果分析图表 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card">
            <h3 class="chart-title">
              <i class="el-icon-data-line"></i>
              推荐效果趋势
            </h3>
            <div class="chart-content" id="recommendationTrendChart" style="height: 300px;">
              <div class="chart-placeholder">
                <i class="el-icon-trend-charts"></i>
                <span>推荐效果趋势图表</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="chart-card">
            <h3 class="chart-title">
              <i class="el-icon-pie-chart"></i>
              活动类型分布
            </h3>
            <div class="chart-content" id="activityTypeChart" style="height: 300px;">
              <div class="chart-placeholder">
                <i class="el-icon-pie-chart"></i>
                <span>活动类型分布饼图</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 新增推荐对话框 -->
    <el-dialog
      title="新增教师推荐"
      :visible.sync="showRecommendationDialog"
      width="600px"
    >
      <RecommendationForm
        v-if="showRecommendationDialog"
        :recommendation="currentRecommendation"
        @success="handleRecommendationSuccess"
        @cancel="showRecommendationDialog = false"
      />
    </el-dialog>

    <!-- 新增活动对话框 -->
    <el-dialog
      title="创建裂变活动"
      :visible.sync="showActivityDialog"
      width="800px"
    >
      <ActivityForm
        v-if="showActivityDialog"
        :activity="currentActivity"
        @success="handleActivitySuccess"
        @cancel="showActivityDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  getOperationStatistics,
  getHotRecommendations,
  getActiveActivities,
  updateRecommendationTopStatus,
  updateActivityStatus
} from '@/api/operation'
import RecommendationForm from './components/RecommendationForm.vue'
import ActivityForm from './components/ActivityForm.vue'

export default {
  name: 'OperationCenter',
  components: {
    RecommendationForm,
    ActivityForm
  },
  data() {
    return {
      loading: false,
      statistics: {},
      hotRecommendations: [],
      activeActivities: [],
      monthlyReward: 0,
      
      // 对话框状态
      showRecommendationDialog: false,
      showActivityDialog: false,
      currentRecommendation: null,
      currentActivity: null
    }
  },
  
  mounted() {
    this.loadData()
  },
  
  methods: {
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadStatistics(),
          this.loadHotRecommendations(),
          this.loadActiveActivities()
        ])
      } catch (error) {
        console.error('加载数据失败', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      const response = await getOperationStatistics()
      if (response.code === 200) {
        this.statistics = response.data
        // 模拟本月奖励数据
        this.monthlyReward = (this.statistics.totalRewardAmount || 0) * 0.3
      }
    },
    
    async loadHotRecommendations() {
      const response = await getHotRecommendations(8)
      if (response.code === 200) {
        this.hotRecommendations = response.data
      }
    },
    
    async loadActiveActivities() {
      const response = await getActiveActivities()
      if (response.code === 200) {
        this.activeActivities = response.data.slice(0, 6) // 只显示前6个
      }
    },
    
    // 导航方法
    goToRecommendations() {
      this.$router.push('/operation/recommendations')
    },
    
    goToActivities() {
      this.$router.push('/operation/activities')
    },
    
    // 对话框控制
    showCreateRecommendation() {
      this.currentRecommendation = null
      this.showRecommendationDialog = true
    },
    
    showCreateActivity() {
      this.currentActivity = null
      this.showActivityDialog = true
    },
    
    handleRecommendationSuccess() {
      this.showRecommendationDialog = false
      this.loadHotRecommendations()
      this.loadStatistics()
      this.$message.success('推荐创建成功')
    },
    
    handleActivitySuccess() {
      this.showActivityDialog = false
      this.loadActiveActivities()
      this.loadStatistics()
      this.$message.success('活动创建成功')
    },
    
    // 操作方法
    viewRecommendationDetail(id) {
      this.$router.push(`/operation/recommendations/${id}`)
    },
    
    async toggleTopStatus(teacher) {
      try {
        const newTopStatus = teacher.isTop ? 0 : 1
        const response = await updateRecommendationTopStatus(teacher.id, newTopStatus)
        if (response.code === 200) {
          teacher.isTop = newTopStatus
          this.$message.success(`${newTopStatus ? '置顶' : '取消置顶'}成功`)
        }
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    
    viewActivityDetail(id) {
      this.$router.push(`/operation/activities/${id}`)
    },
    
    editActivity(id) {
      this.$router.push(`/operation/activities/${id}/edit`)
    },
    
    async toggleActivityStatus(activity) {
      try {
        const newStatus = activity.status === 1 ? 3 : 1 // 1-进行中，3-已暂停
        const response = await updateActivityStatus(activity.id, newStatus)
        if (response.code === 200) {
          activity.status = newStatus
          this.$message.success(`活动${newStatus === 1 ? '启动' : '暂停'}成功`)
        }
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    
    // 工具方法
    formatNumber(num) {
      if (!num) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    
    formatDateTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString()
    },
    
    getAvgReward() {
      if (!this.statistics.totalSuccessInvitations || this.statistics.totalSuccessInvitations === 0) {
        return '0'
      }
      const avg = this.statistics.totalRewardAmount / this.statistics.totalSuccessInvitations
      return avg.toFixed(2)
    },
    
    getRankClass(index) {
      if (index === 0) return 'rank-first'
      if (index === 1) return 'rank-second'
      if (index === 2) return 'rank-third'
      return 'rank-normal'
    },
    
    getTeacherTags(tagsJson) {
      if (!tagsJson) return []
      try {
        return JSON.parse(tagsJson)
      } catch {
        return []
      }
    },
    
    getActivityStatusType(status) {
      switch (status) {
        case 0: return 'info'    // 未开始
        case 1: return 'success' // 进行中
        case 2: return 'info'    // 已结束
        case 3: return 'warning' // 已暂停
        default: return 'info'
      }
    },
    
    getActivityStatusText(status) {
      switch (status) {
        case 0: return '未开始'
        case 1: return '进行中'
        case 2: return '已结束'
        case 3: return '已暂停'
        default: return '未知'
      }
    },
    
    getActivityTypeText(type) {
      switch (type) {
        case 'invite': return '邀请奖励'
        case 'share': return '分享奖励'
        case 'task': return '任务奖励'
        default: return '邀请奖励'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-center {
  padding: 20px;
  background: #f5f7fa;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

.overview-section {
  margin-bottom: 30px;
  
  .overview-cards {
    .overview-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
        
        .card-icon {
          font-size: 20px;
          color: #409eff;
        }
      }
      
      .card-body {
        .main-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        
        .sub-values {
          margin-bottom: 12px;
          
          .sub-value {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 14px;
            
            .label {
              color: #606266;
            }
            
            .value {
              color: #303133;
              font-weight: 500;
            }
          }
        }
        
        .trend-info {
          font-size: 14px;
          
          .trend-label {
            color: #606266;
          }
          
          .trend-value {
            font-weight: 500;
            
            &.positive {
              color: #67c23a;
            }
          }
        }
      }
      
      &.recommendations .main-value { color: #409eff; }
      &.activities .main-value { color: #67c23a; }
      &.revenue .main-value { color: #e6a23c; }
      &.rewards .main-value { color: #f56c6c; }
    }
  }
}

.quick-actions-section {
  margin-bottom: 30px;
  
  .action-cards {
    .action-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
      }
      
      .action-icon {
        width: 50px;
        height: 50px;
        border-radius: 25px;
        background: #409eff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        
        i {
          font-size: 20px;
          color: white;
        }
      }
      
      .action-content {
        flex: 1;
        
        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .action-desc {
          font-size: 14px;
          color: #606266;
        }
      }
      
      .action-arrow {
        font-size: 16px;
        color: #c0c4cc;
      }
    }
  }
}

.content-section {
  margin-bottom: 30px;
  
  .content-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    height: 500px;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      
      i {
        margin-right: 8px;
        color: #409eff;
      }
      
      .el-button {
        margin-left: auto;
      }
    }
    
    .recommendation-list {
      max-height: 420px;
      overflow-y: auto;
      
      .recommendation-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .rank-number {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          margin-right: 12px;
          
          &.rank-first {
            background: #ffd700;
            color: white;
          }
          
          &.rank-second {
            background: #c0c0c0;
            color: white;
          }
          
          &.rank-third {
            background: #cd7f32;
            color: white;
          }
          
          &.rank-normal {
            background: #f0f0f0;
            color: #606266;
          }
        }
        
        .teacher-avatar {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          overflow: hidden;
          margin-right: 12px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .teacher-info {
          flex: 1;
          
          .teacher-name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .teacher-subject {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }
          
          .teacher-tags {
            .el-tag {
              margin-right: 4px;
            }
          }
        }
        
        .teacher-stats {
          margin-right: 12px;
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 2px;
            
            .stat-label {
              color: #909399;
              margin-right: 8px;
            }
            
            .stat-value {
              color: #409eff;
              font-weight: 500;
            }
          }
        }
        
        .teacher-actions {
          .el-button {
            margin-left: 4px;
            
            &.text-warning {
              color: #e6a23c;
            }
          }
        }
      }
    }
    
    .activity-list {
      max-height: 420px;
      overflow-y: auto;
      
      .activity-item {
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          .activity-name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .activity-content {
          margin-bottom: 12px;
          
          .activity-info {
            margin-bottom: 8px;
            
            .activity-type {
              font-size: 14px;
              color: #409eff;
              margin-bottom: 4px;
            }
            
            .activity-time {
              font-size: 12px;
              color: #909399;
            }
          }
          
          .activity-stats {
            .stat-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 2px;
              
              .stat-label {
                color: #606266;
              }
              
              .stat-value {
                color: #303133;
                font-weight: 500;
                
                &.highlight {
                  color: #67c23a;
                }
              }
            }
          }
        }
        
        .activity-actions {
          .el-button {
            margin-right: 8px;
            
            &.text-warning {
              color: #e6a23c;
            }
            
            &.text-success {
              color: #67c23a;
            }
          }
        }
      }
    }
  }
}

.charts-section {
  .chart-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      
      i {
        margin-right: 8px;
        color: #409eff;
      }
    }
    
    .chart-content {
      background: #f9f9f9;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .chart-placeholder {
        display: flex;
        align-items: center;
        color: #909399;
        font-size: 14px;
        
        i {
          font-size: 32px;
          margin-right: 12px;
        }
      }
    }
  }
}
</style>