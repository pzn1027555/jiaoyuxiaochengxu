<template>
  <div class="page-container">
    <div class="content-box">
      <h2>学生管理</h2>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="stat-card total">
              <div class="stat-icon">
                <i class="el-icon-user"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalStudents }}</div>
                <div class="stat-label">总学生数</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card gold">
              <div class="stat-icon">
                <i class="el-icon-trophy"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ goldStudents }}</div>
                <div class="stat-label">金牌学生</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card silver">
              <div class="stat-icon">
                <i class="el-icon-medal"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ silverStudents }}</div>
                <div class="stat-label">银牌学生</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card bronze">
              <div class="stat-icon">
                <i class="el-icon-medal-1"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ bronzeStudents }}</div>
                <div class="stat-label">铜牌学生</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card urgent">
              <div class="stat-icon">
                <i class="el-icon-warning"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ urgentRenewalStudents }}</div>
                <div class="stat-label">紧急续课</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card active">
              <div class="stat-icon">
                <i class="el-icon-success"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ activeStudents }}</div>
                <div class="stat-label">活跃学生</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="学生姓名">
            <el-input 
              v-model="searchForm.studentName" 
              placeholder="请输入学生姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          
          <el-form-item label="手机号">
            <el-input 
              v-model="searchForm.phone" 
              placeholder="请输入手机号"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          
          <el-form-item label="学生等级">
            <el-select v-model="searchForm.studentLevel" placeholder="请选择" clearable>
              <el-option label="金牌" value="gold"></el-option>
              <el-option label="银牌" value="silver"></el-option>
              <el-option label="铜牌" value="bronze"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="学生状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="在读" :value="1"></el-option>
              <el-option label="暂停" :value="2"></el-option>
              <el-option label="毕业" :value="3"></el-option>
              <el-option label="禁用" :value="0"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="剩余课程">
            <el-input-number 
              v-model="searchForm.minRemainingCourses" 
              :min="0" 
              placeholder="最少"
              style="width: 120px"
            />
            <span style="margin: 0 10px">-</span>
            <el-input-number 
              v-model="searchForm.maxRemainingCourses" 
              :min="0" 
              placeholder="最多"
              style="width: 120px"
            />
          </el-form-item>
          
          <el-form-item label="地区">
            <el-select v-model="searchForm.province" placeholder="省份" clearable style="width: 120px">
              <el-option label="上海市" value="上海市"></el-option>
              <el-option label="北京市" value="北京市"></el-option>
              <el-option label="广东省" value="广东省"></el-option>
              <el-option label="江苏省" value="江苏省"></el-option>
              <el-option label="浙江省" value="浙江省"></el-option>
            </el-select>
            <el-select v-model="searchForm.city" placeholder="城市" clearable style="width: 120px; margin-left: 10px">
              <el-option label="上海市" value="上海市"></el-option>
              <el-option label="北京市" value="北京市"></el-option>
              <el-option label="深圳市" value="深圳市"></el-option>
              <el-option label="广州市" value="广州市"></el-option>
              <el-option label="南京市" value="南京市"></el-option>
              <el-option label="杭州市" value="杭州市"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮区域 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增学生</el-button>
          <el-button 
            type="success" 
            icon="el-icon-trophy" 
            :disabled="!hasSelection"
            @click="handleBatchUpgradeLevel"
          >
            批量升级等级
          </el-button>
          <el-button 
            type="warning" 
            icon="el-icon-message" 
            :disabled="!hasSelection"
            @click="handleBatchSendReminder"
          >
            批量发送提醒
          </el-button>
          <el-button 
            type="info" 
            icon="el-icon-refresh" 
            @click="handleAutoUpgrade"
          >
            自动等级升级
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-button-group>
            <el-button 
              :type="viewMode === 'all' ? 'primary' : 'default'"
              @click="switchViewMode('all')"
            >
              全部学生
            </el-button>
            <el-button 
              :type="viewMode === 'renewal' ? 'primary' : 'default'"
              @click="switchViewMode('renewal')"
            >
              续课提醒 <el-badge :value="urgentRenewalStudents + normalRenewalStudents" :hidden="urgentRenewalStudents + normalRenewalStudents === 0" />
            </el-button>
            <el-button 
              :type="viewMode === 'gold' ? 'primary' : 'default'"
              @click="switchViewMode('gold')"
            >
              金牌学生
            </el-button>
            <el-button 
              :type="viewMode === 'active' ? 'primary' : 'default'"
              @click="switchViewMode('active')"
            >
              活跃学生
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 学生列表表格 -->
      <div class="table-container">
        <el-table
          ref="studentTable"
          :data="studentList"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          
          <el-table-column label="学生信息" width="240" fixed="left">
            <template slot-scope="scope">
              <div class="student-info">
                <el-avatar :size="50" :src="scope.row.avatar">
                  {{ scope.row.studentName ? scope.row.studentName.charAt(0) : '' }}
                </el-avatar>
                <div class="student-details">
                  <div class="student-name">{{ scope.row.studentName }}</div>
                  <div class="student-no">{{ scope.row.studentNo }}</div>
                  <div class="student-phone">{{ scope.row.phone }}</div>
                  <div class="student-parent">家长：{{ scope.row.parentName }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="等级" width="100" align="center">
            <template slot-scope="scope">
              <el-tag 
                :type="getLevelTagType(scope.row.studentLevel)"
                size="medium"
              >
                <i :class="getLevelIcon(scope.row.studentLevel)"></i>
                {{ getStudentLevelText(scope.row.studentLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="grade" label="年级" width="80" align="center"></el-table-column>
          
          <el-table-column prop="school" label="学校" width="150" align="center"></el-table-column>
          
          <el-table-column label="地区" width="150" align="center">
            <template slot-scope="scope">
              {{ scope.row.province }} {{ scope.row.city }}
            </template>
          </el-table-column>
          
          <el-table-column label="剩余课程" width="100" align="center">
            <template slot-scope="scope">
              <span :class="getRemainingCoursesClass(scope.row.remainingCourses)">
                {{ scope.row.remainingCourses || 0 }}节
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="累计消费" width="120" align="center">
            <template slot-scope="scope">
              ¥{{ scope.row.totalAmount || 0 }}
            </template>
          </el-table-column>
          
          <el-table-column label="满意度" width="100" align="center">
            <template slot-scope="scope">
              <el-rate 
                :value="scope.row.satisfactionScore || 0" 
                disabled 
                show-score 
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag 
                :type="getStatusTagType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="最后上课" width="120" align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.lastCourseTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="续课提醒" width="100" align="center">
            <template slot-scope="scope">
              <el-tag 
                v-if="scope.row.renewalReminderSent === 1" 
                type="success" 
                size="mini"
              >
                已发送
              </el-tag>
              <el-tag 
                v-else-if="needsRenewalReminder(scope.row)" 
                type="warning" 
                size="mini"
              >
                待发送
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
              <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              
              <el-dropdown @command="(command) => handleDropdownCommand(command, scope.row)" trigger="click">
                <el-button size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="upgradeLevel">升级等级</el-dropdown-item>
                  <el-dropdown-item command="updateCourses">更新课程数</el-dropdown-item>
                  <el-dropdown-item 
                    v-if="needsRenewalReminder(scope.row)" 
                    command="sendReminder"
                  >
                    发送续课提醒
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="scope.row.renewalReminderSent === 1" 
                    command="resetReminder"
                  >
                    重置提醒状态
                  </el-dropdown-item>
                  <el-dropdown-item command="complaint">记录投诉</el-dropdown-item>
                  <el-dropdown-item command="referral">记录推荐</el-dropdown-item>
                  <el-dropdown-item command="changeStatus">修改状态</el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: #f56c6c">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <span class="pagination-info">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
          </span>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 等级升级对话框 -->
    <el-dialog title="学生等级升级" :visible.sync="levelDialogVisible" width="500px">
      <el-form :model="levelForm" label-width="100px">
        <el-form-item label="当前等级">
          <span>{{ getStudentLevelText(currentStudent.studentLevel) }}</span>
        </el-form-item>
        <el-form-item label="新等级">
          <el-select v-model="levelForm.studentLevel" placeholder="请选择新等级">
            <el-option label="金牌" value="gold"></el-option>
            <el-option label="银牌" value="silver"></el-option>
            <el-option label="铜牌" value="bronze"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="升级原因">
          <el-input 
            type="textarea" 
            v-model="levelForm.reason" 
            :rows="3"
            placeholder="请输入升级原因（选填）"
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLevelUpdate">确定</el-button>
      </div>
    </el-dialog>

    <!-- 课程数更新对话框 -->
    <el-dialog title="更新剩余课程数" :visible.sync="coursesDialogVisible" width="400px">
      <el-form :model="coursesForm" label-width="120px">
        <el-form-item label="当前剩余课程">
          <span>{{ currentStudent.remainingCourses || 0 }}节</span>
        </el-form-item>
        <el-form-item label="新剩余课程数">
          <el-input-number 
            v-model="coursesForm.remainingCourses" 
            :min="0" 
            :max="999"
          />
          <span style="margin-left: 10px">节</span>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="coursesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCoursesUpdate">确定</el-button>
      </div>
    </el-dialog>

    <!-- 续课提醒对话框 -->
    <el-dialog title="发送续课提醒" :visible.sync="reminderDialogVisible" width="500px">
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="提醒类型">
          <el-radio-group v-model="reminderForm.reminderType">
            <el-radio value="urgent">紧急提醒（≤5节）</el-radio>
            <el-radio value="normal">普通提醒（≤10节）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提醒内容">
          <el-input 
            type="textarea" 
            v-model="reminderForm.message" 
            :rows="4"
            placeholder="请输入提醒内容"
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="reminderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSendReminder">确定发送</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getStudentList, 
  getStudentStatistics,
  getUrgentRenewalStudents,
  getNormalRenewalStudents,
  getStudentsByLevel,
  getActiveStudents,
  updateStudentLevel,
  batchUpdateStudentLevel,
  updateRemainingCourses,
  sendRenewalReminder,
  resetRenewalReminderStatus,
  increaseComplaintCount,
  increaseReferralCount,
  updateStudentStatus,
  deleteStudent,
  autoUpgradeStudentLevels
} from '@/api/student'

export default {
  name: 'StudentManagement',
  data() {
    return {
      loading: false,
      viewMode: 'all', // all, renewal, gold, active
      searchForm: {
        studentName: '',
        phone: '',
        studentLevel: '',
        status: null,
        minRemainingCourses: null,
        maxRemainingCourses: null,
        province: '',
        city: ''
      },
      studentList: [],
      selectedStudents: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 统计数据
      totalStudents: 0,
      goldStudents: 0,
      silverStudents: 0,
      bronzeStudents: 0,
      urgentRenewalStudents: 0,
      normalRenewalStudents: 0,
      activeStudents: 0,
      
      // 对话框
      levelDialogVisible: false,
      levelForm: {
        studentId: null,
        studentLevel: '',
        reason: ''
      },
      
      coursesDialogVisible: false,
      coursesForm: {
        remainingCourses: 0
      },
      
      reminderDialogVisible: false,
      reminderForm: {
        reminderType: 'normal',
        message: ''
      },
      
      currentStudent: {}
    }
  },
  
  computed: {
    hasSelection() {
      return this.selectedStudents.length > 0
    }
  },
  
  mounted() {
    this.loadStudentList()
    this.loadStatistics()
  },
  
  methods: {
    async loadStudentList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 根据视图模式调整查询参数
        if (this.viewMode === 'renewal') {
          params.needsRenewalReminder = true
        } else if (this.viewMode === 'gold') {
          params.studentLevel = 'gold'
        }
        
        let response
        if (this.viewMode === 'active') {
          response = await getActiveStudents(30)
          // 手动分页处理
          const start = (this.currentPage - 1) * this.pageSize
          const end = start + this.pageSize
          this.studentList = response.data.slice(start, end)
          this.total = response.data.length
        } else {
          response = await getStudentList(params)
          if (response.code === 200) {
            this.studentList = response.data.list || []
            this.total = response.data.total || 0
          }
        }
      } catch (error) {
        this.$message.error('加载学生列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await getStudentStatistics()
        if (response.code === 200) {
          const stats = response.data
          this.totalStudents = stats.totalStudents || 0
          this.goldStudents = stats.goldStudents || 0
          this.silverStudents = stats.silverStudents || 0
          this.bronzeStudents = stats.bronzeStudents || 0
          this.urgentRenewalStudents = stats.urgentRenewalStudents || 0
          this.normalRenewalStudents = stats.normalRenewalStudents || 0
          this.activeStudents = stats.activeStudents || 0
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    handleSearch() {
      this.currentPage = 1
      this.loadStudentList()
    },
    
    resetSearch() {
      this.searchForm = {
        studentName: '',
        phone: '',
        studentLevel: '',
        status: null,
        minRemainingCourses: null,
        maxRemainingCourses: null,
        province: '',
        city: ''
      }
      this.handleSearch()
    },
    
    switchViewMode(mode) {
      this.viewMode = mode
      this.currentPage = 1
      this.loadStudentList()
    },
    
    handleSelectionChange(selection) {
      this.selectedStudents = selection
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.loadStudentList()
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadStudentList()
    },
    
    handleCreate() {
      this.$message.info('新增学生功能开发中...')
    },
    
    handleView(row) {
      this.$message.info(`查看学生详情：${row.studentName}`)
    },
    
    handleEdit(row) {
      this.$message.info(`编辑学生信息：${row.studentName}`)
    },
    
    // 批量升级等级
    handleBatchUpgradeLevel() {
      this.$prompt('请选择要升级到的等级', '批量等级升级', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'select',
        inputOptions: [
          { value: 'gold', label: '金牌' },
          { value: 'silver', label: '银牌' },
          { value: 'bronze', label: '铜牌' }
        ]
      }).then(async ({ value }) => {
        try {
          const studentIds = this.selectedStudents.map(s => s.id)
          const response = await batchUpdateStudentLevel({
            studentIds,
            studentLevel: value
          })
          
          if (response.code === 200) {
            this.$message.success('批量升级等级成功')
            this.loadStudentList()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error('批量升级等级失败')
          console.error(error)
        }
      })
    },
    
    // 批量发送提醒
    handleBatchSendReminder() {
      const reminderStudents = this.selectedStudents.filter(s => this.needsRenewalReminder(s))
      
      if (reminderStudents.length === 0) {
        this.$message.warning('选中的学生中没有需要发送续课提醒的')
        return
      }
      
      this.$confirm(`确定向选中的 ${reminderStudents.length} 位学生发送续课提醒吗？`, '确认批量发送提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const response = await sendRenewalReminder({
            studentIds: reminderStudents.map(s => s.id),
            reminderType: 'normal',
            message: '您的课程余量较少，建议提前续课。'
          })
          
          if (response.code === 200) {
            this.$message.success('批量发送续课提醒成功')
            this.loadStudentList()
          }
        } catch (error) {
          this.$message.error('批量发送续课提醒失败')
          console.error(error)
        }
      })
    },
    
    // 自动等级升级
    async handleAutoUpgrade() {
      this.$confirm('确定执行自动等级升级检查吗？', '确认自动升级', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const response = await autoUpgradeStudentLevels()
          if (response.code === 200) {
            this.$message.success('自动等级升级检查完成')
            this.loadStudentList()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error('自动等级升级失败')
          console.error(error)
        }
      })
    },
    
    // 下拉菜单操作
    handleDropdownCommand(command, row) {
      this.currentStudent = row
      
      switch (command) {
        case 'upgradeLevel':
          this.showLevelDialog(row)
          break
        case 'updateCourses':
          this.showCoursesDialog(row)
          break
        case 'sendReminder':
          this.showReminderDialog(row)
          break
        case 'resetReminder':
          this.handleResetReminder(row)
          break
        case 'complaint':
          this.handleComplaint(row)
          break
        case 'referral':
          this.handleReferral(row)
          break
        case 'changeStatus':
          this.handleChangeStatus(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    
    // 显示等级升级对话框
    showLevelDialog(row) {
      this.levelForm = {
        studentId: row.id,
        studentLevel: row.studentLevel,
        reason: ''
      }
      this.levelDialogVisible = true
    },
    
    // 提交等级更新
    async submitLevelUpdate() {
      try {
        const response = await updateStudentLevel(this.levelForm)
        if (response.code === 200) {
          this.$message.success('学生等级更新成功')
          this.levelDialogVisible = false
          this.loadStudentList()
          this.loadStatistics()
        }
      } catch (error) {
        this.$message.error('学生等级更新失败')
        console.error(error)
      }
    },
    
    // 显示课程数更新对话框
    showCoursesDialog(row) {
      this.coursesForm.remainingCourses = row.remainingCourses || 0
      this.coursesDialogVisible = true
    },
    
    // 提交课程数更新
    async submitCoursesUpdate() {
      try {
        const response = await updateRemainingCourses(
          this.currentStudent.id,
          this.coursesForm.remainingCourses
        )
        if (response.code === 200) {
          this.$message.success('剩余课程数更新成功')
          this.coursesDialogVisible = false
          this.loadStudentList()
        }
      } catch (error) {
        this.$message.error('剩余课程数更新失败')
        console.error(error)
      }
    },
    
    // 显示续课提醒对话框
    showReminderDialog(row) {
      const urgentThreshold = 5
      this.reminderForm = {
        reminderType: (row.remainingCourses || 0) <= urgentThreshold ? 'urgent' : 'normal',
        message: (row.remainingCourses || 0) <= urgentThreshold 
          ? '您的课程即将用完，剩余课程不足5节，请及时续课以确保学习连续性。'
          : '您的课程余量较少，剩余课程约10节左右，建议提前续课。'
      }
      this.reminderDialogVisible = true
    },
    
    // 提交发送提醒
    async submitSendReminder() {
      try {
        const response = await sendRenewalReminder({
          studentIds: [this.currentStudent.id],
          reminderType: this.reminderForm.reminderType,
          message: this.reminderForm.message
        })
        
        if (response.code === 200) {
          this.$message.success('续课提醒发送成功')
          this.reminderDialogVisible = false
          this.loadStudentList()
        }
      } catch (error) {
        this.$message.error('续课提醒发送失败')
        console.error(error)
      }
    },
    
    // 重置提醒状态
    async handleResetReminder(row) {
      try {
        const response = await resetRenewalReminderStatus(row.id)
        if (response.code === 200) {
          this.$message.success('续课提醒状态重置成功')
          this.loadStudentList()
        }
      } catch (error) {
        this.$message.error('续课提醒状态重置失败')
        console.error(error)
      }
    },
    
    // 记录投诉
    async handleComplaint(row) {
      this.$confirm(`确定为学生"${row.studentName}"记录一次投诉吗？`, '确认记录投诉', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await increaseComplaintCount(row.id)
          if (response.code === 200) {
            this.$message.success('投诉记录成功')
            this.loadStudentList()
          }
        } catch (error) {
          this.$message.error('投诉记录失败')
          console.error(error)
        }
      })
    },
    
    // 记录推荐
    async handleReferral(row) {
      this.$confirm(`确定为学生"${row.studentName}"记录一次推荐吗？`, '确认记录推荐', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(async () => {
        try {
          const response = await increaseReferralCount(row.id)
          if (response.code === 200) {
            this.$message.success('推荐记录成功')
            this.loadStudentList()
          }
        } catch (error) {
          this.$message.error('推荐记录失败')
          console.error(error)
        }
      })
    },
    
    // 修改状态
    handleChangeStatus(row) {
      this.$prompt('请选择新状态', '修改学生状态', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'select',
        inputOptions: [
          { value: 1, label: '在读' },
          { value: 2, label: '暂停' },
          { value: 3, label: '毕业' },
          { value: 0, label: '禁用' }
        ]
      }).then(async ({ value }) => {
        try {
          const response = await updateStudentStatus(row.id, parseInt(value))
          if (response.code === 200) {
            this.$message.success('学生状态更新成功')
            this.loadStudentList()
          }
        } catch (error) {
          this.$message.error('学生状态更新失败')
          console.error(error)
        }
      })
    },
    
    // 删除学生
    handleDelete(row) {
      this.$confirm(`确定删除学生"${row.studentName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteStudent(row.id)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.loadStudentList()
          }
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      })
    },
    
    // 工具方法
    getLevelTagType(level) {
      const typeMap = {
        'gold': 'danger',
        'silver': 'warning',
        'bronze': 'success'
      }
      return typeMap[level] || 'info'
    },
    
    getLevelIcon(level) {
      const iconMap = {
        'gold': 'el-icon-trophy',
        'silver': 'el-icon-medal',
        'bronze': 'el-icon-medal-1'
      }
      return iconMap[level] || 'el-icon-medal-1'
    },
    
    getStudentLevelText(level) {
      const textMap = {
        'gold': '金牌',
        'silver': '银牌',
        'bronze': '铜牌'
      }
      return textMap[level] || '铜牌'
    },
    
    getStatusTagType(status) {
      const typeMap = {
        1: 'success',
        2: 'warning',
        3: 'info',
        0: 'danger'
      }
      return typeMap[status] || 'info'
    },
    
    getStatusText(status) {
      const textMap = {
        1: '在读',
        2: '暂停',
        3: '毕业',
        0: '禁用'
      }
      return textMap[status] || '未知'
    },
    
    getRemainingCoursesClass(courses) {
      if (courses <= 5) return 'courses-urgent'
      if (courses <= 10) return 'courses-warning'
      return 'courses-normal'
    },
    
    needsRenewalReminder(student) {
      const remaining = student.remainingCourses || 0
      return remaining <= 10 && remaining > 0 && student.renewalReminderSent === 0
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString()
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
    
    &.total {
      .stat-icon { background: #409eff; }
      .stat-value { color: #409eff; }
    }
    
    &.gold {
      .stat-icon { background: #f56c6c; }
      .stat-value { color: #f56c6c; }
    }
    
    &.silver {
      .stat-icon { background: #e6a23c; }
      .stat-value { color: #e6a23c; }
    }
    
    &.bronze {
      .stat-icon { background: #67c23a; }
      .stat-value { color: #67c23a; }
    }
    
    &.urgent {
      .stat-icon { background: #f56c6c; }
      .stat-value { color: #f56c6c; }
    }
    
    &.active {
      .stat-icon { background: #67c23a; }
      .stat-value { color: #67c23a; }
    }
  }
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  
  .search-form {
    .el-form-item {
      margin-bottom: 10px;
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
  .student-info {
    display: flex;
    align-items: center;
    
    .student-details {
      margin-left: 12px;
      
      .student-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .student-no, .student-phone, .student-parent {
        font-size: 12px;
        color: #909399;
        margin-bottom: 2px;
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .pagination-info {
      color: #606266;
      font-size: 14px;
    }
  }
}

.courses-urgent {
  color: #f56c6c;
  font-weight: bold;
}

.courses-warning {
  color: #e6a23c;
  font-weight: bold;
}

.courses-normal {
  color: #67c23a;
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