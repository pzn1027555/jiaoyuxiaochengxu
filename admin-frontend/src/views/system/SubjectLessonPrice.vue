<template>
  <div class="subject-lesson-price">
    <div class="header-actions">
      <el-button type="primary" size="small" @click="showAddDialog">+ 新增学科价格</el-button>
      <el-button size="small" @click="loadList">刷新</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="subjectName" label="学科名称" width="200" />
      <el-table-column prop="price" label="课时价格(元/课时)" width="150">
        <template slot-scope="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="currency" label="币种" width="100" />
      <el-table-column prop="isEnabled" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isEnabled === 1 ? 'success' : 'danger'" size="small">
            {{ scope.row.isEnabled === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="handleDialogClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="学科" prop="subjectId">
          <el-select v-model="form.subjectId" placeholder="请选择学科" filterable @change="handleSubjectChange">
            <el-option
              v-for="subject in subjectList"
              :key="subject.id"
              :label="subject.categoryName"
              :value="subject.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课时价格(元/课时)" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-input v-model="form.currency" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="isEnabled">
          <el-radio-group v-model="form.isEnabled">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'SubjectLessonPrice',
  data() {
    return {
      tableData: [],
      subjectList: [],
      dialogVisible: false,
      dialogTitle: '新增学科价格',
      saving: false,
      form: {
        id: null,
        subjectId: null,
        subjectName: '',
        price: 0,
        currency: 'CNY',
        isEnabled: 1,
        remark: ''
      },
      rules: {
        subjectId: [{ required: true, message: '请选择学科', trigger: 'change' }],
        price: [{ required: true, message: '请输入课时价格', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadList()
    this.loadSubjectList()
  },
  methods: {
    async loadList() {
      try {
        const res = await request({
          url: '/admin/system/subjectPrice/list',
          method: 'get'
        })
        if (res && res.code === 200) {
          this.tableData = res.data || []
        }
      } catch (e) {
        this.$message.error('加载列表失败')
      }
    },
    async loadSubjectList() {
      try {
        const res = await request({
          url: '/admin/course/category/tree',
          method: 'get'
        })
        if (res && res.code === 200) {
          // 只取二级分类（科目）
          const list = []
          if (res.data && res.data.length > 0) {
            res.data.forEach(parent => {
              if (parent.children && parent.children.length > 0) {
                parent.children.forEach(child => {
                  list.push({
                    id: child.id,
                    categoryName: `${parent.categoryName} - ${child.categoryName}`
                  })
                })
              }
            })
          }
          this.subjectList = list
        }
      } catch (e) {
        this.$message.error('加载学科列表失败')
      }
    },
    showAddDialog() {
      this.dialogTitle = '新增学科价格'
      this.resetForm()
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑学科价格'
      this.form = {
        id: row.id,
        subjectId: row.subjectId,
        subjectName: row.subjectName,
        price: row.price,
        currency: row.currency,
        isEnabled: row.isEnabled,
        remark: row.remark
      }
      this.dialogVisible = true
    },
    handleSubjectChange(subjectId) {
      const subject = this.subjectList.find(s => s.id === subjectId)
      if (subject) {
        this.form.subjectName = subject.categoryName
      }
    },
    async handleSave() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return

        this.saving = true
        try {
          const res = await request({
            url: '/admin/system/subjectPrice/saveOrUpdate',
            method: 'post',
            data: this.form
          })
          if (res && res.code === 200) {
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.loadList()
          } else {
            this.$message.error(res.message || '保存失败')
          }
        } catch (e) {
          this.$message.error('保存失败')
        } finally {
          this.saving = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除这条学科价格配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const res = await request({
            url: `/admin/system/subjectPrice/delete/${row.id}`,
            method: 'delete'
          })
          if (res && res.code === 200) {
            this.$message.success('删除成功')
            this.loadList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    resetForm() {
      this.form = {
        id: null,
        subjectId: null,
        subjectName: '',
        price: 0,
        currency: 'CNY',
        isEnabled: 1,
        remark: ''
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    handleDialogClose() {
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.subject-lesson-price {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
}
</style>

