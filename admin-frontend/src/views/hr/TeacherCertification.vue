<template>
  <div class="teacher-certification">
    <!-- 顶部筛选 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="教师姓名">
          <el-input 
            v-model="queryParams.teacherName" 
            placeholder="请输入教师姓名" 
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input 
            v-model="queryParams.realName" 
            placeholder="请输入真实姓名" 
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select 
            v-model="queryParams.certificationStatus" 
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核拒绝" :value="2" />
            <el-option label="待面试" :value="3" />
            <el-option label="面试通过" :value="4" />
            <el-option label="面试不通过" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <i class="el-icon-search"></i>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="certificationList" 
      border
      style="width: 100%"
    >
      <el-table-column prop="teacherName" label="教师姓名" width="120" />
      <el-table-column prop="teacherPhone" label="手机号" width="130" />
      <el-table-column prop="realName" label="真实姓名" width="120" />
      <el-table-column prop="genderText" label="性别" width="80" />
      <el-table-column prop="graduateSchool" label="毕业院校" width="180" show-overflow-tooltip />
      <el-table-column prop="education" label="学历" width="80" />
      <el-table-column prop="certificationStatusText" label="认证状态" width="100">
        <template slot-scope="scope">
          <el-tag 
            :type="getStatusTagType(scope.row.certificationStatus)"
            size="small"
          >
            {{ scope.row.certificationStatusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="160">
        <template slot-scope="scope">
          {{ formatDate(scope.row.submitTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="auditTime" label="审核时间" width="160">
        <template slot-scope="scope">
          {{ formatDate(scope.row.auditTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button 
            type="primary" 
            size="mini" 
            @click="handleDetail(scope.row)"
          >
            查看详情
          </el-button>
          <el-button 
            v-if="scope.row.certificationStatus === 0"
            type="success" 
            size="mini" 
            @click="handleAudit(scope.row)"
          >
            审核
          </el-button>
          <el-button 
            v-if="scope.row.certificationStatus === 3"
            type="warning" 
            size="mini" 
            @click="handleGrade(scope.row)"
          >
            评级
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- 认证详情弹窗 -->
    <el-dialog 
      title="认证详情" 
      :visible.sync="detailDialogVisible" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentCertification" class="certification-detail">
        <!-- 基本信息 -->
        <el-card class="box-card" style="margin-bottom: 20px;">
          <div slot="header" class="clearfix">
            <span>基本信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">教师姓名：</span>
                <span>{{ currentCertification.teacherName }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">手机号：</span>
                <span>{{ currentCertification.teacherPhone }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">认证状态：</span>
                <el-tag :type="getStatusTagType(currentCertification.certificationStatus)">
                  {{ currentCertification.certificationStatusText }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">真实姓名：</span>
                <span>{{ currentCertification.realName }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">性别：</span>
                <span>{{ currentCertification.genderText }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">毕业院校：</span>
                <span>{{ currentCertification.graduateSchool }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">学历：</span>
                <span>{{ currentCertification.education }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">银行卡号：</span>
                <span>{{ formatBankCard(currentCertification.bankCard) }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 证件照片 -->
        <el-card class="box-card" style="margin-bottom: 20px;">
          <div slot="header" class="clearfix">
            <span>身份证件</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="cert-image">
                <p>身份证人像面</p>
                <el-image 
                  v-if="currentCertification.idCardFront"
                  :src="currentCertification.idCardFront" 
                  style="width: 300px; height: 200px"
                  fit="contain"
                  :preview-src-list="[currentCertification.idCardFront]"
                />
                <div v-else class="no-image">暂无图片</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="cert-image">
                <p>身份证国徽面</p>
                <el-image 
                  v-if="currentCertification.idCardBack"
                  :src="currentCertification.idCardBack" 
                  style="width: 300px; height: 200px"
                  fit="contain"
                  :preview-src-list="[currentCertification.idCardBack]"
                />
                <div v-else class="no-image">暂无图片</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 学历证明 -->
        <el-card class="box-card" style="margin-bottom: 20px;">
          <div slot="header" class="clearfix">
            <span>学历证明</span>
          </div>
          <div class="diploma-images">
            <div 
              v-for="(cert, index) in currentCertification.diplomaCerts" 
              :key="index"
              class="diploma-item"
            >
              <el-image 
                :src="cert" 
                style="width: 200px; height: 150px"
                fit="contain"
                :preview-src-list="currentCertification.diplomaCerts"
              />
            </div>
            <div v-if="!currentCertification.diplomaCerts || currentCertification.diplomaCerts.length === 0" class="no-image">
              暂无学历证明
            </div>
          </div>
        </el-card>

        <!-- 资格证书 -->
        <el-card class="box-card" style="margin-bottom: 20px;">
          <div slot="header" class="clearfix">
            <span>资格证书</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="cert-image">
                <p>教师资格证</p>
                <el-image 
                  v-if="currentCertification.teacherCert"
                  :src="currentCertification.teacherCert" 
                  style="width: 250px; height: 180px"
                  fit="contain"
                  :preview-src-list="[currentCertification.teacherCert]"
                />
                <div v-else class="no-image">暂无图片</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="cert-image">
                <p>获奖认证</p>
                <el-image 
                  v-if="currentCertification.awardCert"
                  :src="currentCertification.awardCert" 
                  style="width: 250px; height: 180px"
                  fit="contain"
                  :preview-src-list="[currentCertification.awardCert]"
                />
                <div v-else class="no-image">暂无图片</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 审核信息 -->
        <el-card v-if="currentCertification.auditTime" class="box-card">
          <div slot="header" class="clearfix">
            <span>审核信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">审核人：</span>
                <span>{{ currentCertification.auditUserName }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">审核时间：</span>
                <span>{{ formatDate(currentCertification.auditTime) }}</span>
              </div>
            </el-col>
            <el-col :span="24" style="margin-top: 10px;">
              <div class="detail-item">
                <span class="label">审核意见：</span>
                <p style="margin-top: 5px;">{{ currentCertification.auditReason || '无' }}</p>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog 
      title="审核认证" 
      :visible.sync="auditDialogVisible" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="auditForm" :rules="auditRules" ref="auditForm" label-width="100px">
        <el-form-item label="审核结果" prop="certificationStatus">
          <el-radio-group v-model="auditForm.certificationStatus">
            <el-radio :label="3">安排面试</el-radio>
            <el-radio :label="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          v-if="auditForm.certificationStatus === 3" 
          label="面试时间" 
          prop="interviewTime"
        >
          <el-date-picker
            v-model="auditForm.interviewTime"
            type="datetime"
            placeholder="选择面试时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="审核意见" prop="auditReason">
          <el-input 
            v-model="auditForm.auditReason" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="auditLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 教师评级弹窗 -->
    <el-dialog 
      title="教师等级评定" 
      :visible.sync="gradeDialogVisible" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="gradeForm" :rules="gradeRules" ref="gradeForm" label-width="100px">
        <el-form-item label="教师等级" prop="teacherLevel">
          <el-select v-model="gradeForm.teacherLevel" style="width: 100%">
            <el-option label="初级教师" value="junior" />
            <el-option label="中级教师" value="intermediate" />
            <el-option label="高级教师" value="senior" />
            <el-option label="专家教师" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item label="评级说明">
          <el-input 
            v-model="gradeForm.gradeReason" 
            type="textarea" 
            :rows="4"
            placeholder="请输入评级说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getCertificationList, 
  getCertificationDetail, 
  auditCertification,
  gradeTeacher
} from '@/api/teacherCertification'

export default {
  name: 'TeacherCertification',
  data() {
    return {
      loading: false,
      certificationList: [],
      total: 0,
      queryParams: {
        page: 1,
        size: 10,
        teacherName: '',
        realName: '',
        certificationStatus: null
      },
      detailDialogVisible: false,
      currentCertification: null,
      auditDialogVisible: false,
      auditLoading: false,
      auditForm: {
        id: null,
        certificationStatus: 3,
        auditReason: '',
        interviewTime: null
      },
      auditRules: {
        certificationStatus: [
          { required: true, message: '请选择审核结果', trigger: 'change' }
        ],
        interviewTime: [
          { required: true, message: '请选择面试时间', trigger: 'change' }
        ]
      },
      gradeDialogVisible: false,
      gradeForm: {
        id: null,
        teacherLevel: 'junior',
        gradeReason: ''
      },
      gradeRules: {
        teacherLevel: [
          { required: true, message: '请选择教师等级', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表
    async getList() {
      this.loading = true
      try {
        const response = await getCertificationList(this.queryParams)
        if (response.success) {
          this.certificationList = response.data.list || []
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取认证列表失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },

    // 重置
    resetQuery() {
      this.queryParams = {
        page: 1,
        size: 10,
        teacherName: '',
        realName: '',
        certificationStatus: null
      }
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },

    // 查看详情
    async handleDetail(row) {
      try {
        const response = await getCertificationDetail(row.id)
        if (response.success) {
          const base = process.env.VUE_APP_FILE_BASE || process.env.VUE_APP_BASE_API || ''
          this.currentCertification = this.transformCertification(response.data, base)
          this.detailDialogVisible = true
        } else {
          this.$message.error(response.message || '获取详情失败')
        }
      } catch (error) {
        console.error('获取认证详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 审核
    handleAudit(row) {
      this.auditForm = {
        id: row.id,
        certificationStatus: 3,
        auditReason: '',
        interviewTime: null
      }
      this.auditDialogVisible = true
    },

    // 提交审核
    async submitAudit() {
      this.$refs.auditForm.validate(async (valid) => {
        if (valid) {
          this.auditLoading = true
          try {
            const response = await auditCertification(this.auditForm)
            if (response.success) {
              this.$message.success('审核成功')
              this.auditDialogVisible = false
              this.getList()
            } else {
              this.$message.error(response.message || '审核失败')
            }
          } catch (error) {
            console.error('审核失败:', error)
            this.$message.error('审核失败')
          } finally {
            this.auditLoading = false
          }
        }
      })
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const typeMap = {
        0: 'warning',  // 待审核
        1: 'success',  // 审核通过
        2: 'danger',   // 审核拒绝
        3: 'info',     // 待面试
        4: 'success',  // 面试通过
        5: 'danger'    // 面试不通过
      }
      return typeMap[status] || 'info'
    },

    // 转换图片链接等数据
    transformCertification(raw, baseUrl) {
      if (!raw) return null
      const parseJsonArray = (val) => {
        if (!val) return []
        if (Array.isArray(val)) return val
        try {
          const parsed = JSON.parse(val)
          return Array.isArray(parsed) ? parsed : []
        } catch (e) {
          console.warn('解析图片列表失败:', val, e)
          return []
        }
      }

      const normalizeUrl = (url) => {
        if (!url) return ''
        if (/^https?:/i.test(url)) return url
        return `${baseUrl}${url}`
      }

      const detail = { ...raw }
      const diploma = parseJsonArray(raw.diplomaCerts).map(normalizeUrl)
      const teacher = parseJsonArray(raw.teacherCerts).map(normalizeUrl)
      const award = parseJsonArray(raw.awardCerts).map(normalizeUrl)

      detail.diplomaCerts = diploma
      detail.teacherCerts = teacher
      detail.awardCerts = award
      detail.idCardFront = normalizeUrl(raw.idCardFront)
      detail.idCardBack = normalizeUrl(raw.idCardBack)
      detail.teacherCert = teacher.length ? teacher[0] : ''
      detail.awardCert = award.length ? award[0] : ''
      return detail
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('zh-CN')
    },

    // 格式化银行卡号
    formatBankCard(cardNumber) {
      if (!cardNumber) return '-'
      return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
    },

    // 教师评级
    handleGrade(row) {
      this.gradeForm = {
        id: row.id,
        teacherLevel: 'junior',
        gradeReason: ''
      }
      this.gradeDialogVisible = true
    },

    // 提交评级
    async submitGrade() {
      this.$refs.gradeForm.validate(async (valid) => {
        if (valid) {
          try {
            const response = await gradeTeacher(this.gradeForm)
            if (response.code === 200) {
              this.$message.success('评级成功')
              this.gradeDialogVisible = false
              this.getList()
            } else {
              this.$message.error(response.message || '评级失败')
            }
          } catch (error) {
            console.error('评级失败:', error)
            this.$message.error('评级失败')
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.teacher-certification {
  padding: 20px;
}

.filter-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination-container {
  background: #fff;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
}

.certification-detail .detail-item {
  margin-bottom: 15px;
}

.certification-detail .label {
  font-weight: bold;
  color: #333;
}

.cert-image {
  text-align: center;
}

.cert-image p {
  margin-bottom: 10px;
  font-weight: bold;
}

.no-image {
  width: 250px;
  height: 180px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 1px dashed #ddd;
  margin: 0 auto;
}

.diploma-images {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.diploma-item {
  display: inline-block;
}

.box-card {
  margin-bottom: 20px;
}
</style>
