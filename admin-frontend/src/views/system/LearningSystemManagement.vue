<template>
  <div class="page-container">
    <div class="content-box">
      <h2>学习体系管理</h2>
      <div style="margin-bottom: 14px">
        <el-button type="primary" size="mini" @click="openDialog()">新增体系</el-button>
      </div>
      <el-table :data="list" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="systemKey" label="体系键" width="200" />
        <el-table-column prop="displayName" label="显示名称" width="220" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
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
          <el-form-item label="体系键">
            <el-input v-model="form.systemKey" :disabled="!!form.id" placeholder="如：gaokao/ap/alevel/ib/competition" />
          </el-form-item>
          <el-form-item label="显示名称">
            <el-input v-model="form.displayName" placeholder="如：国内中考/高考、AP、A-Level、IB、竞赛" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :step="1" style="width: 100%" />
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
import { learningSystemApi } from '@/api/system'

export default {
  name: 'LearningSystemManagement',
  data(){
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      dialogTitle: '新增体系',
      form: { id: null, systemKey: '', displayName: '', sortOrder: 0, isEnabled: 1, remark: '' }
    }
  },
  mounted(){ this.loadList() },
  methods:{
    async loadList(){
      this.loading = true
      try{
        const r = await learningSystemApi.list()
        if (r && (r.code===200 || r.success)) this.list = r.data || []
      } finally { this.loading = false }
    },
    openDialog(row){
      if (row){ this.dialogTitle = '编辑体系'; this.form = { ...row } }
      else { this.dialogTitle = '新增体系'; this.form = { id: null, systemKey: '', displayName: '', sortOrder: 0, isEnabled: 1, remark: '' } }
      this.dialogVisible = true
    },
    async submit(){
      try{
        if (this.form.id) await learningSystemApi.update(this.form.id, this.form)
        else await learningSystemApi.create(this.form)
        this.$message.success('保存成功')
        this.dialogVisible = false
        this.loadList()
      }catch(e){ this.$message.error('保存失败') }
    },
    async handleDelete(row){
      try{
        await this.$confirm('确认删除该体系？', '提示', { type: 'warning' })
        await learningSystemApi.remove(row.id)
        this.$message.success('删除成功')
        this.loadList()
      }catch(e){ if (e !== 'cancel') this.$message.error('删除失败') }
    }
  }
}
</script>

<style scoped>
.content-box { padding: 16px; background: #fff; }
</style>


