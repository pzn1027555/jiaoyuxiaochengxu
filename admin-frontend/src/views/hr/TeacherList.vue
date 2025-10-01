<template>
  <div class="page-container">
    <div class="content-box">
      <h2>教师管理</h2>
      
      <!-- 搜索筛选区域 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="教师姓名">
            <el-input 
              v-model="searchForm.teacherName" 
              placeholder="请输入教师姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          
          <!-- 审核状态筛选取消 -->
          
          <el-form-item label="教师等级">
            <el-select v-model="searchForm.teacherLevel" placeholder="请选择" clearable>
              <el-option label="初级" value="junior"></el-option>
              <el-option label="中级" value="intermediate"></el-option>
              <el-option label="高级" value="senior"></el-option>
              <el-option label="专家" value="expert"></el-option>
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
        <div class="toolbar-left"></div>
        
        <div class="toolbar-right">
          <el-button-group>
            <el-button 
              :type="viewMode === 'all' ? 'primary' : 'default'"
              @click="switchViewMode('all')"
            >
              全部教师
            </el-button>
            <el-button 
              :type="viewMode === 'risk' ? 'primary' : 'default'"
              @click="switchViewMode('risk')"
              class="risk-btn"
            >
              风险教师
              <div v-if="riskCount>0" class="corner-badge">{{ riskCount }}</div>
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 教师列表表格 -->
      <div class="table-container">
        <el-table
          ref="teacherTable"
          :data="teacherList"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
        >
          
          
          <el-table-column label="教师信息" width="220" fixed="left">
            <template slot-scope="scope">
              <div class="teacher-info">
                <el-avatar :size="40" :src="scope.row.avatar">
                  {{ scope.row.teacherName ? scope.row.teacherName.charAt(0) : '' }}
                </el-avatar>
                <div class="teacher-details">
              <div class="teacher-name">{{ scope.row.teacherName }}</div>
                  <div class="teacher-phone">{{ scope.row.phone }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="学历" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.certEducation || scope.row.education || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column label="院校" width="160" align="center">
            <template slot-scope="scope">
              {{ scope.row.certGraduateSchool || scope.row.graduationSchool || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column label="教授科目" width="150" align="center">
            <template slot-scope="scope">
              <el-tag 
                v-for="subject in getSubjectNames(scope.row)" 
                :key="subject" 
                size="mini" 
                style="margin: 2px"
              >
                {{ subject }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="等级" width="80" align="center">
            <template slot-scope="scope">
              <el-tag 
                :type="getLevelTagType(scope.row.teacherLevel)"
                size="small"
              >
                {{ getTeacherLevelText(scope.row.teacherLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="hourlyRate" label="课时费" width="100" align="center">
            <template slot-scope="scope">
              ¥{{ scope.row.hourlyRate }}
            </template>
          </el-table-column>
          
          <el-table-column label="星级评分" width="120" align="center">
            <template slot-scope="scope">
              <el-rate 
                :value="scope.row.starRating || 0" 
                disabled 
                show-score 
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          
          <!-- 审核状态列移除 -->
          
          <el-table-column label="合同状态" width="110" align="center">
            <template slot-scope="scope">
              <el-tag 
                :type="getContractStatusTagType(scope.row.contractStatus)"
                size="small"
              >
                {{ getContractStatusText(scope.row.contractStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="投诉率" width="90" align="center">
            <template slot-scope="scope">
              <span :class="getComplaintRateClass(scope.row.complaintRate)">
                {{ scope.row.complaintRate || 0 }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="checkCount" label="抽查次数" width="90" align="center">
            <template slot-scope="scope">
              {{ scope.row.checkCount || 0 }}
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.isHidden === 1" type="danger" size="mini">雪藏</el-tag>
              <el-tag v-if="scope.row.isRecommended === 1" type="success" size="mini">推荐</el-tag>
              <span v-if="scope.row.isHidden === 0 && scope.row.isRecommended === 0">正常</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="320" fixed="right" align="center">
            <template slot-scope="scope">
              <div class="action-buttons">
          <el-button
            v-for="(action, idx) in getAvailableActions(scope.row).slice(0, 2)"
                  :key="action.command"
                  size="mini"
                  type="primary"
                  @click="handleDropdownCommand(action.command, scope.row)"
                  style="margin-right:6px"
                >
                  {{ action.label }}
                </el-button>
                <el-dropdown
                  v-if="getAvailableActions(scope.row).length > 2"
                  @command="(command) => handleDropdownCommand(command, scope.row)"
                  trigger="click"
                >
                  <el-button size="mini" type="default">
                    更多<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="action in getAvailableActions(scope.row).slice(2)"
                      :key="action.command"
                      :command="action.command"
                      :style="action.command === 'delete' ? 'color:#f56c6c' : ''"
                    >
                      {{ action.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
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

    <!-- 磨课安排对话框 -->
    <el-dialog title="磨课安排" :visible.sync="moocDialogVisible" width="520px">
      <el-form :model="arrangeForm" label-width="100px">
        <el-form-item label="派遣老师">
          <el-select v-model="arrangeForm.selectedTeacherIds" multiple placeholder="请选择老师" filterable style="width:100%">
            <el-option v-for="t in teacherOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="安排时间">
          <el-date-picker v-model="arrangeForm.scheduleTime" type="datetime" placeholder="选择日期时间" style="width:100%" />
        </el-form-item>
        <el-form-item label="群二维码">
          <el-upload :http-request="uploadQrcode" :show-file-list="false" accept="image/*">
            <el-button size="mini" type="primary">上传二维码</el-button>
          </el-upload>
          <div v-if="arrangeForm.qrcodeUrl" style="margin-top:8px">
            <el-image :src="normalizeUploadUrl(arrangeForm.qrcodeUrl)" style="width:120px;height:120px" fit="contain" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moocDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMoocAudit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 评级对话框 -->
    <el-dialog title="调整教师评级" :visible.sync="gradeDialogVisible" width="420px">
      <el-form :model="gradeForm" label-width="100px">
        <el-form-item label="教师等级">
          <el-select v-model="gradeForm.teacherLevel" placeholder="请选择等级">
            <el-option label="初级" value="junior"></el-option>
            <el-option label="中级" value="intermediate"></el-option>
            <el-option label="高级" value="senior"></el-option>
            <el-option label="专家" value="expert"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input type="textarea" v-model="gradeForm.reason" :rows="3" placeholder="调整说明（选填）" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade">确定</el-button>
      </div>
    </el-dialog>

  <!-- 编辑教师对话框 -->
  <el-dialog title="编辑教师" :visible.sync="editDialogVisible" width="520px">
    <el-form :model="editForm" label-width="100px">
      <el-form-item label="姓名">
        <el-input v-model="editForm.teacherName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="editForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="教师等级">
        <el-select v-model="editForm.teacherLevel" placeholder="请选择等级">
          <el-option label="初级" value="junior" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="senior" />
          <el-option label="专家" value="expert" />
        </el-select>
      </el-form-item>
      <el-form-item label="课时费(¥)">
        <el-input v-model.number="editForm.hourlyRate" type="number" min="0" placeholder="请输入课时费" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible=false">取消</el-button>
      <el-button type="primary" @click="submitEdit">保存</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import { 
  getTeacherList, 
  getRiskTeachers,
  auditTeacher,
  batchOperation,
  sendContract,
  increaseCheckCount,
  toggleHidden,
  toggleRecommend,
  adjustCommissionRate,
  deleteTeacher,
  getMoocApplications,
  auditMoocApplication,
  getMoocGroups,
  updateTeacher
 } from '@/api/teacher'
import request from '@/utils/request'

export default {
  name: 'TeacherList',
  data() {
    return {
      loading: false,
      viewMode: 'all', // all, risk
      searchForm: {
        teacherName: '',
        teacherLevel: ''
      },
      teacherList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      riskCount: 0,
      
      // 审核对话框
      auditDialogVisible: false,
      auditForm: {
        teacherId: null,
        auditStatus: 1,
        teacherLevel: 'junior',
        commissionRate: 15.0,
        auditReason: ''
      },
      // 磨课安排
      moocDialogVisible: false,
      moocForm: {
        applicationId: null,
        teacherId: null,
        groupId: null,
        status: 1,
        auditReason: ''
      },
      arrangeForm: {
        applicationId: null,
        selectedTeacherIds: [],
        scheduleTime: '',
        qrcodeUrl: '',
        groupName: ''
      },
      teacherOptions: [],
      moocGroups: [],
      // 调整评级
      gradeDialogVisible: false,
      gradeForm: {
        teacherId: null,
        teacherLevel: 'junior',
        reason: ''
      },
      // 编辑教师
      editDialogVisible: false,
      editForm: {
        id: null,
        teacherName: '',
        phone: '',
        teacherLevel: 'junior',
        hourlyRate: null
      }
    }
  },
  
  computed: {},
  
  mounted() {
    this.loadTeacherList()
    this.loadStatistics()
  },
  
  methods: {
    getSubjectNames(row) {
      if (!row) return []
      if (row.subjectsMap && typeof row.subjectsMap === 'object') {
        return Object.values(row.subjectsMap)
      }
      if (Array.isArray(row.subjectsNameList)) {
        return row.subjectsNameList
      }
      if (Array.isArray(row.subjects)) {
        return row.subjects
      }
      return []
    },
    normalizeUploadUrl(url) {
      if (!url) return ''
      // 已经是完整URL则直接返回
      if (/^https?:\/\//.test(url)) return url
      // 兼容以 /uploads/ 或 uploads/ 开头的相对路径
      const path = url.startsWith('/') ? url : `/${url}`
      // 后端 StaticResourceConfig 暴露了 /api/uploads/**
      const base = process.env.VUE_APP_BASE_API || '/api'
      if (path.startsWith('/uploads/')) return `${base}${path}`
      return `${base}${path}`
    },
    getAvailableActions(row) {
      const actions = []
      actions.push({ command: 'edit', label: '编辑' })
      if (row.hasMoocApply) actions.push({ command: 'mooc', label: '磨课安排' })
      actions.push({ command: 'grade', label: '调整教师评级' })
      if (row.contractStatus === 0) actions.push({ command: 'sendContract', label: '发送合同' })
      if ((row.checkCount || 0) < 3) actions.push({ command: 'check', label: '抽查' })
      actions.push({ command: row.isHidden === 1 ? 'unHide' : 'hide', label: row.isHidden === 1 ? '解除雪藏' : '雪藏' })
      actions.push({ command: row.isRecommended === 1 ? 'unRecommend' : 'recommend', label: row.isRecommended === 1 ? '取消推荐' : '设为推荐' })
      actions.push({ command: 'delete', label: '删除' })
      return actions
    },
    // 上传二维码
    async uploadQrcode({ file, onSuccess, onError }) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await request({ url: '/mini/upload/file', method: 'post', data: formData })
        if (res.code === 200) {
          const url = (res.data && (res.data.url || res.data.coverUrl)) || ''
          this.arrangeForm.qrcodeUrl = url
          onSuccess && onSuccess(res)
        } else { onError && onError(new Error(res.message || '上传失败')) }
      } catch (e) { onError && onError(e) }
    },
    // 打开磨课安排对话框
    async openMoocDialog(row) {
      this.moocForm = { applicationId: null, teacherId: row.id, groupId: null, status: 1, auditReason: '' }
      this.arrangeForm = { applicationId: null, selectedTeacherIds: [], scheduleTime: '', qrcodeUrl: '', groupName: `${row.teacherName}磨课` }
      try {
        const [appsRes, groupsRes] = await Promise.all([
          getMoocApplications({ teacherId: row.id, status: 0 }),
          getMoocGroups()
        ])
        if (appsRes.code === 200 && (appsRes.data || []).length) {
          this.moocForm.applicationId = appsRes.data[0].id
          this.arrangeForm.applicationId = appsRes.data[0].id
        }
        if (groupsRes.code === 200) {
          this.moocGroups = groupsRes.data || []
        }
        // 加载可选教师（简单复用当前页数据）
        this.teacherOptions = (this.teacherList || []).map(t=>({ label: t.teacherName, value: t.id }))
      } catch (e) {}
      this.moocDialogVisible = true
    },

    // 提交磨课安排
    async submitMoocAudit() {
      if (!this.moocForm.applicationId) { this.$message.error('未找到待审核的磨课申请'); return }
      if (!this.arrangeForm.selectedTeacherIds.length) { this.$message.error('请选择派遣老师'); return }
      if (!this.arrangeForm.scheduleTime) { this.$message.error('请选择安排时间'); return }
      if (!this.arrangeForm.qrcodeUrl) { this.$message.error('请上传群二维码'); return }
      try {
        const payload = {
          applicationId: this.arrangeForm.applicationId,
          groupName: this.arrangeForm.groupName,
          dispatchTeachers: JSON.stringify(this.arrangeForm.selectedTeacherIds),
          scheduleTime: this.arrangeForm.scheduleTime,
          qrcodeUrl: this.arrangeForm.qrcodeUrl,
          creatorUserId: 0
        }
        const res = await request({ url: '/mooc/arrange', method: 'post', data: payload })
        if (res.code === 200) {
          this.$message.success('已安排磨课并通过申请')
          this.moocDialogVisible = false
          this.loadTeacherList()
        }
      } catch (e) {
        this.$message.error('安排失败')
      }
    },

    async loadTeacherList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 视图模式
        if (this.viewMode === 'risk') {
          params.risk = 1
        }
        
        const response = await getTeacherList(params)
        if (response.code === 200) {
          this.teacherList = response.data.list || []
          this.total = response.data.total || 0
        }
      } catch (error) {
        this.$message.error('加载教师列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const riskResponse = await getRiskTeachers()
        if (riskResponse.code === 200) {
          this.riskCount = riskResponse.data.length
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    handleSearch() {
      this.currentPage = 1
      this.loadTeacherList()
    },
    
    resetSearch() {
      this.searchForm = {
        teacherName: '',
        teacherLevel: ''
      }
      this.handleSearch()
    },
    
    switchViewMode(mode) {
      this.viewMode = mode
      this.currentPage = 1
      this.loadTeacherList()
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.loadTeacherList()
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadTeacherList()
    },
    
    // 下拉菜单操作
    handleDropdownCommand(command, row) {
      switch (command) {
        case 'edit':
          this.openEditDialog(row)
          break
        case 'mooc':
          this.openMoocDialog(row)
          break
        case 'sendContract':
          this.handleSendContract(row)
          break
        case 'grade':
          this.openGradeDialog(row)
          break
        case 'check':
          this.handleCheck(row)
          break
        case 'hide':
        case 'unHide':
          this.handleToggleHidden(row)
          break
        case 'recommend':
        case 'unRecommend':
          this.handleToggleRecommend(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },

    openGradeDialog(row) {
      this.gradeForm = { teacherId: row.id, teacherLevel: row.teacherLevel || 'junior', reason: '' }
      this.gradeDialogVisible = true
    },
    openEditDialog(row) {
      this.editForm = {
        id: row.id,
        teacherName: row.teacherName || '',
        phone: row.phone || '',
        teacherLevel: row.teacherLevel || 'junior',
        hourlyRate: row.hourlyRate || null
      }
      this.editDialogVisible = true
    },
    async submitEdit() {
      try {
        const { id, teacherName, phone, teacherLevel, hourlyRate } = this.editForm
        await updateTeacher(id, { teacherName, phone, teacherLevel, hourlyRate })
        this.$message.success('保存成功')
        this.editDialogVisible = false
        this.loadTeacherList()
      } catch (e) {
        this.$message.error('保存失败')
      }
    },

    async submitGrade() {
      try {
        const level = this.gradeForm.teacherLevel
        // 直接更新教师等级
        await request({ url: `/teacher/${this.gradeForm.teacherId}`, method: 'put', data: { teacherLevel: level } })
        this.$message.success('调整成功')
        this.gradeDialogVisible = false
        this.loadTeacherList()
      } catch (e) {
        this.$message.error('调整失败')
      }
    },

    // 发送合同
    async handleSendContract(row) {
      try {
        const response = await sendContract(row.id)
        if (response.code === 200) {
          this.$message.success('合同发送成功')
          this.loadTeacherList()
        }
      } catch (error) {
        this.$message.error('合同发送失败')
        console.error(error)
      }
    },
    
    // 切换雪藏状态
    async handleToggleHidden(row) {
      try {
        const response = await toggleHidden(row.id)
        if (response.code === 200) {
          this.$message.success('操作成功')
          this.loadTeacherList()
        }
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },

    // 切换推荐状态
    async handleToggleRecommend(row) {
      try {
        const response = await toggleRecommend(row.id)
        if (response.code === 200) {
          this.$message.success('操作成功')
          this.loadTeacherList()
        }
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },

    // 抽查
    async handleCheck(row) {
      try {
        await this.$confirm('确认对该教师进行一次抽查？', '提示', { type: 'warning' })
        const response = await increaseCheckCount(row.id)
        if (response.code === 200) {
          this.$message.success('抽查次数增加成功')
          this.loadTeacherList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
          console.error(error)
        }
      }
    },

    // 删除教师
    handleDelete(row) {
      this.$confirm(`确定删除教师"${row.teacherName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteTeacher(row.id)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.loadTeacherList()
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
        'junior': '',
        'intermediate': 'success',
        'senior': 'warning',
        'expert': 'danger'
      }
      return typeMap[level] || ''
    },
    
    getTeacherLevelText(level) {
      const textMap = {
        'junior': '初级',
        'intermediate': '中级',
        'senior': '高级',
        'expert': '专家'
      }
      return textMap[level] || '初级'
    },
    
    getContractStatusTagType(status) {
      const typeMap = {
        0: 'info',
        1: 'warning',
        2: 'success',
        3: 'danger'
      }
      return typeMap[status] || ''
    },
    
    getContractStatusText(status) {
      const textMap = {
        0: '未发送',
        1: '已发送待签',
        2: '已签署',
        3: '已过期'
      }
      return textMap[status] || '未知'
    },
    
    getComplaintRateClass(rate) {
      if (rate >= 5) return 'complaint-rate-high'
      if (rate >= 2) return 'complaint-rate-medium'
      return 'complaint-rate-low'
    }
  }
}
</script>

<style lang="scss" scoped>
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
  
  .risk-btn {
    position: relative;
  }
  .corner-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: #f56c6c;
    color: #fff;
    border-radius: 9px;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    box-shadow: 0 0 0 2px #fff;
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
      
      .teacher-no {
        font-size: 12px;
        color: #909399;
        margin-bottom: 2px;
      }
      
      .teacher-phone {
        font-size: 12px;
        color: #606266;
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

.complaint-rate-high {
  color: #f56c6c;
  font-weight: bold;
}

.complaint-rate-medium {
  color: #e6a23c;
}

.complaint-rate-low {
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