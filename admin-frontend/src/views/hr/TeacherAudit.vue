<template>
  <div class="page-container">
    <div class="content-box">
      <h2>教师审核</h2>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card pending">
              <div class="stat-icon">
                <i class="el-icon-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ pendingCount }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card approved">
              <div class="stat-icon">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ approvedCount }}</div>
                <div class="stat-label">审核通过</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card rejected">
              <div class="stat-icon">
                <i class="el-icon-close"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ rejectedCount }}</div>
                <div class="stat-label">审核拒绝</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-icon">
                <i class="el-icon-user"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalCount }}</div>
                <div class="stat-label">总教师数</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button 
            type="success" 
            icon="el-icon-check" 
            :disabled="!hasSelection"
            @click="handleBatchAudit(1)"
          >
            批量通过
          </el-button>
          <el-button 
            type="danger" 
            icon="el-icon-close" 
            :disabled="!hasSelection"
            @click="handleBatchAudit(2)"
          >
            批量拒绝
          </el-button>
          <el-button 
            type="primary" 
            icon="el-icon-message" 
            :disabled="!hasApprovedSelection"
            @click="handleBatchContract"
          >
            批量发送合同
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-button icon="el-icon-refresh" @click="loadPendingTeachers">刷新</el-button>
        </div>
      </div>

      <!-- 待审核教师列表 -->
      <div class="table-container">
        <el-table
          ref="auditTable"
          :data="pendingTeachers"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          
          <el-table-column label="教师信息" width="240" fixed="left">
            <template slot-scope="scope">
              <div class="teacher-info">
                <el-avatar :size="50" :src="scope.row.avatar">
                  {{ scope.row.teacherName ? scope.row.teacherName.charAt(0) : '' }}
                </el-avatar>
                <div class="teacher-details">
                  <div class="teacher-name">{{ scope.row.teacherName }}</div>
                  <div class="teacher-no">{{ scope.row.teacherNo }}</div>
                  <div class="teacher-phone">{{ scope.row.phone }}</div>
                  <div class="teacher-email">{{ scope.row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="education" label="学历" width="80" align="center"></el-table-column>
          
          <el-table-column prop="major" label="专业" width="120" align="center"></el-table-column>
          
          <el-table-column prop="graduationSchool" label="毕业学校" width="150" align="center"></el-table-column>
          
          <el-table-column prop="teachingExperience" label="教学经验" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.teachingExperience || 0 }}年
            </template>
          </el-table-column>
          
          <el-table-column label="教授科目" width="150" align="center">
            <template slot-scope="scope">
              <el-tag 
                v-for="subject in (scope.row.subjects || [])" 
                :key="subject" 
                size="mini" 
                style="margin: 2px"
              >
                {{ subject }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="hourlyRate" label="课时费" width="100" align="center">
            <template slot-scope="scope">
              ¥{{ scope.row.hourlyRate }}
            </template>
          </el-table-column>
          
          <el-table-column label="申请时间" width="150" align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleViewDetail(scope.row)">查看详情</el-button>
              <el-button size="mini" type="success" @click="handleAudit(scope.row, 1)">通过</el-button>
              <el-button size="mini" type="danger" @click="handleAudit(scope.row, 2)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog title="教师详情审核" :visible.sync="auditDialogVisible" width="800px">
      <div v-if="currentTeacher" class="teacher-detail">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="avatar-section">
              <el-avatar :size="120" :src="currentTeacher.avatar">
                {{ currentTeacher.teacherName ? currentTeacher.teacherName.charAt(0) : '' }}
              </el-avatar>
              <h3 class="teacher-name">{{ currentTeacher.teacherName }}</h3>
              <p class="teacher-no">编号：{{ currentTeacher.teacherNo }}</p>
            </div>
          </el-col>
          
          <el-col :span="16">
            <div class="teacher-info-detail">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="手机号">{{ currentTeacher.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ currentTeacher.email }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ getGenderText(currentTeacher.gender) }}</el-descriptions-item>
                <el-descriptions-item label="学历">{{ currentTeacher.education }}</el-descriptions-item>
                <el-descriptions-item label="专业">{{ currentTeacher.major }}</el-descriptions-item>
                <el-descriptions-item label="毕业学校">{{ currentTeacher.graduationSchool }}</el-descriptions-item>
                <el-descriptions-item label="教学经验">{{ currentTeacher.teachingExperience || 0 }}年</el-descriptions-item>
                <el-descriptions-item label="课时费">¥{{ currentTeacher.hourlyRate }}</el-descriptions-item>
              </el-descriptions>
              
              <div class="section">
                <h4>教授科目</h4>
                <el-tag 
                  v-for="subject in (currentTeacher.subjects || [])" 
                  :key="subject" 
                  style="margin: 4px"
                >
                  {{ subject }}
                </el-tag>
              </div>
              
              <div class="section">
                <h4>教授年级</h4>
                <el-tag 
                  v-for="grade in (currentTeacher.grades || [])" 
                  :key="grade" 
                  type="success"
                  style="margin: 4px"
                >
                  {{ grade }}
                </el-tag>
              </div>
              
              <div class="section">
                <h4>个人介绍</h4>
                <p>{{ currentTeacher.introduction || '暂无介绍' }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div class="audit-form-section">
        <el-divider>审核信息</el-divider>
        <el-form :model="auditForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="审核结果" required>
                <el-radio-group v-model="auditForm.auditStatus">
                  <el-radio :label="1">审核通过</el-radio>
                  <el-radio :label="2">审核拒绝</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            
            <el-col :span="12" v-if="auditForm.auditStatus === 1">
              <el-form-item label="教师等级">
                <el-select v-model="auditForm.teacherLevel" placeholder="请选择教师等级">
                  <el-option label="初级" value="junior"></el-option>
                  <el-option label="中级" value="intermediate"></el-option>
                  <el-option label="高级" value="senior"></el-option>
                  <el-option label="专家" value="expert"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" v-if="auditForm.auditStatus === 1">
            <el-col :span="12">
              <el-form-item label="佣金比例">
                <el-input-number 
                  v-model="auditForm.commissionRate" 
                  :min="0" 
                  :max="50" 
                  :step="0.1"
                  :precision="2"
                />
                <span style="margin-left: 10px">%</span>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="审核备注">
            <el-input 
              type="textarea" 
              v-model="auditForm.auditReason" 
              :rows="3"
              placeholder="请输入审核备注（选填）"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定审核</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getPendingAuditTeachers,
  getTeacherStatistics,
  auditTeacher,
  batchOperation,
  getTeacherDetail
} from '@/api/teacher'

export default {
  name: 'TeacherAudit',
  data() {
    return {
      loading: false,
      pendingTeachers: [],
      selectedTeachers: [],
      
      // 统计数据
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalCount: 0,
      
      // 审核对话框
      auditDialogVisible: false,
      currentTeacher: null,
      auditForm: {
        teacherId: null,
        auditStatus: 1,
        teacherLevel: 'junior',
        commissionRate: 15.0,
        auditReason: ''
      }
    }
  },
  
  computed: {
    hasSelection() {
      return this.selectedTeachers.length > 0
    },
    
    hasApprovedSelection() {
      return this.selectedTeachers.some(t => t.auditStatus === 1)
    }
  },
  
  mounted() {
    this.loadPendingTeachers()
    this.loadStatistics()
  },
  
  methods: {
    async loadPendingTeachers() {
      this.loading = true
      try {
        const response = await getPendingAuditTeachers()
        if (response.code === 200) {
          this.pendingTeachers = response.data || []
          this.pendingCount = this.pendingTeachers.length
        }
      } catch (error) {
        this.$message.error('加载待审核教师列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await getTeacherStatistics()
        if (response.code === 200) {
          const stats = response.data
          this.pendingCount = stats.pendingAudit || 0
          this.totalCount = stats.totalTeachers || 0
          // 这里可以根据需要计算其他统计数据
          this.approvedCount = Math.max(0, this.totalCount - this.pendingCount)
          this.rejectedCount = 0 // 需要后端提供具体数据
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    handleSelectionChange(selection) {
      this.selectedTeachers = selection
    },
    
    // 查看教师详情
    async handleViewDetail(row) {
      try {
        const response = await getTeacherDetail(row.id)
        if (response.code === 200) {
          this.currentTeacher = response.data
          this.auditForm = {
            teacherId: row.id,
            auditStatus: 1,
            teacherLevel: row.teacherLevel || 'junior',
            commissionRate: row.commissionRate || 15.0,
            auditReason: ''
          }
          this.auditDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取教师详情失败')
        console.error(error)
      }
    },
    
    // 单个审核
    async handleAudit(row, auditStatus) {
      const statusText = auditStatus === 1 ? '通过' : '拒绝'
      
      this.$confirm(`确定${statusText}教师"${row.teacherName}"的申请吗？`, '确认审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: auditStatus === 1 ? 'success' : 'warning'
      }).then(async () => {
        try {
          const response = await auditTeacher({
            teacherId: row.id,
            auditStatus,
            teacherLevel: auditStatus === 1 ? 'junior' : undefined,
            commissionRate: auditStatus === 1 ? 15.0 : undefined,
            auditReason: `快速${statusText}`
          })
          
          if (response.code === 200) {
            this.$message.success(`审核${statusText}成功`)
            this.loadPendingTeachers()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error(`审核${statusText}失败`)
          console.error(error)
        }
      })
    },
    
    // 批量审核
    async handleBatchAudit(auditStatus) {
      const teacherIds = this.selectedTeachers.map(t => t.id)
      const statusText = auditStatus === 1 ? '通过' : '拒绝'
      
      this.$confirm(`确定批量${statusText}选中的 ${teacherIds.length} 位教师吗？`, '确认批量审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: auditStatus === 1 ? 'success' : 'warning'
      }).then(async () => {
        try {
          const response = await batchOperation({
            teacherIds,
            operationType: 'audit',
            auditStatus,
            auditReason: `批量${statusText}`
          })
          
          if (response.code === 200) {
            this.$message.success(`批量审核${statusText}成功`)
            this.loadPendingTeachers()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error(`批量审核${statusText}失败`)
          console.error(error)
        }
      })
    },
    
    // 批量发送合同
    async handleBatchContract() {
      const approvedTeachers = this.selectedTeachers.filter(t => t.auditStatus === 1)
      const teacherIds = approvedTeachers.map(t => t.id)
      
      if (teacherIds.length === 0) {
        this.$message.warning('请选择已审核通过的教师')
        return
      }
      
      this.$confirm(`确定向选中的 ${teacherIds.length} 位教师发送合同吗？`, '确认批量发送合同', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const response = await batchOperation({
            teacherIds,
            operationType: 'contract'
          })
          
          if (response.code === 200) {
            this.$message.success('批量发送合同成功')
            this.loadPendingTeachers()
          }
        } catch (error) {
          this.$message.error('批量发送合同失败')
          console.error(error)
        }
      })
    },
    
    // 提交详细审核
    async submitAudit() {
      try {
        const response = await auditTeacher(this.auditForm)
        if (response.code === 200) {
          this.$message.success('审核成功')
          this.auditDialogVisible = false
          this.loadPendingTeachers()
          this.loadStatistics()
        }
      } catch (error) {
        this.$message.error('审核失败')
        console.error(error)
      }
    },
    
    // 工具方法
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString()
    },
    
    getGenderText(gender) {
      if (gender === 1) return '男'
      if (gender === 2) return '女'
      return '未设置'
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
    transition: transform 0.2s;
    
    &:hover {
      transform: translateY(-2px);
    }
    
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
    
    &.pending {
      .stat-icon {
        background: #e6a23c;
      }
      .stat-value {
        color: #e6a23c;
      }
    }
    
    &.approved {
      .stat-icon {
        background: #67c23a;
      }
      .stat-value {
        color: #67c23a;
      }
    }
    
    &.rejected {
      .stat-icon {
        background: #f56c6c;
      }
      .stat-value {
        color: #f56c6c;
      }
    }
    
    &.total {
      .stat-icon {
        background: #409eff;
      }
      .stat-value {
        color: #409eff;
      }
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .toolbar-left {
    .el-button {
      margin-right: 10px;
    }
  }
}

.table-container {
  .teacher-info {
    display: flex;
    align-items: center;
    
    .teacher-details {
      margin-left: 12px;
      
      .teacher-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .teacher-no, .teacher-phone, .teacher-email {
        font-size: 12px;
        color: #909399;
        margin-bottom: 2px;
      }
    }
  }
}

.teacher-detail {
  .avatar-section {
    text-align: center;
    
    .teacher-name {
      margin: 16px 0 8px 0;
      color: #303133;
    }
    
    .teacher-no {
      color: #909399;
      margin: 0;
    }
  }
  
  .teacher-info-detail {
    .section {
      margin-top: 20px;
      
      h4 {
        margin-bottom: 10px;
        color: #303133;
      }
      
      p {
        color: #606266;
        line-height: 1.6;
      }
    }
  }
}

.audit-form-section {
  margin-top: 20px;
}

::v-deep .custom-table {
  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #909399;
      font-weight: 500;
    }
  }
  
  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>