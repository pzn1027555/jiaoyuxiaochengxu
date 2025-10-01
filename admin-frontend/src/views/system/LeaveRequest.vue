<template>
  <div class="leave-request-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <i class="el-icon-document-copy" />
          网课模考评请管理
        </h2>
        <p class="page-description">管理学生的网课和模考请假申请</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog = true">
          新增申请
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <el-form :model="filterForm" :inline="true" class="filter-form">
          <el-form-item label="学生姓名">
            <el-input
              v-model="filterForm.studentName"
              placeholder="请输入学生姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="申请类型">
            <el-select
              v-model="filterForm.type"
              placeholder="请选择申请类型"
              clearable
              style="width: 150px"
            >
              <el-option label="网课请假" value="online_class" />
              <el-option label="模考请假" value="mock_exam" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请时间">
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
          class="leave-request-table"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="type" label="申请类型" width="120">
            <template slot-scope="scope">
              <el-tag :type="scope.row.type === 'online_class' ? 'primary' : 'warning'" size="small">
                {{ scope.row.type === 'online_class' ? '网课请假' : '模考请假' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="科目/考试" width="120" />
          <el-table-column prop="leaveDate" label="请假日期" width="120" />
          <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="审核状态" width="100">
            <template slot-scope="scope">
              <el-tag
                :type="getStatusType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="申请时间" width="140" />
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button
                v-if="scope.row.status === 'pending'"
                size="mini"
                type="text"
                @click="handleApprove(scope.row)"
              >
                审核
              </el-button>
              <el-button size="mini" type="text" @click="handleEdit(scope.row)">
                编辑
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
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="leaveRequestForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="学生姓名" prop="studentName">
          <el-input v-model="formData.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="formData.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="申请类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择申请类型" style="width: 100%">
            <el-option label="网课请假" value="online_class" />
            <el-option label="模考请假" value="mock_exam" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目/考试" prop="subject">
          <el-input v-model="formData.subject" placeholder="请输入科目或考试名称" />
        </el-form-item>
        <el-form-item label="请假日期" prop="leaveDate">
          <el-date-picker
            v-model="formData.leaveDate"
            type="date"
            placeholder="选择请假日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入请假原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      title="审核申请"
      :visible.sync="showApprovalDialog"
      width="500px"
    >
      <el-form
        ref="approvalForm"
        :model="approvalForm"
        label-width="80px"
      >
        <el-form-item label="审核结果">
          <el-radio-group v-model="approvalForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showApprovalDialog = false">取消</el-button>
        <el-button type="primary" @click="handleApprovalSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'LeaveRequest',
  data() {
    return {
      loading: false,
      showCreateDialog: false,
      showApprovalDialog: false,
      editMode: false,
      currentRow: null,
      
      // 筛选表单
      filterForm: {
        studentName: '',
        type: '',
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
          studentName: '张三',
          studentId: 'S2024001',
          type: 'online_class',
          subject: '数学',
          leaveDate: '2024-01-15',
          reason: '身体不适，需要休息',
          status: 'pending',
          createTime: '2024-01-10 14:30:00'
        },
        {
          id: 2,
          studentName: '李四',
          studentId: 'S2024002',
          type: 'mock_exam',
          subject: 'IGCSE数学模考',
          leaveDate: '2024-01-20',
          reason: '家中有急事需要处理',
          status: 'approved',
          createTime: '2024-01-12 09:15:00'
        }
      ],
      
      // 表单数据
      formData: {
        studentName: '',
        studentId: '',
        type: '',
        subject: '',
        leaveDate: '',
        reason: ''
      },
      
      // 表单验证规则
      formRules: {
        studentName: [
          { required: true, message: '请输入学生姓名', trigger: 'blur' }
        ],
        studentId: [
          { required: true, message: '请输入学号', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择申请类型', trigger: 'change' }
        ],
        subject: [
          { required: true, message: '请输入科目或考试名称', trigger: 'blur' }
        ],
        leaveDate: [
          { required: true, message: '请选择请假日期', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入请假原因', trigger: 'blur' }
        ]
      },
      
      // 审核表单
      approvalForm: {
        result: 'approved',
        comment: ''
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.editMode ? '编辑申请' : '新增申请'
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
        studentName: '',
        type: '',
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
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return statusMap[status] || 'info'
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || '未知'
    },
    
    // 操作方法
    handleView(row) {
      this.$message.info(`查看申请：${row.studentName}`)
    },
    
    handleEdit(row) {
      this.editMode = true
      this.currentRow = row
      this.formData = { ...row }
      this.showCreateDialog = true
    },
    
    handleApprove(row) {
      this.currentRow = row
      this.approvalForm = {
        result: 'approved',
        comment: ''
      }
      this.showApprovalDialog = true
    },
    
    handleDelete(row) {
      this.$confirm(`确定要删除 ${row.studentName} 的申请吗？`, '提示', {
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
      this.$refs.leaveRequestForm.validate((valid) => {
        if (valid) {
          console.log('提交数据:', this.formData)
          this.$message.success(this.editMode ? '更新成功' : '创建成功')
          this.showCreateDialog = false
          this.loadData()
        }
      })
    },
    
    // 审核提交
    handleApprovalSubmit() {
      console.log('审核结果:', this.approvalForm)
      this.$message.success('审核完成')
      this.showApprovalDialog = false
      this.loadData()
    },
    
    // 重置表单
    resetForm() {
      this.editMode = false
      this.currentRow = null
      this.formData = {
        studentName: '',
        studentId: '',
        type: '',
        subject: '',
        leaveDate: '',
        reason: ''
      }
      if (this.$refs.leaveRequestForm) {
        this.$refs.leaveRequestForm.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.leave-request-page {
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

.leave-request-table {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .leave-request-page {
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