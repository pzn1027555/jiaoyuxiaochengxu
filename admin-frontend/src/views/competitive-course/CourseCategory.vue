<template>
  <div class="page-container">
    <div class="content-box">
      <h2>课程分类管理</h2>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-icon">
                <i class="el-icon-menu"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalCategories }}</div>
                <div class="stat-label">总分类数</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card enabled">
              <div class="stat-icon">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ enabledCategories }}</div>
                <div class="stat-label">启用分类</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card visible">
              <div class="stat-icon">
                <i class="el-icon-view"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ visibleCategories }}</div>
                <div class="stat-label">显示分类</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card courses">
              <div class="stat-icon">
                <i class="el-icon-collection"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalCourses }}</div>
                <div class="stat-label">关联课程</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮区域 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增分类</el-button>
          <el-button 
            type="success" 
            icon="el-icon-check" 
            :disabled="!hasSelection"
            @click="handleBatchStatus(1)"
          >
            批量启用
          </el-button>
          <el-button 
            type="warning" 
            icon="el-icon-close" 
            :disabled="!hasSelection"
            @click="handleBatchStatus(0)"
          >
            批量禁用
          </el-button>
          <el-button 
            type="info" 
            icon="el-icon-refresh" 
            @click="handleRecalculateCourseCount"
          >
            重新计算课程数
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-button-group>
            <el-button 
              :type="viewMode === 'tree' ? 'primary' : 'default'"
              @click="switchViewMode('tree')"
            >
              <i class="el-icon-s-operation"></i> 树形视图
            </el-button>
            <el-button 
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="switchViewMode('list')"
            >
              <i class="el-icon-s-grid"></i> 列表视图
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 分类列表表格 -->
      <div class="table-container">
        <el-table
          ref="categoryTable"
          :data="categoryList"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
          row-key="id"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          
          <el-table-column label="分类名称" width="250" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="category-name">
                <el-image 
                  v-if="scope.row.iconUrl"
                  :src="scope.row.iconUrl" 
                  style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle;"
                  fit="cover"
                />
                <i v-else class="el-icon-folder" style="margin-right: 8px; font-size: 18px; color: #409eff;"></i>
                <span>{{ scope.row.categoryName }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="categoryCode" label="分类编码" width="120" align="center"></el-table-column>
          
          <el-table-column label="层级" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="getLevelTagType(scope.row.level)" size="mini">
                {{ scope.row.level }}级
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="课程数量" width="100" align="center">
            <template slot-scope="scope">
              <span class="course-count">{{ scope.row.courseCount || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="排序权重" width="100" align="center">
            <template slot-scope="scope">
              <el-input-number 
                v-model="scope.row.sortOrder" 
                :min="0" 
                :max="999"
                size="mini"
                @change="handleSortOrderChange(scope.row)"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="scope">
              <div>
                <el-tag 
                  :type="scope.row.status === 1 ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </div>
              <div style="margin-top: 5px;">
                <el-tag 
                  :type="scope.row.isVisible === 1 ? 'success' : 'info'"
                  size="mini"
                >
                  {{ scope.row.isVisible === 1 ? '显示' : '隐藏' }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="categoryDescription" label="描述" width="200" show-overflow-tooltip></el-table-column>
          
          <el-table-column label="创建时间" width="150" align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="mini" type="primary" @click="handleAddChild(scope.row)">添加子分类</el-button>
              
              <el-dropdown @command="(command) => handleDropdownCommand(command, scope.row)" trigger="click">
                <el-button size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item 
                    :command="scope.row.status === 1 ? 'disable' : 'enable'"
                  >
                    {{ scope.row.status === 1 ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="scope.row.isVisible === 1 ? 'hide' : 'show'"
                  >
                    {{ scope.row.isVisible === 1 ? '隐藏' : '显示' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="move">移动分类</el-dropdown-item>
                  <el-dropdown-item command="copy">复制分类</el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: #f56c6c">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryForm" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        
        <el-form-item label="分类编码" prop="categoryCode">
          <el-input v-model="categoryForm.categoryCode" placeholder="请输入分类编码（唯一）" />
        </el-form-item>
        
        <el-form-item label="父分类">
          <el-cascader
            v-model="categoryForm.parentPath"
            :options="parentCategoryOptions"
            :props="cascaderProps"
            placeholder="请选择父分类（可选）"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="分类描述">
          <el-input 
            type="textarea" 
            v-model="categoryForm.categoryDescription" 
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        
        <el-form-item label="分类图标">
          <el-input v-model="categoryForm.iconUrl" placeholder="请输入图标URL地址" />
        </el-form-item>
        
        <el-form-item label="封面图片">
          <el-input v-model="categoryForm.coverImage" placeholder="请输入封面图片URL地址" />
        </el-form-item>
        
        <el-form-item label="排序权重">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="是否显示">
          <el-radio-group v-model="categoryForm.isVisible">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCategoryForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 移动分类对话框 -->
    <el-dialog title="移动分类" :visible.sync="moveDialogVisible" width="500px">
      <el-form label-width="100px">
        <el-form-item label="当前分类">
          <span>{{ currentCategory.categoryName }}</span>
        </el-form-item>
        
        <el-form-item label="移动到">
          <el-cascader
            v-model="moveForm.newParentPath"
            :options="parentCategoryOptions"
            :props="cascaderProps"
            placeholder="请选择新的父分类"
            clearable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMoveCategory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getCategoryList, 
  getCategoryTree,
  getCategoryStatistics,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  batchUpdateCategoryStatus,
  updateVisibleStatus,
  updateSortOrder,
  moveCategory,
  deleteCategory,
  recalculateCourseCount
} from '@/api/courseCategory'

export default {
  name: 'CourseCategory',
  data() {
    return {
      loading: false,
      viewMode: 'tree', // tree, list
      categoryList: [],
      selectedCategories: [],
      
      // 统计数据
      totalCategories: 0,
      enabledCategories: 0,
      visibleCategories: 0,
      totalCourses: 0,
      
      // 对话框
      dialogVisible: false,
      dialogTitle: '新增分类',
      categoryForm: {
        id: null,
        categoryName: '',
        categoryCode: '',
        categoryDescription: '',
        parentId: null,
        parentPath: [],
        iconUrl: '',
        coverImage: '',
        sortOrder: 0,
        status: 1,
        isVisible: 1
      },
      categoryRules: {
        categoryName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        categoryCode: [
          { required: true, message: '请输入分类编码', trigger: 'blur' }
        ]
      },
      
      // 移动分类对话框
      moveDialogVisible: false,
      moveForm: {
        newParentPath: []
      },
      currentCategory: {},
      
      // 父分类选项
      parentCategoryOptions: [],
      cascaderProps: {
        value: 'id',
        label: 'categoryName',
        children: 'children',
        checkStrictly: true
      }
    }
  },
  
  computed: {
    hasSelection() {
      return this.selectedCategories.length > 0
    }
  },
  
  mounted() {
    this.loadCategoryList()
    this.loadStatistics()
    this.loadParentCategoryOptions()
  },
  
  methods: {
    async loadCategoryList() {
      this.loading = true
      try {
        let response
        if (this.viewMode === 'tree') {
          response = await getCategoryTree()
        } else {
          response = await getCategoryList({ isTree: false })
        }
        
        if (response.code === 200) {
          this.categoryList = response.data || []
        }
      } catch (error) {
        this.$message.error('加载分类列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await getCategoryStatistics()
        if (response.code === 200) {
          const stats = response.data
          this.totalCategories = stats.total_categories || 0
          this.enabledCategories = stats.enabled_categories || 0
          this.visibleCategories = stats.visible_categories || 0
          this.totalCourses = stats.total_courses || 0
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    async loadParentCategoryOptions() {
      try {
        const response = await getCategoryTree()
        if (response.code === 200) {
          this.parentCategoryOptions = this.buildParentOptions(response.data || [])
        }
      } catch (error) {
        console.error('加载父分类选项失败', error)
      }
    },
    
    buildParentOptions(categories) {
      return categories.map(category => ({
        id: category.id,
        categoryName: category.categoryName,
        children: category.children ? this.buildParentOptions(category.children) : []
      }))
    },
    
    switchViewMode(mode) {
      this.viewMode = mode
      this.loadCategoryList()
    },
    
    handleSelectionChange(selection) {
      this.selectedCategories = selection
    },
    
    handleCreate() {
      this.dialogTitle = '新增分类'
      this.categoryForm = {
        id: null,
        categoryName: '',
        categoryCode: '',
        categoryDescription: '',
        parentId: null,
        parentPath: [],
        iconUrl: '',
        coverImage: '',
        sortOrder: 0,
        status: 1,
        isVisible: 1
      }
      this.dialogVisible = true
    },
    
    handleEdit(row) {
      this.dialogTitle = '编辑分类'
      this.categoryForm = {
        id: row.id,
        categoryName: row.categoryName,
        categoryCode: row.categoryCode,
        categoryDescription: row.categoryDescription,
        parentId: row.parentId,
        parentPath: this.buildParentPath(row.parentId),
        iconUrl: row.iconUrl,
        coverImage: row.coverImage,
        sortOrder: row.sortOrder,
        status: row.status,
        isVisible: row.isVisible
      }
      this.dialogVisible = true
    },
    
    handleAddChild(row) {
      this.dialogTitle = '新增子分类'
      this.categoryForm = {
        id: null,
        categoryName: '',
        categoryCode: '',
        categoryDescription: '',
        parentId: row.id,
        parentPath: this.buildParentPath(row.id),
        iconUrl: '',
        coverImage: '',
        sortOrder: 0,
        status: 1,
        isVisible: 1
      }
      this.dialogVisible = true
    },
    
    buildParentPath(parentId) {
      // TODO: 根据parentId构建父级路径
      return parentId ? [parentId] : []
    },
    
    async submitCategoryForm() {
      this.$refs.categoryForm.validate(async (valid) => {
        if (valid) {
          try {
            const formData = { ...this.categoryForm }
            // 处理父分类ID
            if (formData.parentPath && formData.parentPath.length > 0) {
              formData.parentId = formData.parentPath[formData.parentPath.length - 1]
            } else {
              formData.parentId = null
            }
            
            let response
            if (formData.id) {
              response = await updateCategory(formData.id, formData)
            } else {
              response = await createCategory(formData)
            }
            
            if (response.code === 200) {
              this.$message.success(formData.id ? '更新成功' : '创建成功')
              this.dialogVisible = false
              this.loadCategoryList()
              this.loadStatistics()
              this.loadParentCategoryOptions()
            }
          } catch (error) {
            this.$message.error(this.categoryForm.id ? '更新失败' : '创建失败')
            console.error(error)
          }
        }
      })
    },
    
    // 批量状态修改
    async handleBatchStatus(status) {
      const statusText = status === 1 ? '启用' : '禁用'
      
      this.$confirm(`确定批量${statusText}选中的 ${this.selectedCategories.length} 个分类吗？`, `确认批量${statusText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await batchUpdateCategoryStatus({
            categoryIds: this.selectedCategories.map(c => c.id),
            status: status
          })
          
          if (response.code === 200) {
            this.$message.success(`批量${statusText}成功`)
            this.loadCategoryList()
            this.loadStatistics()
          }
        } catch (error) {
          this.$message.error(`批量${statusText}失败`)
          console.error(error)
        }
      })
    },
    
    // 重新计算课程数
    async handleRecalculateCourseCount() {
      this.$confirm('确定重新计算所有分类的课程数量吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const allCategoryIds = this.getAllCategoryIds(this.categoryList)
          const response = await recalculateCourseCount(allCategoryIds)
          
          if (response.code === 200) {
            this.$message.success('重新计算课程数量成功')
            this.loadCategoryList()
          }
        } catch (error) {
          this.$message.error('重新计算课程数量失败')
          console.error(error)
        }
      })
    },
    
    getAllCategoryIds(categories) {
      let ids = []
      categories.forEach(category => {
        ids.push(category.id)
        if (category.children && category.children.length > 0) {
          ids = ids.concat(this.getAllCategoryIds(category.children))
        }
      })
      return ids
    },
    
    // 排序权重变更
    async handleSortOrderChange(row) {
      try {
        const response = await updateSortOrder(row.id, row.sortOrder)
        if (response.code === 200) {
          this.$message.success('排序更新成功')
          this.loadCategoryList()
        }
      } catch (error) {
        this.$message.error('排序更新失败')
        console.error(error)
      }
    },
    
    // 下拉菜单操作
    handleDropdownCommand(command, row) {
      this.currentCategory = row
      
      switch (command) {
        case 'enable':
        case 'disable':
          this.handleStatusChange(row, command === 'enable' ? 1 : 0)
          break
        case 'show':
        case 'hide':
          this.handleVisibleChange(row, command === 'show' ? 1 : 0)
          break
        case 'move':
          this.showMoveDialog(row)
          break
        case 'copy':
          this.handleCopy(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    
    // 状态变更
    async handleStatusChange(row, status) {
      const statusText = status === 1 ? '启用' : '禁用'
      
      try {
        const response = await updateCategoryStatus(row.id, status)
        if (response.code === 200) {
          this.$message.success(`${statusText}成功`)
          this.loadCategoryList()
          this.loadStatistics()
        }
      } catch (error) {
        this.$message.error(`${statusText}失败`)
        console.error(error)
      }
    },
    
    // 显示状态变更
    async handleVisibleChange(row, isVisible) {
      const statusText = isVisible === 1 ? '显示' : '隐藏'
      
      try {
        const response = await updateVisibleStatus(row.id, isVisible)
        if (response.code === 200) {
          this.$message.success(`${statusText}成功`)
          this.loadCategoryList()
          this.loadStatistics()
        }
      } catch (error) {
        this.$message.error(`${statusText}失败`)
        console.error(error)
      }
    },
    
    // 显示移动对话框
    showMoveDialog(row) {
      this.currentCategory = row
      this.moveForm.newParentPath = []
      this.moveDialogVisible = true
    },
    
    // 提交移动分类
    async submitMoveCategory() {
      try {
        let newParentId = null
        if (this.moveForm.newParentPath && this.moveForm.newParentPath.length > 0) {
          newParentId = this.moveForm.newParentPath[this.moveForm.newParentPath.length - 1]
        }
        
        const response = await moveCategory(this.currentCategory.id, newParentId)
        if (response.code === 200) {
          this.$message.success('分类移动成功')
          this.moveDialogVisible = false
          this.loadCategoryList()
          this.loadParentCategoryOptions()
        }
      } catch (error) {
        this.$message.error('分类移动失败')
        console.error(error)
      }
    },
    
    // 复制分类
    handleCopy(row) {
      this.$message.info(`复制分类：${row.categoryName}`)
    },
    
    // 删除分类
    handleDelete(row) {
      this.$confirm(`确定删除分类"${row.categoryName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteCategory(row.id)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.loadCategoryList()
            this.loadStatistics()
            this.loadParentCategoryOptions()
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
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'danger'
      }
      return typeMap[level] || 'info'
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
    
    &.enabled {
      .stat-icon { background: #67c23a; }
      .stat-value { color: #67c23a; }
    }
    
    &.visible {
      .stat-icon { background: #e6a23c; }
      .stat-value { color: #e6a23c; }
    }
    
    &.courses {
      .stat-icon { background: #f56c6c; }
      .stat-value { color: #f56c6c; }
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-container {
  .category-name {
    display: flex;
    align-items: center;
  }
  
  .course-count {
    font-weight: bold;
    color: #409eff;
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
}
</style>