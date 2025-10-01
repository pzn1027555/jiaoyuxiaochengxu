<template>
  <div class="exams-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <i class="el-icon-document" />
          考试管理
        </h2>
        <p class="page-description">管理各类考试安排、成绩录入和分析</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog = true">
          创建考试
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-form :model="filterForm" :inline="true" class="filter-form">
          <el-form-item label="考试名称">
            <el-input
              v-model="filterForm.examName"
              placeholder="请输入考试名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="考试类型">
            <el-select
              v-model="filterForm.examType"
              placeholder="请选择考试类型"
              clearable
              style="width: 150px"
            >
              <el-option label="IGCSE" value="igcse" />
              <el-option label="A-Level" value="a-level" />
              <el-option label="模拟考试" value="mock" />
              <el-option label="阶段测试" value="stage" />
            </el-select>
          </el-form-item>
          <el-form-item label="科目">
            <el-select
              v-model="filterForm.subject"
              placeholder="请选择科目"
              clearable
              style="width: 120px"
            >
              <el-option label="数学" value="math" />
              <el-option label="物理" value="physics" />
              <el-option label="化学" value="chemistry" />
              <el-option label="AS物理" value="as_physics" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试状态">
            <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="未开始" value="pending" />
              <el-option label="进行中" value="ongoing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试时间">
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
          class="exams-table"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="examName" label="考试名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="examType" label="考试类型" width="120">
            <template slot-scope="scope">
              <el-tag :type="getExamTypeColor(scope.row.examType)" size="small">
                {{ getExamTypeText(scope.row.examType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="科目" width="100" />
          <el-table-column prop="examDate" label="考试日期" width="120" />
          <el-table-column prop="duration" label="考试时长" width="100">
            <template slot-scope="scope">
              {{ scope.row.duration }}分钟
            </template>
          </el-table-column>
          <el-table-column prop="totalStudents" label="参考人数" width="100" />
          <el-table-column prop="submittedCount" label="已提交" width="100" />
          <el-table-column prop="averageScore" label="平均分" width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.averageScore !== null">
                {{ scope.row.averageScore }}分
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="140" />
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button 
                v-if="scope.row.status === 'pending'" 
                size="mini" 
                type="text" 
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button size="mini" type="text" @click="handleStudents(scope.row)">
                学生列表
              </el-button>
              <el-button 
                v-if="scope.row.status === 'completed'" 
                size="mini" 
                type="text" 
                @click="handleResults(scope.row)"
              >
                成绩分析
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
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="examForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="formData.examName" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="formData.examType" placeholder="请选择考试类型" style="width: 100%">
            <el-option label="IGCSE" value="igcse" />
            <el-option label="A-Level" value="a-level" />
            <el-option label="模拟考试" value="mock" />
            <el-option label="阶段测试" value="stage" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="formData.subject" placeholder="请选择科目" style="width: 100%">
            <el-option label="数学" value="数学" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
            <el-option label="AS物理" value="AS物理" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试时间" prop="examDate">
          <el-date-picker
            v-model="formData.examDate"
            type="datetime"
            placeholder="选择考试时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="考试时长" prop="duration">
          <el-input-number
            v-model="formData.duration"
            :min="30"
            :max="300"
            :step="15"
            controls-position="right"
            style="width: 100%"
          />
          <span style="margin-left: 8px;">分钟</span>
        </el-form-item>
        <el-form-item label="考试说明" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入考试说明"
          />
        </el-form-item>
        <el-form-item label="参考学生" prop="students">
          <el-select
            v-model="formData.students"
            multiple
            placeholder="请选择参考学生"
            style="width: 100%"
          >
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 学生列表对话框 -->
    <el-dialog
      title="参考学生列表"
      :visible.sync="showStudentsDialog"
      width="800px"
    >
      <el-table :data="currentExamStudents" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="class" label="班级" width="100" />
        <el-table-column prop="submitTime" label="提交时间" width="140" />
        <el-table-column prop="score" label="成绩" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.score !== null">{{ scope.row.score }}分</span>
            <span v-else class="text-muted">未评分</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="scope.row.status === 'submitted' ? 'success' : 'warning'" 
              size="small"
            >
              {{ scope.row.status === 'submitted' ? '已提交' : '未提交' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 'submitted'" 
              size="mini" 
              type="text" 
              @click="handleGrading(scope.row)"
            >
              评分
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 成绩分析对话框 -->
    <el-dialog
      title="成绩分析"
      :visible.sync="showResultsDialog"
      width="900px"
    >
      <div class="results-content" v-if="currentExamResults">
        <div class="results-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="result-item">
                <div class="result-number">{{ currentExamResults.totalStudents }}</div>
                <div class="result-label">参考人数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="result-item">
                <div class="result-number">{{ currentExamResults.averageScore }}</div>
                <div class="result-label">平均分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="result-item">
                <div class="result-number">{{ currentExamResults.highestScore }}</div>
                <div class="result-label">最高分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="result-item">
                <div class="result-number">{{ currentExamResults.passRate }}%</div>
                <div class="result-label">及格率</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="results-charts">
          <el-card class="chart-card">
            <div slot="header">
              <span>成绩分布</span>
            </div>
            <div class="chart-placeholder">
              <i class="el-icon-s-data" style="font-size: 48px; color: #ccc;" />
              <p>成绩分布图表</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Exams',
  data() {
    return {
      loading: false,
      showCreateDialog: false,
      showStudentsDialog: false,
      showResultsDialog: false,
      editMode: false,
      currentRow: null,
      currentExamStudents: [],
      currentExamResults: null,
      
      // 筛选表单
      filterForm: {
        examName: '',
        examType: '',
        subject: '',
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
          examName: 'IGCSE数学期末考试',
          examType: 'igcse',
          subject: '数学',
          examDate: '2024-01-20',
          duration: 120,
          totalStudents: 25,
          submittedCount: 25,
          averageScore: 78.5,
          status: 'completed',
          createTime: '2024-01-10 14:30:00'
        },
        {
          id: 2,
          examName: 'A-Level物理模拟考',
          examType: 'a-level',
          subject: 'AS物理',
          examDate: '2024-01-25',
          duration: 90,
          totalStudents: 18,
          submittedCount: 0,
          averageScore: null,
          status: 'pending',
          createTime: '2024-01-15 09:15:00'
        }
      ],
      
      // 学生列表
      studentList: [
        { id: 1, name: '陈舍' },
        { id: 2, name: '孙小涵' },
        { id: 3, name: 'Bella' },
        { id: 4, name: 'Duoduo' },
        { id: 5, name: 'Camellia' }
      ],
      
      // 表单数据
      formData: {
        examName: '',
        examType: '',
        subject: '',
        examDate: '',
        duration: 120,
        description: '',
        students: []
      },
      
      // 表单验证规则
      formRules: {
        examName: [
          { required: true, message: '请输入考试名称', trigger: 'blur' }
        ],
        examType: [
          { required: true, message: '请选择考试类型', trigger: 'change' }
        ],
        subject: [
          { required: true, message: '请选择科目', trigger: 'change' }
        ],
        examDate: [
          { required: true, message: '请选择考试时间', trigger: 'change' }
        ],
        duration: [
          { required: true, message: '请输入考试时长', trigger: 'blur' }
        ],
        students: [
          { required: true, message: '请选择参考学生', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.editMode ? '编辑考试' : '创建考试'
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
        examName: '',
        examType: '',
        subject: '',
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
    getExamTypeColor(type) {
      const colorMap = {
        igcse: 'primary',
        'a-level': 'success',
        mock: 'warning',
        stage: 'info'
      }
      return colorMap[type] || 'info'
    },
    
    getExamTypeText(type) {
      const textMap = {
        igcse: 'IGCSE',
        'a-level': 'A-Level',
        mock: '模拟考试',
        stage: '阶段测试'
      }
      return textMap[type] || '未知'
    },
    
    getStatusType(status) {
      const statusMap = {
        pending: 'warning',
        ongoing: 'primary',
        completed: 'success',
        cancelled: 'danger'
      }
      return statusMap[status] || 'info'
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: '未开始',
        ongoing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    // 操作方法
    handleView(row) {
      this.$message.info(`查看考试：${row.examName}`)
    },
    
    handleEdit(row) {
      this.editMode = true
      this.currentRow = row
      this.formData = {
        examName: row.examName,
        examType: row.examType,
        subject: row.subject,
        examDate: row.examDate + ' 09:00:00',
        duration: row.duration,
        description: '',
        students: [1, 2, 3]
      }
      this.showCreateDialog = true
    },
    
    handleStudents(row) {
      this.currentExamStudents = [
        {
          studentName: '陈舍',
          studentId: 'S001',
          class: '数学A班',
          submitTime: '2024-01-20 10:30:00',
          score: 85,
          status: 'submitted'
        },
        {
          studentName: '孙小涵',
          studentId: 'S002',
          class: '数学A班',
          submitTime: '2024-01-20 10:25:00',
          score: 92,
          status: 'submitted'
        }
      ]
      this.showStudentsDialog = true
    },
    
    handleResults(row) {
      this.currentExamResults = {
        totalStudents: 25,
        averageScore: 78.5,
        highestScore: 95,
        passRate: 88
      }
      this.showResultsDialog = true
    },
    
    handleGrading(row) {
      this.$message.info(`为${row.studentName}评分`)
    },
    
    handleDelete(row) {
      this.$confirm(`确定要删除考试"${row.examName}"吗？`, '提示', {
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
      this.$refs.examForm.validate((valid) => {
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
        examName: '',
        examType: '',
        subject: '',
        examDate: '',
        duration: 120,
        description: '',
        students: []
      }
      if (this.$refs.examForm) {
        this.$refs.examForm.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.exams-page {
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

.exams-table {
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

.text-muted {
  color: #999;
}

.results-content {
  padding: 10px 0;
}

.results-summary {
  margin-bottom: 30px;
}

.result-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.result-number {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.result-label {
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
  .exams-page {
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