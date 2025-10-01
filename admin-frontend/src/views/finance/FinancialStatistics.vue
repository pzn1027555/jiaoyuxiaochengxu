<template>
  <div class="page-container">
    <div class="content-box">
      <h2>财务统计</h2>
      
      <!-- 核心指标卡片 -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67C23A;">
              <i class="el-icon-money"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">总收入</div>
              <div class="stat-value">¥{{ formatAmount(statistics.totalRevenue) }}</div>
              <div class="stat-trend">今日：¥{{ formatAmount(statistics.todayRevenue) }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409EFF;">
              <i class="el-icon-s-order"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">总订单</div>
              <div class="stat-value">{{ statistics.totalOrders || 0 }}</div>
              <div class="stat-trend">今日：{{ statistics.todayOrders || 0 }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #E6A23C;">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">支付成功率</div>
              <div class="stat-value">{{ formatPercent(statistics.paymentSuccessRate) }}%</div>
              <div class="stat-trend">客单价：¥{{ formatAmount(statistics.avgOrderAmount) }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #F56C6C;">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">退款率</div>
              <div class="stat-value">{{ formatPercent(statistics.refundRate) }}%</div>
              <div class="stat-trend">退款：¥{{ formatAmount(statistics.totalRefundAmount) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 趋势图表 -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>收入趋势（近30天）</span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="refreshTrend">刷新</el-button>
            </div>
            <div id="revenue-chart" style="height: 300px; display: flex; align-items: center; justify-content: center; color: #909399;">
              <i class="el-icon-pie-chart" style="font-size: 48px; margin-right: 16px;"></i>
              <span>收入趋势图表</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>订单状态分布</span>
            </div>
            <div id="order-status-chart" style="height: 300px; display: flex; align-items: center; justify-content: center; color: #909399;">
              <i class="el-icon-pie-chart" style="font-size: 48px; margin-right: 16px;"></i>
              <span>订单分布图表</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 支付方式和课程类型统计 -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>支付方式分布</span>
            </div>
            <el-table :data="paymentMethods" stripe>
              <el-table-column prop="methodName" label="支付方式" width="120"></el-table-column>
              <el-table-column prop="amount" label="金额">
                <template slot-scope="scope">
                  ¥{{ formatAmount(scope.row.amount) }}
                </template>
              </el-table-column>
              <el-table-column prop="orderCount" label="订单数" width="80"></el-table-column>
              <el-table-column prop="percentage" label="占比" width="80">
                <template slot-scope="scope">
                  {{ formatPercent(scope.row.percentage) }}%
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>课程类型收入</span>
            </div>
            <el-table :data="courseTypes" stripe>
              <el-table-column prop="typeName" label="课程类型" width="120"></el-table-column>
              <el-table-column prop="revenue" label="收入">
                <template slot-scope="scope">
                  ¥{{ formatAmount(scope.row.revenue) }}
                </template>
              </el-table-column>
              <el-table-column prop="orderCount" label="订单数" width="80"></el-table-column>
              <el-table-column prop="percentage" label="占比" width="80">
                <template slot-scope="scope">
                  {{ formatPercent(scope.row.percentage) }}%
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 排行榜 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>教师收入排行 TOP10</span>
            </div>
            <el-table :data="teacherRanking" stripe>
              <el-table-column type="index" label="排名" width="60"></el-table-column>
              <el-table-column prop="teacherName" label="教师" width="100"></el-table-column>
              <el-table-column prop="subject" label="科目" width="80"></el-table-column>
              <el-table-column prop="revenue" label="收入">
                <template slot-scope="scope">
                  ¥{{ formatAmount(scope.row.revenue) }}
                </template>
              </el-table-column>
              <el-table-column prop="orderCount" label="订单数" width="80"></el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>学生消费排行 TOP10</span>
            </div>
            <el-table :data="studentRanking" stripe>
              <el-table-column type="index" label="排名" width="60"></el-table-column>
              <el-table-column prop="studentName" label="学生" width="100"></el-table-column>
              <el-table-column prop="level" label="等级" width="80"></el-table-column>
              <el-table-column prop="consumption" label="消费">
                <template slot-scope="scope">
                  ¥{{ formatAmount(scope.row.consumption) }}
                </template>
              </el-table-column>
              <el-table-column prop="orderCount" label="订单数" width="80"></el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { 
  getFinancialStatistics,
  getRevenueTrend,
  getPaymentMethodDistribution,
  getCourseTypeRevenue,
  getTeacherRevenueRanking,
  getStudentConsumptionRanking
} from '@/api/finance'

export default {
  name: 'FinancialStatistics',
  data() {
    return {
      loading: false,
      statistics: {},
      revenueTrend: [],
      paymentMethods: [],
      courseTypes: [],
      teacherRanking: [],
      studentRanking: []
    }
  },
  
  created() {
    this.loadAllData()
  },
  
  methods: {
    async loadAllData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadStatistics(),
          this.loadPaymentMethods(),
          this.loadCourseTypes(),
          this.loadTeacherRanking(),
          this.loadStudentRanking()
        ])
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await getFinancialStatistics()
        if (response.code === 200) {
          this.statistics = response.data
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    async loadPaymentMethods() {
      try {
        const response = await getPaymentMethodDistribution()
        if (response.code === 200) {
          this.paymentMethods = response.data.map(item => ({
            ...item,
            methodName: this.getPaymentMethodName(item.paymentMethod)
          }))
        }
      } catch (error) {
        console.error('加载支付方式数据失败', error)
      }
    },
    
    async loadCourseTypes() {
      try {
        const response = await getCourseTypeRevenue()
        if (response.code === 200) {
          this.courseTypes = response.data.map(item => ({
            ...item,
            typeName: this.getCourseTypeName(item.courseType)
          }))
        }
      } catch (error) {
        console.error('加载课程类型数据失败', error)
      }
    },
    
    async loadTeacherRanking() {
      try {
        const response = await getTeacherRevenueRanking(10)
        if (response.code === 200) {
          this.teacherRanking = response.data
        }
      } catch (error) {
        console.error('加载教师排行数据失败', error)
      }
    },
    
    async loadStudentRanking() {
      try {
        const response = await getStudentConsumptionRanking(10)
        if (response.code === 200) {
          this.studentRanking = response.data
        }
      } catch (error) {
        console.error('加载学生排行数据失败', error)
      }
    },
    
    refreshTrend() {
      this.$message.info('图表数据刷新功能开发中')
    },
    
    formatAmount(amount) {
      return amount ? Number(amount).toFixed(2) : '0.00'
    },
    
    formatPercent(percent) {
      return percent ? Number(percent).toFixed(2) : '0.00'
    },
    
    getPaymentMethodName(method) {
      const names = {
        'wechat': '微信支付',
        'alipay': '支付宝',
        'balance': '余额支付'
      }
      return names[method] || method
    },
    
    getCourseTypeName(type) {
      const names = {
        'one_on_one': '一对一',
        'small_class': '小班课',
        'live_class': '直播课'
      }
      return names[type] || type
    }
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
      margin-bottom: 4px;
    }
    
    .stat-trend {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>