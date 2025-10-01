<template>
  <div class="statistics-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <i class="el-icon-s-data" />
          教师数据统计
        </h2>
        <p class="page-description">教师工作量、教学质量和绩效统计分析</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-download" @click="handleExport">
          导出报表
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-form :model="filterForm" :inline="true" class="filter-form">
          <el-form-item label="教师姓名">
            <el-input
              v-model="filterForm.teacherName"
              placeholder="请输入教师姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="科目">
            <el-select
              v-model="filterForm.subject"
              placeholder="请选择科目"
              clearable
              style="width: 150px"
            >
              <el-option label="数学" value="math" />
              <el-option label="物理" value="physics" />
              <el-option label="化学" value="chemistry" />
              <el-option label="英语" value="english" />
            </el-select>
          </el-form-item>
          <el-form-item label="统计周期">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              format="yyyy-MM"
              value-format="yyyy-MM"
              style="width: 250px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">
              查询统计
            </el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 统计概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon math">
                <i class="el-icon-user" />
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overviewData.totalTeachers }}</div>
                <div class="overview-label">教师总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon physics">
                <i class="el-icon-time" />
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overviewData.totalHours }}</div>
                <div class="overview-label">总授课时长</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon chemistry">
                <i class="el-icon-star-on" />
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overviewData.avgRating }}</div>
                <div class="overview-label">平均评分</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon english">
                <i class="el-icon-s-check" />
              </div>
              <div class="overview-content">
                <div class="overview-number">{{ overviewData.completionRate }}%</div>
                <div class="overview-label">课程完成率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <div slot="header">
              <span>教师工作量分布</span>
            </div>
            <div class="chart-placeholder">
              <i class="el-icon-pie-chart" style="font-size: 48px; color: #ccc;" />
              <p>饼图展示区域</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <div slot="header">
              <span>月度教学时长趋势</span>
            </div>
            <div class="chart-placeholder">
              <i class="el-icon-s-marketing" style="font-size: 48px; color: #ccc;" />
              <p>折线图展示区域</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card">
            <div slot="header">
              <span>教师评分对比</span>
            </div>
            <div class="chart-placeholder large">
              <i class="el-icon-s-data" style="font-size: 48px; color: #ccc;" />
              <p>柱状图展示区域</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-card class="table-card">
        <div slot="header">
          <span>教师详细统计</span>
        </div>
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          class="statistics-table"
          :default-sort="{prop: 'totalHours', order: 'descending'}"
        >
          <el-table-column type="index" label="排名" width="60" />
          <el-table-column prop="teacherName" label="教师姓名" width="120" />
          <el-table-column prop="subject" label="科目" width="100" />
          <el-table-column prop="totalHours" label="总课时" width="100" sortable>
            <template slot-scope="scope">
              {{ scope.row.totalHours }}小时
            </template>
          </el-table-column>
          <el-table-column prop="studentCount" label="学生数量" width="100" sortable />
          <el-table-column prop="avgRating" label="平均评分" width="100" sortable>
            <template slot-scope="scope">
              <el-rate
                v-model="scope.row.avgRating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          <el-table-column prop="completionRate" label="完成率" width="100" sortable>
            <template slot-scope="scope">
              <el-progress 
                :percentage="scope.row.completionRate" 
                :color="getProgressColor(scope.row.completionRate)"
                :show-text="false"
              />
              <span style="margin-left: 8px;">{{ scope.row.completionRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="onTimeRate" label="准时率" width="100" sortable>
            <template slot-scope="scope">
              {{ scope.row.onTimeRate }}%
            </template>
          </el-table-column>
          <el-table-column prop="satisfaction" label="满意度" width="100" sortable>
            <template slot-scope="scope">
              <el-tag :type="getSatisfactionType(scope.row.satisfaction)" size="small">
                {{ getSatisfactionText(scope.row.satisfaction) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="monthlyIncome" label="月收入" width="120" sortable>
            <template slot-scope="scope">
              ¥{{ scope.row.monthlyIncome.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleViewDetail(scope.row)">
                查看详情
              </el-button>
              <el-button size="mini" type="text" @click="handleGenerateReport(scope.row)">
                生成报告
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          />
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      title="教师详细统计"
      :visible.sync="showDetailDialog"
      width="800px"
    >
      <div class="detail-content" v-if="currentTeacher">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="教师姓名">{{ currentTeacher.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="科目">{{ currentTeacher.subject }}</el-descriptions-item>
          <el-descriptions-item label="工龄">{{ currentTeacher.workYears }}年</el-descriptions-item>
          <el-descriptions-item label="总课时">{{ currentTeacher.totalHours }}小时</el-descriptions-item>
          <el-descriptions-item label="学生数量">{{ currentTeacher.studentCount }}人</el-descriptions-item>
          <el-descriptions-item label="平均评分">{{ currentTeacher.avgRating }}分</el-descriptions-item>
          <el-descriptions-item label="完成率">{{ currentTeacher.completionRate }}%</el-descriptions-item>
          <el-descriptions-item label="准时率">{{ currentTeacher.onTimeRate }}%</el-descriptions-item>
          <el-descriptions-item label="月收入">¥{{ currentTeacher.monthlyIncome.toLocaleString() }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-charts" style="margin-top: 30px;">
          <el-card>
            <div slot="header">
              <span>近6个月教学数据趋势</span>
            </div>
            <div class="chart-placeholder">
              <i class="el-icon-s-marketing" style="font-size: 48px; color: #ccc;" />
              <p>个人数据趋势图</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Statistics',
  data() {
    return {
      loading: false,
      showDetailDialog: false,
      currentTeacher: null,
      
      // 筛选表单
      filterForm: {
        teacherName: '',
        subject: '',
        dateRange: []
      },
      
      // 分页数据
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      
      // 概览数据
      overviewData: {
        totalTeachers: 126,
        totalHours: 15680,
        avgRating: 4.3,
        completionRate: 94
      },
      
      // 表格数据
      tableData: [
        {
          id: 1,
          teacherName: 'George Li',
          subject: '数学',
          totalHours: 160,
          studentCount: 25,
          avgRating: 4.8,
          completionRate: 96,
          onTimeRate: 98,
          satisfaction: 'high',
          monthlyIncome: 12000,
          workYears: 5
        },
        {
          id: 2,
          teacherName: '王老师',
          subject: '物理',
          totalHours: 145,
          studentCount: 22,
          avgRating: 4.5,
          completionRate: 94,
          onTimeRate: 95,
          satisfaction: 'high',
          monthlyIncome: 10500,
          workYears: 3
        },
        {
          id: 3,
          teacherName: '李老师',
          subject: '化学',
          totalHours: 138,
          studentCount: 20,
          avgRating: 4.2,
          completionRate: 89,
          onTimeRate: 92,
          satisfaction: 'medium',
          monthlyIncome: 9800,
          workYears: 4
        }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    // 加载数据
    loadData() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.pagination.total = this.tableData.length
        this.loading = false
      }, 500)
    },
    
    // 搜索
    handleSearch() {
      console.log('搜索参数:', this.filterForm)
      this.loadData()
    },
    
    // 重置
    handleReset() {
      this.filterForm = {
        teacherName: '',
        subject: '',
        dateRange: []
      }
      this.loadData()
    },
    
    // 分页
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadData()
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadData()
    },
    
    // 获取进度条颜色
    getProgressColor(percentage) {
      if (percentage >= 90) return '#67c23a'
      if (percentage >= 70) return '#e6a23c'
      return '#f56c6c'
    },
    
    // 获取满意度类型
    getSatisfactionType(satisfaction) {
      const typeMap = {
        high: 'success',
        medium: 'warning',
        low: 'danger'
      }
      return typeMap[satisfaction] || 'info'
    },
    
    // 获取满意度文本
    getSatisfactionText(satisfaction) {
      const textMap = {
        high: '很满意',
        medium: '一般',
        low: '待改进'
      }
      return textMap[satisfaction] || '未知'
    },
    
    // 操作方法
    handleViewDetail(row) {
      this.currentTeacher = row
      this.showDetailDialog = true
    },
    
    handleGenerateReport(row) {
      this.$message.success(`正在为${row.teacherName}生成报告...`)
    },
    
    handleExport() {
      this.$message.success('正在导出统计报表...')
    }
  }
}
</script>

<style scoped>
.statistics-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  font-size: 28px;
  color: #1890ff;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  flex-shrink: 0;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-card {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-form {
  margin: 0;
}

.overview-section {
  margin-bottom: 20px;
}

.overview-card {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.overview-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.overview-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.overview-icon.math {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.overview-icon.physics {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.overview-icon.chemistry {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.overview-icon.english {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.overview-content {
  flex: 1;
}

.overview-number {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.overview-label {
  font-size: 14px;
  color: #606266;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-placeholder {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.chart-placeholder.large {
  height: 350px;
}

.chart-placeholder p {
  margin: 10px 0 0 0;
  font-size: 14px;
}

.table-section {
  margin-bottom: 20px;
}

.table-card {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.statistics-table {
  width: 100%;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.detail-content {
  padding: 10px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .overview-section .el-col {
    margin-bottom: 15px;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .filter-form .el-input,
  .filter-form .el-select,
  .filter-form .el-date-picker {
    width: 100% !important;
  }
}
</style>