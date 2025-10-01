<template>
  <div class="page-container">
    <div class="content-box">
      <h2>教师评级管理</h2>
      <div style="margin-bottom: 14px">
        <el-button type="primary" size="mini" @click="openDialog()">新增等级</el-button>
      </div>
      <el-table :data="list" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="levelKey" label="等级键" width="160" />
        <el-table-column prop="displayName" label="等级名称" width="160" />
        <el-table-column label="课时费(元)" width="160">
          <template slot-scope="scope">¥{{ scope.row.hourlyRate }}</template>
        </el-table-column>
        <el-table-column label="佣金比例(%)" width="160">
          <template slot-scope="scope">{{ scope.row.commissionRate }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isEnabled === 1 ? 'success' : 'info'">
              {{ scope.row.isEnabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="等级键">
            <el-select v-model="form.levelKey" placeholder="选择等级键" :disabled="!!form.id" style="width: 100%">
              <el-option label="初级 (junior)" value="junior" />
              <el-option label="中级 (intermediate)" value="intermediate" />
              <el-option label="高级 (senior)" value="senior" />
              <el-option label="专家 (expert)" value="expert" />
            </el-select>
          </el-form-item>
          <el-form-item label="等级名称">
            <el-input v-model="form.displayName" placeholder="如：初级/中级/高级/专家" />
          </el-form-item>
          <el-form-item label="课时费(元)">
            <el-input-number v-model="form.hourlyRate" :min="0" :step="10" :precision="2" style="width: 100%" />
          </el-form-item>
          <el-form-item label="佣金比例(%)">
            <el-input-number v-model="form.commissionRate" :min="0" :max="100" :step="0.5" :precision="2" style="width: 100%" />
          </el-form-item>
          <el-form-item label="是否启用">
            <el-switch v-model="form.isEnabled" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" v-model="form.remark" :rows="2" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
  
</template>

<script>
import { listTeacherLevels, createTeacherLevel, updateTeacherLevel, deleteTeacherLevel } from '@/api/system'

export default {
  name: 'TeacherLevelManagement',
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      dialogTitle: '新增等级',
      form: {
        id: null,
        levelKey: 'junior',
        displayName: '初级',
        hourlyRate: 0,
        isEnabled: 1,
        remark: ''
      }
    }
  },
  mounted() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await listTeacherLevels()
        if (res.code === 200) this.list = res.data || []
      } finally {
        this.loading = false
      }
    },
    openDialog(row) {
      if (row) {
        this.dialogTitle = '编辑等级'
        this.form = { ...row }
      } else {
        this.dialogTitle = '新增等级'
        this.form = { id: null, levelKey: 'junior', displayName: '初级', hourlyRate: 0, commissionRate: 15.00, isEnabled: 1, remark: '' }
      }
      this.dialogVisible = true
    },
    async submit() {
      try {
        if (this.form.id) {
          await updateTeacherLevel(this.form.id, this.form)
        } else {
          await createTeacherLevel(this.form)
        }
        this.$message.success('保存成功')
        this.dialogVisible = false
        this.loadList()
      } catch (e) {
        this.$message.error('保存失败')
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该等级配置？', '提示', { type: 'warning' })
        await deleteTeacherLevel(row.id)
        this.$message.success('删除成功')
        this.loadList()
      } catch (e) {
        if (e !== 'cancel') this.$message.error('删除失败')
      }
    }
  }
}
</script>

<style scoped>
.content-box { padding: 16px; background: #fff; }
</style>


