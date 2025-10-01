<template>
  <div class="dashboard-container">
    <!-- 数据看板 -->
    <div class="data-board-section">
      <h3 class="section-title">
        <i class="el-icon-data-line"></i>
        数据看板
        <el-button
          type="text"
          size="mini"
          @click="refreshRealtimeData"
          :loading="realtimeLoading"
        >
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </h3>

      <el-row :gutter="20" class="data-cards">
        <el-col :span="6">
          <div class="data-card users">
            <div class="card-header">
              <i class="el-icon-user"></i>
              <span class="card-title">今日新增用户</span>
            </div>
            <div class="card-value">{{ realtimeData.todayNewUsers || 0 }}</div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="data-card orders">
            <div class="card-header">
              <i class="el-icon-shopping-bag-2"></i>
              <span class="card-title">今日订单数</span>
            </div>
            <div class="card-value">{{ realtimeData.todayOrders || 0 }}</div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="data-card revenue">
            <div class="card-header">
              <i class="el-icon-coin"></i>
              <span class="card-title">今日收入</span>
            </div>
            <div class="card-value">¥{{ formatNumber(realtimeData.todayRevenue) || 0 }}</div>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="data-card total-users">
            <div class="card-header">
              <i class="el-icon-user-solid"></i>
              <span class="card-title">总用户数</span>
            </div>
            <div class="card-value">{{ formatNumber(statistics.totalUsers) || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 用户数据汇总分析 -->
    <div class="analysis-section">
      <h3 class="section-title">
        <i class="el-icon-s-data"></i>
        用户数据汇总分析
      </h3>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="analysis-card">
            <h4 class="analysis-title">
              <i class="el-icon-map-location"></i>
              城市渗透率分析
            </h4>
            <div class="analysis-content">
              <el-table
                :data="cityPenetration"
                class="penetration-table"
                stripe
                v-loading="analysisLoading"
                empty-text="暂无数据"
              >
                <el-table-column prop="city" label="城市" width="200"></el-table-column>
                <el-table-column prop="userCount" label="用户数" width="120"></el-table-column>
                <el-table-column prop="penetrationRate" label="渗透率(%)">
                  <template slot-scope="scope">
                    {{ scope.row.penetrationRate ? scope.row.penetrationRate.toFixed(2) : '0.00' }}%
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="analysis-card">
            <h4 class="analysis-title">
              <i class="el-icon-trend-charts"></i>
              用户单价趋势预测
            </h4>
            <div class="analysis-content">
              <el-table
                :data="orderAmountTrend"
                class="trend-table"
                stripe
                v-loading="analysisLoading"
                empty-text="暂无数据"
              >
                <el-table-column prop="date" label="日期" width="200"></el-table-column>
                <el-table-column prop="avgOrderAmount" label="平均单价(元)" width="120">
                  <template slot-scope="scope">
                    {{ formatNumber(scope.row.avgOrderAmount) }}
                  </template>
                </el-table-column>
                <el-table-column prop="orderCount" label="订单数"></el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 审核和投诉面板 -->
    <div class="panel-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="panel-card">
            <h3 class="panel-title">
              <i class="el-icon-user-solid"></i>
              教师审核面板
              <el-badge :value="teacherAuditData.pendingAuditCount" :max="99" class="badge" />
            </h3>
            
            <div class="panel-stats">
              <div class="stat-item">
                <span class="stat-value">{{ teacherAuditData.pendingAuditCount || 0 }}</span>
                <span class="stat-label">待审核</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ teacherAuditData.riskTeacherCount || 0 }}</span>
                <span class="stat-label">风险教师</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ teacherAuditData.newApplications || 0 }}</span>
                <span class="stat-label">今日新申请</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ teacherAuditData.avgProcessTime || 0 }}天</span>
                <span class="stat-label">平均处理时间</span>
              </div>
            </div>
            
            <div class="panel-list">
              <div class="list-header">
                <span>待审核教师</span>
                <el-button type="text" size="mini">查看全部</el-button>
              </div>
              <div class="list-content">
                <div 
                  v-for="teacher in teacherAuditData.pendingTeachers" 
                  :key="teacher.id"
                  class="list-item"
                >
                  <div class="item-info">
                    <div class="item-name">{{ teacher.name }}</div>
                    <div class="item-desc">{{ teacher.subject }} · {{ formatTime(teacher.applyTime) }}</div>
                  </div>
                  <div class="item-actions">
                    <el-tag :type="teacher.urgency === '高' ? 'danger' : 'warning'" size="mini">
                      {{ teacher.urgency }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="panel-card">
            <h3 class="panel-title">
              <i class="el-icon-warning"></i>
              投诉处理面板
              <el-badge :value="complaintData.pendingComplaints" :max="99" class="badge" />
            </h3>
            
            <div class="panel-stats">
              <div class="stat-item">
                <span class="stat-value">{{ complaintData.pendingComplaints || 0 }}</span>
                <span class="stat-label">待处理</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ complaintData.totalComplaints || 0 }}</span>
                <span class="stat-label">总投诉</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ complaintData.todayComplaints || 0 }}</span>
                <span class="stat-label">今日新增</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ complaintData.avgResponseTime?0 - complaintData.avgResponseTime : 0 }}h</span>
                <span class="stat-label">平均响应时间</span>
              </div>
            </div>
            
            <div class="panel-list">
              <div class="list-header">
                <span>最近投诉</span>
                <el-button type="text" size="mini">查看全部</el-button>
              </div>
              <div class="list-content">
                <div 
                  v-for="complaint in complaintData.recentComplaints" 
                  :key="complaint.id"
                  class="list-item"
                >
                  <div class="item-info">
                    <div class="item-name">{{ complaint.studentName }} → {{ complaint.teacherName }}</div>
                    <div class="item-desc">{{ complaint.type }} · {{ formatTime(complaint.createTime) }}</div>
                  </div>
                  <div class="item-actions">
                    <el-tag 
                      :type="complaint.status === '待处理' ? 'warning' : 'success'" 
                      size="mini"
                    >
                      {{ complaint.status }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<script>
import {
  getDashboardStatistics,
  getRealtimeData,
  getTeacherAuditPanelData,
  getComplaintPanelData,
  getCityPenetrationAnalysis,
  getOrderAmountTrend
} from '@/api/dashboard'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: false,
      realtimeLoading: false,
      analysisLoading: false,

      // 数据
      statistics: {},
      realtimeData: {},
      teacherAuditData: {},
      complaintData: {},
      cityPenetration: [],
      orderAmountTrend: [],

      // 定时器
      realtimeTimer: null
    }
  },
  
  mounted() {
    this.loadAllData()
    this.startRealtimeUpdate()
  },
  
  beforeDestroy() {
    if (this.realtimeTimer) {
      clearInterval(this.realtimeTimer)
    }
  },
  
  methods: {
    async loadAllData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadStatistics(),
          this.loadRealtimeData(),
          this.loadPanelData(),
          this.loadAnalysisData()
        ])
      } catch (error) {
        console.error('加载数据失败', error)
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      const response = await getDashboardStatistics()
      if (response.code === 200) {
        this.statistics = response.data
      }
    },
    
    async loadRealtimeData() {
      const response = await getRealtimeData()
      if (response.code === 200) {
        this.realtimeData = response.data
      }
    },

    async loadPanelData() {
      const [teacherResponse, complaintResponse] = await Promise.all([
        getTeacherAuditPanelData(),
        getComplaintPanelData()
      ])

      if (teacherResponse.code === 200) {
        this.teacherAuditData = teacherResponse.data
      }
      if (complaintResponse.code === 200) {
        this.complaintData = complaintResponse.data
      }
    },

    async loadAnalysisData() {
      this.analysisLoading = true
      try {
        // 加载城市渗透率数据
        const penetrationResponse = await getCityPenetrationAnalysis()
        if (penetrationResponse.code === 200) {
          this.cityPenetration = Array.isArray(penetrationResponse.data.cities)
            ? penetrationResponse.data.cities
            : []
        }

        // 加载用户单价趋势数据
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const trendResponse = await getOrderAmountTrend(startDate, endDate)
        if (trendResponse.code === 200) {
          this.orderAmountTrend = Array.isArray(trendResponse.data.trend)
            ? trendResponse.data.trend
            : []
        }
      } catch (error) {
        console.error('加载分析数据失败', error)
        this.cityPenetration = []
        this.orderAmountTrend = []
      } finally {
        this.analysisLoading = false
      }
    },
    
    async refreshRealtimeData() {
      this.realtimeLoading = true
      try {
        await this.loadRealtimeData()
      } finally {
        this.realtimeLoading = false
      }
    },
    
    startRealtimeUpdate() {
      // 每30秒自动更新实时数据
      this.realtimeTimer = setInterval(() => {
        this.loadRealtimeData()
      }, 30000)
    },

    // 工具方法
    formatNumber(num) {
      if (!num) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleDateString()
      }
    },
    
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
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

    .el-button {
      margin-left: auto;
    }
  }
}

.data-board-section {
  margin-bottom: 30px;

  .data-cards {
    .data-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        i {
          font-size: 20px;
          margin-right: 8px;
        }

        .card-title {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }

      .card-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
      }

      &.users {
        .card-header i { color: #409eff; }
        .card-value { color: #409eff; }
      }

      &.orders {
        .card-header i { color: #67c23a; }
        .card-value { color: #67c23a; }
      }

      &.revenue {
        .card-header i { color: #e6a23c; }
        .card-value { color: #e6a23c; }
      }

      &.total-users {
        .card-header i { color: #f56c6c; }
        .card-value { color: #f56c6c; }
      }
    }
  }
}

.analysis-section {
  margin-bottom: 30px;

  .analysis-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .analysis-title {
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

    .analysis-content {
      .penetration-table, .trend-table {
        width: 100%;

        ::v-deep .el-table__header-wrapper {
          th {
            background-color: #f5f7fa;
          }
        }

        ::v-deep .el-table__body-wrapper {
          .el-table__row {
            td {
              padding: 8px;
            }
          }
        }
      }
    }
  }
}

.panel-section {
  margin-bottom: 30px;
  
  .panel-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    height: 100%;
    
    .panel-title {
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
      
      .badge {
        margin-left: 8px;
      }
    }
    
    .panel-stats {
      display: flex;
      margin-bottom: 20px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        
        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #606266;
        }
      }
    }
    
    .panel-list {
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
      
      .list-content {
        .list-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .item-info {
            flex: 1;
            
            .item-name {
              font-size: 14px;
              color: #303133;
              margin-bottom: 4px;
            }
            
            .item-desc {
              font-size: 12px;
              color: #909399;
            }
          }
          
          .item-actions {
            .el-tag {
              margin-left: 8px;
            }
          }
        }
      }
    }
  }
}

.charts-section {
  margin-bottom: 30px;
  
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

.ranking-section {
  margin-bottom: 30px;
  
  .ranking-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .ranking-title {
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
    
    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .rank-number {
          width: 32px;
          height: 32px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
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
        
        .rank-info {
          flex: 1;
          
          .rank-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .rank-desc {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .rank-data {
          text-align: right;
          
          .rank-sales, .rank-students {
            font-size: 12px;
            color: #606266;
            margin-bottom: 4px;
          }
          
          .rank-revenue {
            font-size: 14px;
            color: #67c23a;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.penetration-section {
  .penetration-content {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .penetration-table {
      width: 100%;
    }
    
  }
}
</style>