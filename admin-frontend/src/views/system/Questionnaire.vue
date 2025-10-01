<template>
  <div class="questionnaire-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <i class="el-icon-edit-outline" />
          问卷调查管理
        </h2>
        <p class="page-description">创建和管理教学质量调查问卷</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog = true">
          创建问卷
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-form :model="filterForm" :inline="true" class="filter-form">
          <el-form-item label="问卷名称">
            <el-input
              v-model="filterForm.title"
              placeholder="请输入问卷名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="问卷状态">
            <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="发布中" value="published" />
              <el-option label="已结束" value="ended" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 250px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">
              搜索
            </el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          class="questionnaire-table"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="title" label="问卷标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="description" label="问卷描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionCount" label="题目数量" width="100" />
          <el-table-column prop="responseCount" label="回答数量" width="100" />
          <el-table-column prop="startDate" label="开始时间" width="140" />
          <el-table-column prop="endDate" label="结束时间" width="140" />
          <el-table-column prop="createTime" label="创建时间" width="140" />
          <el-table-column label="操作" width="220" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button size="mini" type="text" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button
                v-if="scope.row.status === 'draft'"
                size="mini"
                type="text"
                @click="handlePublish(scope.row)"
              >
                发布
              </el-button>
              <el-button
                v-if="scope.row.status === 'published'"
                size="mini"
                type="text"
                @click="handleEnd(scope.row)"
              >
                结束
              </el-button>
              <el-button size="mini" type="text" @click="handleStats(scope.row)">
                统计
              </el-button>
              <el-button
                size="mini"
                type="text"
                class="danger-text"
                @click="handleDelete(scope.row)"
              >
                删除
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showCreateDialog"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="questionnaireForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="问卷标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入问卷标题" />
        </el-form-item>
        <el-form-item label="问卷描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入问卷描述"
          />
        </el-form-item>
        <el-form-item label="调查时间" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="目标群体" prop="targetGroup">
          <el-checkbox-group v-model="formData.targetGroup">
            <el-checkbox label="students">学生</el-checkbox>
            <el-checkbox label="teachers">教师</el-checkbox>
            <el-checkbox label="parents">家长</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="是否匿名" prop="isAnonymous">
          <el-switch v-model="formData.isAnonymous" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </el-dialog>

    <!-- 问卷统计对话框 -->
    <el-dialog
      title="问卷统计"
      :visible.sync="showStatsDialog"
      width="900px"
    >
      <div class="stats-content" v-if="currentStats">
        <div class="stats-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stats-item">
                <div class="stats-number">{{ currentStats.totalResponses }}</div>
                <div class="stats-label">总回答数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stats-item">
                <div class="stats-number">{{ currentStats.completionRate }}%</div>
                <div class="stats-label">完成率</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stats-item">
                <div class="stats-number">{{ currentStats.averageTime }}分钟</div>
                <div class="stats-label">平均用时</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stats-item">
                <div class="stats-number">{{ currentStats.satisfactionScore }}</div>
                <div class="stats-label">满意度评分</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="stats-charts">
          <el-card class="chart-card">
            <div slot="header">
              <span>回答趋势</span>
            </div>
            <div class="chart-placeholder">
              <i class="el-icon-pie-chart" style="font-size: 48px; color: #ccc;" />
              <p>图表展示区域</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Questionnaire',
  data() {
    return {
      loading: false,
      showCreateDialog: false,
      showStatsDialog: false,
      editMode: false,
      currentRow: null,
      currentStats: null,
      
      // 筛选表单
      filterForm: {
        title: '',
        status: '',
        dateRange: []
      },
      
      // 分页数据
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      
      // 表格数据
      tableData: [
        {
          id: 1,
          title: '2024年春季教学质量调查',
          description: '针对本学期教学质量和学生满意度的综合调查',
          status: 'published',
          questionCount: 15,
          responseCount: 128,
          startDate: '2024-01-15 09:00:00',
          endDate: '2024-02-15 18:00:00',
          createTime: '2024-01-10 14:30:00'
        },
        {
          id: 2,
          title: '一对一课程反馈调查',
          description: '收集学生对一对一辅导课程的意见和建议',
          status: 'ended',
          questionCount: 10,
          responseCount: 85,
          startDate: '2024-01-01 09:00:00',
          endDate: '2024-01-31 18:00:00',
          createTime: '2024-01-01 09:00:00'
        }
      ],
      
      // 表单数据
      formData: {
        title: '',
        description: '',
        dateRange: [],
        targetGroup: [],
        isAnonymous: true
      },
      
      // 表单验证规则
      formRules: {
        title: [
          { required: true, message: '请输入问卷标题', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入问卷描述', trigger: 'blur' }
        ],
        dateRange: [
          { required: true, message: '请选择调查时间', trigger: 'change' }
        ],
        targetGroup: [
          { required: true, message: '请选择目标群体', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.editMode ? '编辑问卷' : '创建问卷'
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
        title: '',
        status: '',
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
    
    // 状态相关方法
    getStatusType(status) {
      const statusMap = {
        draft: 'info',
        published: 'success',
        ended: 'warning'
      }
      return statusMap[status] || 'info'
    },
    
    getStatusText(status) {
      const statusMap = {
        draft: '草稿',
        published: '发布中',
        ended: '已结束'
      }
      return statusMap[status] || '未知'
    },
    
    // 操作方法
    handleView(row) {
      this.$message.info(`查看问卷：${row.title}`)
    },
    
    handleEdit(row) {
      this.editMode = true
      this.currentRow = row
      this.formData = {
        title: row.title,
        description: row.description,
        dateRange: [row.startDate, row.endDate],
        targetGroup: ['students', 'teachers'],
        isAnonymous: true
      }
      this.showCreateDialog = true
    },
    
    handlePublish(row) {
      this.$confirm(`确定要发布问卷"${row.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('问卷发布成功')
        this.loadData()
      })
    },
    
    handleEnd(row) {
      this.$confirm(`确定要结束问卷"${row.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('问卷已结束')
        this.loadData()
      })
    },
    
    handleStats(row) {
      this.currentStats = {
        totalResponses: 128,
        completionRate: 85,
        averageTime: 12,
        satisfactionScore: 4.2
      }
      this.showStatsDialog = true
    },
    
    handleDelete(row) {
      this.$confirm(`确定要删除问卷"${row.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        this.loadData()
      })
    },
    
    // 表单提交
    handleSubmit() {
      this.$refs.questionnaireForm.validate((valid) => {
        if (valid) {
          console.log('提交数据:', this.formData)
          this.$message.success(this.editMode ? '更新成功' : '创建成功')
          this.showCreateDialog = false
          this.loadData()
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.editMode = false
      this.currentRow = null
      this.formData = {
        title: '',
        description: '',
        dateRange: [],
        targetGroup: [],
        isAnonymous: true
      }
      if (this.$refs.questionnaireForm) {
        this.$refs.questionnaireForm.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.questionnaire-page {
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

.table-section {
  margin-bottom: 20px;
}

.table-card {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.questionnaire-table {
  width: 100%;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

.danger-text {
  color: #f56c6c;
}

.danger-text:hover {
  color: #f78989;
}

.stats-content {
  padding: 10px 0;
}

.stats-summary {
  margin-bottom: 30px;
}

.stats-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stats-number {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.chart-card {
  margin-top: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.chart-placeholder p {
  margin: 10px 0 0 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
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
</style>