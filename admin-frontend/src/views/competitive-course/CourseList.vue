<template>
  <div class="page-container">
    <div class="content-box">
      <h2>课程列表</h2>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="stat-card total">
              <div class="stat-icon">
                <i class="el-icon-collection"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalCourses }}</div>
                <div class="stat-label">总课程数</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card online">
              <div class="stat-icon">
                <i class="el-icon-video-camera"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ onlineCourses }}</div>
                <div class="stat-label">上架课程</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card pending">
              <div class="stat-icon">
                <i class="el-icon-time"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ pendingAudit }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card hot">
              <div class="stat-icon">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ hotCourses }}</div>
                <div class="stat-label">热门课程</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card sales">
              <div class="stat-icon">
                <i class="el-icon-shopping-bag-2"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalSales }}</div>
                <div class="stat-label">总销量</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="4">
            <div class="stat-card rating">
              <div class="stat-icon">
                <i class="el-icon-thumb-up"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ avgRating }}</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="课程名称">
            <el-input 
              v-model="searchForm.courseName" 
              placeholder="请输入课程名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          
          <el-form-item label="课程编号">
            <el-input 
              v-model="searchForm.courseNo" 
              placeholder="请输入课程编号"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          
          <el-form-item label="课程分类">
            <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
              <el-option 
                v-for="category in categoryList" 
                :key="category.id" 
                :label="category.categoryName"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="课程类型">
            <el-select v-model="searchForm.courseType" placeholder="请选择类型" clearable>
              <el-option label="一对一" value="one_to_one"></el-option>
              <el-option label="小班课" value="small_class"></el-option>
              <el-option label="直播课" value="live_class"></el-option>
              <el-option label="体验课" value="trial"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="课程状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="上架" :value="1"></el-option>
              <el-option label="下架" :value="0"></el-option>
              <el-option label="待审核" :value="2"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable>
              <el-option label="待审核" :value="0"></el-option>
              <el-option label="审核通过" :value="1"></el-option>
              <el-option label="审核拒绝" :value="2"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="价格范围">
            <el-input-number 
              v-model="searchForm.minPrice" 
              :min="0" 
              placeholder="最低价"
              style="width: 120px"
            />
            <span style="margin: 0 10px">-</span>
            <el-input-number 
              v-model="searchForm.maxPrice" 
              :min="0" 
              placeholder="最高价"
              style="width: 120px"
            />
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
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增课程</el-button>
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
            type="warning" 
            icon="el-icon-upload" 
            :disabled="!hasSelection"
            @click="handleBatchStatus(1)"
          >
            批量上架
          </el-button>
          <el-button 
            type="info" 
            icon="el-icon-download" 
            :disabled="!hasSelection"
            @click="handleBatchStatus(0)"
          >
            批量下架
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-button-group>
            <el-button 
              :type="filterType === 'all' ? 'primary' : 'default'"
              @click="switchFilter('all')"
            >
              全部课程
            </el-button>
            <el-button 
              :type="filterType === 'pending' ? 'primary' : 'default'"
              @click="switchFilter('pending')"
            >
              待审核 <el-badge :value="pendingAudit" :hidden="pendingAudit === 0" />
            </el-button>
            <el-button 
              :type="filterType === 'hot' ? 'primary' : 'default'"
              @click="switchFilter('hot')"
            >
              热门课程
            </el-button>
            <el-button 
              :type="filterType === 'recommended' ? 'primary' : 'default'"
              @click="switchFilter('recommended')"
            >
              推荐课程
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 课程列表表格 -->
      <div class="table-container">
        <el-table
          ref="courseTable"
          :data="courseList"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          
          <el-table-column label="课程信息" width="300" fixed="left">
            <template slot-scope="scope">
              <div class="course-info">
                <el-image 
                  :src="scope.row.coverImage" 
                  style="width: 80px; height: 60px; border-radius: 4px;"
                  fit="cover"
                  :preview-src-list="[scope.row.coverImage]"
                />
                <div class="course-details">
                  <div class="course-name">{{ scope.row.courseName }}</div>
                  <div class="course-no">编号：{{ scope.row.courseNo }}</div>
                  <div class="course-category">分类：{{ scope.row.categoryName }}</div>
                  <div class="course-type">
                    <el-tag size="mini" :type="getCourseTypeTagType(scope.row.courseType)">
                      {{ getCourseTypeText(scope.row.courseType) }}
                    </el-tag>
                    <el-tag size="mini" style="margin-left: 5px;">
                      {{ getDifficultyText(scope.row.difficulty) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="价格信息" width="120" align="center">
            <template slot-scope="scope">
              <div class="price-info">
                <div class="current-price">¥{{ scope.row.price || 0 }}</div>
                <div v-if="scope.row.originalPrice && scope.row.originalPrice > scope.row.price" 
                     class="original-price">
                  ¥{{ scope.row.originalPrice }}
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="课时信息" width="100" align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.totalLessons || 0 }}节</div>
              <div class="duration-text">{{ scope.row.lessonDuration || 0 }}分钟/节</div>
            </template>
          </el-table-column>
          
          <el-table-column label="评分/销量" width="120" align="center">
            <template slot-scope="scope">
              <div class="rating-info">
                <el-rate 
                  :value="scope.row.rating || 0" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                  score-template="{value}"
                />
                <div class="sales-info">
                  <span>销量：{{ scope.row.soldCount || 0 }}</span>
                  <span>浏览：{{ scope.row.viewCount || 0 }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="scope">
              <div>
                <el-tag 
                  :type="getStatusTagType(scope.row.status)"
                  size="small"
                >
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </div>
              <div style="margin-top: 5px;">
                <el-tag 
                  :type="getAuditStatusTagType(scope.row.auditStatus)"
                  size="mini"
                >
                  {{ getAuditStatusText(scope.row.auditStatus) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="特殊标记" width="100" align="center">
            <template slot-scope="scope">
              <div>
                <el-tag v-if="scope.row.isHot === 1" type="danger" size="mini">热门</el-tag>
                <el-tag v-if="scope.row.isRecommended === 1" type="warning" size="mini">推荐</el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="创建时间" width="150" align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
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
                  <el-dropdown-item 
                    v-if="scope.row.auditStatus === 0" 
                    command="audit"
                  >
                    审核
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="scope.row.status === 1 ? 'offline' : 'online'"
                  >
                    {{ scope.row.status === 1 ? '下架' : '上架' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="scope.row.isHot === 1 ? 'unhot' : 'hot'"
                  >
                    {{ scope.row.isHot === 1 ? '取消热门' : '设为热门' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="scope.row.isRecommended === 1 ? 'unrecommend' : 'recommend'"
                  >
                    {{ scope.row.isRecommended === 1 ? '取消推荐' : '设为推荐' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="category">修改分类</el-dropdown-item>
                  <el-dropdown-item command="copy">复制课程</el-dropdown-item>
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

    <!-- 审核对话框 -->
    <el-dialog title="课程审核" :visible.sync="auditDialogVisible" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="审核原因">
          <el-input 
            type="textarea" 
            v-model="auditForm.auditReason" 
            :rows="3"
            placeholder="请输入审核原因（选填）"
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getCourseList, 
  getCourseStatistics,
  auditCourse,
  batchOperationCourse,
  updateCourseStatus,
  updateHotStatus,
  updateRecommendStatus,
  updateCourseCategory,
  deleteCourse
} from '@/api/course'
import { getEnabledCategories } from '@/api/courseCategory'

export default {
  name: 'CourseList',
  data() {
    return {
      loading: false,
      filterType: 'all', // all, pending, hot, recommended
      searchForm: {
        courseName: '',
        courseNo: '',
        categoryId: null,
        courseType: '',
        status: null,
        auditStatus: null,
        minPrice: null,
        maxPrice: null
      },
      courseList: [],
      categoryList: [],
      selectedCourses: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 统计数据
      totalCourses: 0,
      onlineCourses: 0,
      pendingAudit: 0,
      hotCourses: 0,
      totalSales: 0,
      avgRating: 0,
      
      // 对话框
      auditDialogVisible: false,
      auditForm: {
        courseId: null,
        auditStatus: 1,
        auditReason: ''
      },
      
      currentCourse: {}
    }
  },
  
  computed: {
    hasSelection() {
      return this.selectedCourses.length > 0
    }
  },
  
  mounted() {
    this.loadCourseList()
    this.loadStatistics()
    this.loadCategoryList()
  },
  
  methods: {
    async loadCourseList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        // 根据过滤类型调整参数
        if (this.filterType === 'pending') {
          params.auditStatus = 0
        } else if (this.filterType === 'hot') {
          params.isHot = 1
        } else if (this.filterType === 'recommended') {
          params.isRecommended = 1
        }
        
        const response = await getCourseList(params)
        if (response.code === 200) {
          this.courseList = response.data.list || []
          this.total = response.data.total || 0
        }
      } catch (error) {
        this.$message.error('加载课程列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await getCourseStatistics()
        if (response.code === 200) {
          const stats = response.data
          this.totalCourses = stats.total_courses || 0
          this.onlineCourses = stats.online_courses || 0
          this.pendingAudit = stats.pending_audit || 0
          this.hotCourses = stats.hot_courses || 0
          this.totalSales = stats.total_sales || 0
          this.avgRating = stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : 0
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    async loadCategoryList() {
      try {
        const response = await getEnabledCategories()
        if (response.code === 200) {
          this.categoryList = response.data || []
        }
      } catch (error) {
        console.error('加载分类列表失败', error)
      }
    },
    
    handleSearch() {
      this.currentPage = 1
      this.loadCourseList()
    },
    
    resetSearch() {
      this.searchForm = {
        courseName: '',
        courseNo: '',
        categoryId: null,
        courseType: '',
        status: null,
        auditStatus: null,
        minPrice: null,
        maxPrice: null
      }
      this.handleSearch()
    },
    
    switchFilter(type) {
      this.filterType = type
      this.currentPage = 1
      this.loadCourseList()
    },
    
    handleSelectionChange(selection) {
      this.selectedCourses = selection
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.loadCourseList()
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadCourseList()
    },
    
    handleCreate() {
      this.$message.info('新增课程功能开发中...')
    },
    
    handleView(row) {
      this.$message.info(`查看课程详情：${row.courseName}`)
    },
    
    handleEdit(row) {
      this.$message.info(`编辑课程：${row.courseName}`)
    },
    
    // 批量审核
    async handleBatchAudit(auditStatus) {
      const statusText = auditStatus === 1 ? '通过' : '拒绝'
      
      this.$confirm(`确定批量${statusText}选中的 ${this.selectedCourses.length} 个课程吗？`, '确认批量审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: auditStatus === 1 ? 'success' : 'warning'
      }).then(async () => {
        try {
          const response = await batchOperationCourse({
            courseIds: this.selectedCourses.map(c => c.id),
            operationType: 'audit',
            auditStatus: auditStatus,
            auditReason: auditStatus === 2 ? '批量操作' : null
          })
          
          if (response.code === 200) {
            this.$message.success(`批量审核${statusText}成功`)
            this.loadCourseList()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error(`批量审核${statusText}失败`)
          console.error(error)
        }
      })
    },
    
    // 批量状态修改
    async handleBatchStatus(status) {
      const statusText = status === 1 ? '上架' : '下架'
      
      this.$confirm(`确定批量${statusText}选中的 ${this.selectedCourses.length} 个课程吗？`, `确认批量${statusText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await batchOperationCourse({
            courseIds: this.selectedCourses.map(c => c.id),
            operationType: 'status',
            status: status
          })
          
          if (response.code === 200) {
            this.$message.success(`批量${statusText}成功`)
            this.loadCourseList()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error(`批量${statusText}失败`)
          console.error(error)
        }
      })
    },
    
    // 下拉菜单操作
    handleDropdownCommand(command, row) {
      this.currentCourse = row
      
      switch (command) {
        case 'audit':
          this.showAuditDialog(row)
          break
        case 'online':
        case 'offline':
          this.handleStatusChange(row, command === 'online' ? 1 : 0)
          break
        case 'hot':
        case 'unhot':
          this.handleHotChange(row, command === 'hot' ? 1 : 0)
          break
        case 'recommend':
        case 'unrecommend':
          this.handleRecommendChange(row, command === 'recommend' ? 1 : 0)
          break
        case 'category':
          this.handleCategoryChange(row)
          break
        case 'copy':
          this.handleCopy(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    
    // 显示审核对话框
    showAuditDialog(row) {
      this.auditForm = {
        courseId: row.id,
        auditStatus: 1,
        auditReason: ''
      }
      this.auditDialogVisible = true
    },
    
    // 提交审核
    async submitAudit() {
      try {
        const response = await auditCourse(this.auditForm)
        if (response.code === 200) {
          this.$message.success('审核成功')
          this.auditDialogVisible = false
          this.loadCourseList()
          this.loadStatistics()
        }
      } catch (error) {
        this.$message.error('审核失败')
        console.error(error)
      }
    },
    
    // 状态变更
    async handleStatusChange(row, status) {
      const statusText = status === 1 ? '上架' : '下架'
      
      this.$confirm(`确定${statusText}课程"${row.courseName}"吗？`, `确认${statusText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await updateCourseStatus(row.id, status)
          if (response.code === 200) {
            this.$message.success(`${statusText}成功`)
            this.loadCourseList()
          }
        } catch (error) {
          this.$message.error(`${statusText}失败`)
          console.error(error)
        }
      })
    },
    
    // 热门状态变更
    async handleHotChange(row, isHot) {
      const statusText = isHot === 1 ? '设为热门' : '取消热门'
      
      try {
        const response = await updateHotStatus(row.id, isHot)
        if (response.code === 200) {
          this.$message.success(`${statusText}成功`)
          this.loadCourseList()
        }
      } catch (error) {
        this.$message.error(`${statusText}失败`)
        console.error(error)
      }
    },
    
    // 推荐状态变更
    async handleRecommendChange(row, isRecommended) {
      const statusText = isRecommended === 1 ? '设为推荐' : '取消推荐'
      
      try {
        const response = await updateRecommendStatus(row.id, isRecommended)
        if (response.code === 200) {
          this.$message.success(`${statusText}成功`)
          this.loadCourseList()
        }
      } catch (error) {
        this.$message.error(`${statusText}失败`)
        console.error(error)
      }
    },
    
    // 修改分类
    handleCategoryChange(row) {
      this.$prompt('请选择新的分类', '修改课程分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'select',
        inputOptions: this.categoryList.map(c => ({ value: c.id, label: c.categoryName }))
      }).then(async ({ value }) => {
        try {
          const response = await updateCourseCategory(row.id, parseInt(value))
          if (response.code === 200) {
            this.$message.success('分类修改成功')
            this.loadCourseList()
          }
        } catch (error) {
          this.$message.error('分类修改失败')
          console.error(error)
        }
      })
    },
    
    // 复制课程
    handleCopy(row) {
      this.$message.info(`复制课程：${row.courseName}`)
    },
    
    // 删除课程
    handleDelete(row) {
      this.$confirm(`确定删除课程"${row.courseName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteCourse(row.id)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.loadCourseList()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      })
    },
    
    // 工具方法
    getCourseTypeTagType(type) {
      const typeMap = {
        'one_to_one': 'primary',
        'small_class': 'success',
        'live_class': 'warning',
        'trial': 'primary'
      }
      return typeMap[type] || 'info'
    },
    
    getCourseTypeText(type) {
      const textMap = {
        'one_to_one': '一对一',
        'small_class': '小班课',
        'live_class': '直播课',
        'trial': '体验课'
      }
      return textMap[type] || '一对一'
    },
    
    getDifficultyText(difficulty) {
      const textMap = {
        'easy': '入门',
        'medium': '进阶',
        'hard': '高级'
      }
      return textMap[difficulty] || '入门'
    },
    
    getStatusTagType(status) {
      const typeMap = {
        1: 'success',
        0: 'danger',
        2: 'warning'
      }
      return typeMap[status] || 'info'
    },
    
    getStatusText(status) {
      const textMap = {
        1: '上架',
        0: '下架',
        2: '待审核'
      }
      return textMap[status] || '未知'
    },
    
    getAuditStatusTagType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return typeMap[status] || ''
    },
    
    getAuditStatusText(status) {
      const textMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return textMap[status] || '未知'
    },
    
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
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
    
    &.online {
      .stat-icon { background: #67c23a; }
      .stat-value { color: #67c23a; }
    }
    
    &.pending {
      .stat-icon { background: #e6a23c; }
      .stat-value { color: #e6a23c; }
    }
    
    &.hot {
      .stat-icon { background: #f56c6c; }
      .stat-value { color: #f56c6c; }
    }
    
    &.sales {
      .stat-icon { background: #909399; }
      .stat-value { color: #909399; }
    }
    
    &.rating {
      .stat-icon { background: #ff9900; }
      .stat-value { color: #ff9900; }
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
  .course-info {
    display: flex;
    align-items: center;
    
    .course-details {
      margin-left: 12px;
      
      .course-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
        line-height: 1.4;
      }
      
      .course-no, .course-category {
        font-size: 12px;
        color: #909399;
        margin-bottom: 2px;
      }
      
      .course-type {
        margin-top: 4px;
      }
    }
  }
  
  .price-info {
    .current-price {
      font-weight: bold;
      color: #f56c6c;
      font-size: 16px;
    }
    
    .original-price {
      font-size: 12px;
      color: #909399;
      text-decoration: line-through;
    }
  }
  
  .duration-text {
    font-size: 12px;
    color: #909399;
  }
  
  .rating-info {
    .sales-info {
      font-size: 12px;
      color: #606266;
      margin-top: 4px;
      
      span {
        display: block;
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