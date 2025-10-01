<template>
  <div class="refund-manage">
    <div class="filter-container">
      <el-form :inline="true" :model="query" class="demo-form-inline">
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width: 160px">
            <el-option label="申请中" value="applied" />
            <el-option label="处理中" value="processing" />
            <el-option label="退款完成" value="completed" />
            <el-option label="已撤回" value="revoked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList"><i class="el-icon-search"></i> 查询</el-button>
          <el-button @click="reset"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="list" v-loading="loading" border style="width:100%">
      <el-table-column prop="orderNo" label="订单号" width="160" />
      <el-table-column prop="studentName" label="学生" width="120" />
      <el-table-column prop="teacherName" label="教师" width="120" />
      <el-table-column prop="courseName" label="课程名称" width="200" show-overflow-tooltip />
      <el-table-column prop="amount" label="金额" width="100" />
      <!-- <el-table-column prop="refundType" label="类型" width="100" /> -->
      <el-table-column prop="reason" label="原因" width="240" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="tagType(scope.row.status)" size="small">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="180">
        <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="approve(scope.row)" :disabled="scope.row.status==='completed' || scope.row.status==='revoked'">同意</el-button>
          <el-button size="mini" type="danger" @click="reject(scope.row)" :disabled="scope.row.status==='completed' || scope.row.status==='revoked'">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        @size-change="val => { query.size=val; query.page=1; getList() }"
        @current-change="val => { query.page=val; getList() }"
        :current-page="query.page"
        :page-sizes="[10,20,30,50]"
        :page-size="query.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>
  </div>
  </template>

<script>
import request from '@/utils/request'
export default {
  name: 'RefundManage',
  data(){
    return { loading:false, list:[], total:0, query:{ page:1, size:10, status:'' } }
  },
  created(){ this.getList() },
  methods:{
    async getList(){
      this.loading=true
      try{
        const res = await request({ url:'/admin/refund/list', method:'get', params:this.query })
        if(res && (res.code===200 || res.success)){
          const data = res.data || res.result || {}
          this.list = data.items || data.list || []
          this.total = data.total || 0
        }
      }finally{ this.loading=false }
    },
    async approve(row){
      try{
        await this.$confirm('确认同意退款并将金额退回到家长余额吗？','提示')
        const res = await request({ url:`/admin/refund/${row.id}/approve`, method:'post' })
        if(res && (res.code===200 || res.success)){ this.$message.success('已同意并退款'); this.getList() }
      }catch(e){}
    },
    async reject(row){
      try{
        const { value } = await this.$prompt('请输入驳回理由','驳回退款',{
          confirmButtonText:'确定', cancelButtonText:'取消', inputValidator:v=>!!(v&&v.trim()), inputErrorMessage:'请填写驳回理由'
        })
        const res = await request({ url:`/admin/refund/${row.id}/reject`, method:'post', data:{ reason: value } })
        if(res && (res.code===200 || res.success)){ this.$message.success('已驳回'); this.getList() }
      }catch(e){}
    },
    tagType(s){ return {applied:'warning',processing:'info',completed:'success',revoked:'danger'}[s] || 'info' },
    statusText(s){ return {applied:'申请中',processing:'处理中',completed:'退款完成',revoked:'已撤回'}[s] || s },
    formatDate(ts){ if(!ts) return '-'; return new Date(ts.toString().replace('T',' ').replace(/-/g,'/')).toLocaleString('zh-CN') },
    reset(){ this.query={ page:1, size:10, status:'' }; this.getList() }
  }
}
</script>

<style scoped>
.refund-manage{ padding:20px }
.filter-container{ background:#fff; padding:20px; border-radius:4px; margin-bottom:20px }
.pagination-container{ background:#fff; padding:20px; text-align:center; margin-top:20px }
</style>


