<template>
  <div class="page-container">
    <div class="content-box">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="分类名称/编码" class="mr8" clearable @clear="handleSearch" @keyup.enter.native="handleSearch" />
        <el-select v-model="query.level" placeholder="层级" clearable class="mr8" @change="handleSearch">
          <el-option label="一级" :value="1" />
          <el-option label="二级" :value="2" />
        </el-select>
        <el-select v-model="query.status" placeholder="状态" clearable class="mr8" @change="handleSearch">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="success" class="ml8" @click="handleCreate">新增分类</el-button>
      </div>

      <el-table :data="pagedList" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="categoryName" label="分类名称" min-width="180" />
        <el-table-column prop="categoryCode" label="分类编码" width="160" />
        <el-table-column label="层级" width="90">
          <template slot-scope="scope">{{ levelText(scope.row.level) }}</template>
        </el-table-column>
        <el-table-column label="上级科目" width="180">
          <template slot-scope="scope">{{ scope.row.level === 2 ? (scope.row.parentName || '-') : '-' }}</template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="90" />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">{{ scope.row.status === 1 ? '启用' : '禁用' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="total"
          :page-size="query.pageSize"
          :current-page.sync="query.pageNum"
          @current-change="paginate"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName"><el-input v-model="form.categoryName" /></el-form-item>
        <el-form-item label="分类编码" prop="categoryCode"><el-input v-model="form.categoryCode" /></el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="form.level" placeholder="请选择">
            <el-option label="一级" :value="1" />
            <el-option label="二级" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="父分类" v-if="form.level === 2">
          <el-select v-model="form.parentId" placeholder="选择父分类" filterable clearable>
            <el-option v-for="p in parentOptions" :key="p.id" :label="p.categoryName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" :max="999" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述"><el-input type="textarea" :rows="3" v-model="form.description" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { courseCategoryApi as api } from '@/api/system'

export default {
  name: 'SubjectCategory',
  data(){
    return {
      loading: false,
      list: [],
      pagedList: [],
      total: 0,
      query: { pageNum: 1, pageSize: 10, keyword: '', level: null, status: null },
      dialogVisible: false,
      dialogTitle: '新增分类',
      form: { id: null, categoryName: '', categoryCode: '', level: 1, parentId: null, sortOrder: 0, status: 1, description: '' },
      rules: { categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }], categoryCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }] },
      parentOptions: []
    }
  },
  mounted(){ this.loadData(); this.loadParents() },
  methods:{
    async loadData(){
      this.loading = true
      try{
        const params = { categoryName: this.query.keyword, level: this.query.level, status: this.query.status }
        const res = await api.list(params)
        let list = (res && (res.data || res)) || []
        list = Array.isArray(list) ? list : []
        // 填充上级名称
        let pmap = {}
        if ((this.parentOptions||[]).length){
          pmap = this.parentOptions.reduce((m, p)=>{ m[p.id] = p.categoryName; return m }, {})
        } else {
          try{ const r = await api.topLevel(); const arr = (r && (r.data||r)) || []; pmap = Array.isArray(arr)? arr.reduce((m,p)=>{ m[p.id]=p.categoryName; return m }, {}): {} }catch(e){ pmap = {} }
        }
        list = list.map(item=> ({ ...item, parentName: (item.level===2 ? (pmap[item.parentId] || '') : '') }))
        // 按上级目录分组排序：groupKey=二级取parentName；一级取自身名称
        const collator = new Intl.Collator('zh-Hans-CN', { sensitivity:'base', numeric:true })
        list.sort((a,b)=>{
          const ag = (a.level===2 ? (a.parentName||'') : (a.categoryName||''))
          const bg = (b.level===2 ? (b.parentName||'') : (b.categoryName||''))
          const gcmp = collator.compare(ag, bg)
          if (gcmp !== 0) return gcmp
          const as = (a.sortOrder ?? 0), bs = (b.sortOrder ?? 0)
          if (as !== bs) return as - bs
          return collator.compare(a.categoryName||'', b.categoryName||'')
        })
        this.list = list
        this.total = this.list.length
        this.paginate(this.query.pageNum)
      } finally { this.loading = false }
    },
    async loadParents(){
      try{ const r = await api.topLevel(); const arr = (r && (r.data||r)) || []; this.parentOptions = Array.isArray(arr)? arr: [] }catch(e){ this.parentOptions = [] }
    },
    paginate(page){
      this.query.pageNum = page
      const start = (this.query.pageNum - 1) * this.query.pageSize
      this.pagedList = this.list.slice(start, start + this.query.pageSize)
    },
    handleSizeChange(size){ this.query.pageSize = size; this.paginate(1) },
    handleSearch(){ this.query.pageNum = 1; this.loadData() },
    handleCreate(){ this.dialogTitle='新增分类'; this.form = { id:null, categoryName:'', categoryCode:'', level:1, parentId:null, sortOrder:0, status:1, description:'' }; this.dialogVisible = true },
    handleEdit(row){ this.dialogTitle='编辑分类'; this.form = { id:row.id, categoryName:row.categoryName, categoryCode:row.categoryCode, level:row.level, parentId:row.parentId, sortOrder:row.sortOrder, status:row.status, description:row.description }; this.dialogVisible = true },
    async handleDelete(row){ await this.$confirm(`确定删除分类“${row.categoryName}”吗？`,'提示',{type:'warning'}); const r = await api.delete(row.id); if(r && (r.code===200 || r.success===true)){ this.$message.success('删除成功'); this.loadData() } },
    async submit(){
      this.$refs.formRef.validate(async valid=>{
        if(!valid) return
        const payload = { ...this.form }
        if (payload.level === 2 && !payload.parentId) { this.$message.error('请选择父分类'); return }
        if(payload.level !== 2){ payload.parentId = null }
        const r = payload.id? await api.update(payload.id, payload): await api.create(payload)
        if(r && (r.code===200 || r.success===true)){
          this.$message.success(payload.id? '更新成功':'创建成功')
          this.dialogVisible=false
          this.loadData()
        }
      })
    },
    levelText(v){ return v===1?'一级':(v===2?'二级':'-') },
    formatDate(d){ if(!d) return '-'; try{ return new Date(d).toLocaleString('zh-CN') }catch(e){ return '-' } }
  }
}
</script>

<style scoped>
.content-box { padding: 16px; background: #fff; }
.toolbar { margin-bottom: 12px; display: flex; align-items: center; }
.mr8 { margin-right: 8px; }
.ml8 { margin-left: 8px; }
.pager { margin-top: 12px; text-align: right; }
</style>


