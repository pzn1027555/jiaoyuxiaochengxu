<template>
  <div class="page-container">
    <div class="content-box">
      <h2>班主任管理</h2>

      <div class="toolbar">
        <el-input v-model="query.name" placeholder="按姓名搜索" clearable size="mini" style="width:220px;margin-right:8px" @keyup.enter.native="onSearch" />
        <el-button type="primary" size="mini" @click="onSearch">搜索</el-button>
        <el-button size="mini" @click="onReset">重置</el-button>
        <el-button type="primary" size="mini" style="float:right" @click="openDialog()">新增</el-button>
      </div>

      <el-table :data="filteredList" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="姓名" width="160" />
        <el-table-column prop="phone" label="电话" width="160" />
        <el-table-column label="二维码" width="140">
          <template slot-scope="scope">
            <el-image :src="abs(scope.row.wechatQrUrl)" :preview-src-list="[abs(scope.row.wechatQrUrl)]" style="width:80px;height:80px;border-radius:6px" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="180">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status===1?'success':'info'" style="margin-right:10px">{{ scope.row.status===1?'启用':'停用' }}</el-tag>
            <el-switch :value="scope.row.status" :active-value="1" :inactive-value="0" @change="val=>onToggleStatus(scope.row,val)" />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="onDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
          <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item label="二维码" prop="wechatQrUrl">
            <el-upload :http-request="uploadQr" :show-file-list="false" :action="dummyAction" accept="image/*">
              <el-button>上传二维码</el-button>
            </el-upload>
            <div v-if="form.wechatQrUrl" class="qr-preview"><img :src="abs(form.wechatQrUrl)" /></div>
          </el-form-item>
          <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible=false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HeadTeacher',
  data(){
    return {
      loading: false,
      list: [],
      query: { name: '' },
      dialogVisible: false,
      dialogTitle: '新增班主任',
      form: { id: null, name: '', phone: '', wechatQrUrl: '', remark: '', status: 1 },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        wechatQrUrl: [{ required: true, message: '请上传二维码', trigger: 'change' }]
      },
      dummyAction: '#'
    }
  },
  computed: {
    filteredList(){
      const kw = (this.query.name || '').trim()
      if(!kw) return this.list
      return this.list.filter(it => (it.name||'').includes(kw))
    }
  },
  mounted(){ this.loadList() },
  methods: {
    apiBase(){ return process.env.VUE_APP_BASE_API || '/api' },
    abs(url){ if(!url) return ''; if(/^https?:\/\//i.test(url)) return url; const base=(process.env.VUE_APP_FILE_HOST)||''; if(base){ return base + url } return (process.env.VUE_APP_BASE_API || '/api') + (url.startsWith('/')? url : ('/'+url)) },
    async loadList(){
      this.loading = true
      try {
        const { data } = await axios.get(this.apiBase() + '/admin/head-teacher/list')
        if(data && (data.success || data.code===200)) this.list = data.data || []
      } finally {
        this.loading = false
      }
    },
    onSearch(){ /* 前端过滤，已使用 computed */ },
    onReset(){ this.query.name=''; },
    openDialog(row){
      if(row){
        this.dialogTitle = '编辑班主任'
        this.form = { id: row.id, name: row.name, phone: row.phone, wechatQrUrl: row.wechatQrUrl, remark: row.remark, status: row.status }
      }else{
        this.dialogTitle = '新增班主任'
        this.form = { id: null, name: '', phone: '', wechatQrUrl: '', remark: '', status: 1 }
      }
      this.dialogVisible = true
    },
    async uploadQr(req){
      const fd = new FormData(); fd.append('file', req.file)
      const { data } = await axios.post(this.apiBase() + '/mini/upload/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if(data && (data.success || data.code===200)){
        const d = data.data || {}; this.form.wechatQrUrl = d.url; this.$message.success('上传成功')
      } else { this.$message.error(data?.message || '上传失败') }
    },
    async submit(){
      this.$refs.formRef.validate(async valid => {
        if(!valid) return
        const { data } = await axios.post(this.apiBase() + '/admin/head-teacher/save', this.form)
        if(data && (data.success || data.code===200)){
          this.$message.success('保存成功'); this.dialogVisible=false; 
          // 乐观更新：如果是编辑，本地替换；如果是新增，重新拉取以拿到自增ID
          if(this.form.id){
            const idx = this.list.findIndex(x=>x.id===this.form.id)
            if(idx>-1) this.$set(this.list, idx, { ...this.list[idx], ...this.form })
          } else {
            await this.loadList()
          }
        } else { this.$message.error(data?.message || '保存失败') }
      })
    },
    async onToggleStatus(row, val){
      const { data } = await axios.post(this.apiBase() + `/admin/head-teacher/status?id=${row.id}&status=${val}`)
      if(data && (data.success || data.code===200)){
        this.$message.success(val===1?'已启用':'已停用')
        // 唯一启用：若设为1，把其它全部置0；若设为0，仅当前置0
        if(val===1){ this.list = this.list.map(it => ({ ...it, status: it.id===row.id ? 1 : 0 })) }
        else { const idx=this.list.findIndex(it=>it.id===row.id); if(idx>-1){ this.$set(this.list, idx, { ...this.list[idx], status: 0 }) } }
      } else { this.$message.error(data?.message || '状态更新失败') }
    },
    async onDelete(row){
      try{
        await this.$confirm('确认删除该班主任？','提示',{type:'warning'})
        const { data } = await axios.post(this.apiBase()+`/admin/head-teacher/delete?id=${row.id}`)
        if(data && (data.success || data.code===200)){
          this.$message.success('删除成功')
          this.list = this.list.filter(it => it.id !== row.id)
        } else { this.$message.error(data?.message || '删除失败') }
      }catch(e){ if(e!=='cancel') this.$message.error('已取消或删除失败') }
    }
  }
}
</script>

<style scoped>
.content-box { padding: 16px; background: #fff; }
.toolbar { margin: 12px 0; overflow: hidden; }
.qr-preview img{ width:140px; height:140px; border-radius:8px; margin-top:8px }
</style>


