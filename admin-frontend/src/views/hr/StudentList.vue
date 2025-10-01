<template>
  <div class="page-container">
    <div class="content-box">
      <h2>学生管理</h2>

      <!-- 搜索筛选区域 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="学生姓名">
            <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="等级">
            <el-select v-model="searchForm.studentLevel" placeholder="请选择" clearable>
              <el-option label="青铜" value="bronze" />
              <el-option label="白银" value="silver" />
              <el-option label="黄金" value="gold" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="在读" :value="1" />
              <el-option label="暂停" :value="2" />
              <el-option label="毕业" :value="3" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 学生列表表格 -->
      <div class="table-container">
        <el-table
          :data="studentList"
          stripe
          class="custom-table"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="studentNo" label="学号" width="140" />
          <el-table-column prop="studentName" label="姓名" width="120" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="studentLevel" label="等级" width="140">
            <template slot-scope="scope">
              <el-select v-model="scope.row.studentLevel" placeholder="请选择等级" size="mini" @change="val=>updateLevel(scope.row, val)" style="width:120px">
                <el-option label="青铜" value="bronze" />
                <el-option label="白银" value="silver" />
                <el-option label="黄金" value="gold" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="remainingCourses" label="剩余课时" width="100" />
          <el-table-column prop="totalAmount" label="累计消费(¥)" width="120">
            <template slot-scope="scope">{{ formatAmount(scope.row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column prop="lastCourseTime" label="最后上课时间" width="160">
            <template slot-scope="scope">{{ formatDate(scope.row.lastCourseTime) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">{{ statusText(scope.row.status) }}</template>
          </el-table-column>
          <el-table-column label="地区" min-width="160">
            <template slot-scope="scope">{{ [scope.row.province, scope.row.city, scope.row.district].filter(Boolean).join(' / ') }}</template>
          </el-table-column>
          <el-table-column label="家长" min-width="200">
            <template slot-scope="scope">
              <span v-if="(scope.row.parents||[]).length===0">-</span>
              <span v-else>
                <el-tag v-for="p in scope.row.parents" :key="p.id" size="mini" style="margin:2px">{{ p.parentName }}（{{ p.phone||'-' }}）</el-tag>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="warning" @click="sendRechargeReminder(scope.row)">续费提醒</el-button>
              <el-button size="mini" @click="goComplaint(scope.row)">投诉处理</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStudentList } from '@/api/student'
import request from '@/utils/request'
export default {
  name: 'StudentList',
  data(){
    return {
      loading: false,
      searchForm: {
        studentName: '',
        phone: '',
        studentLevel: '',
        status: null
      },
      studentList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted(){ this.fetch() },
  methods: {
    async fetch(){
      this.loading = true
      try{
        const params = { ...this.searchForm, pageNum: this.currentPage, pageSize: this.pageSize }
        const res = await getStudentList(params)
        const page = res.data || res
        this.studentList = page.list || []
        this.total = page.total || 0
      } finally { this.loading = false }
    },
    handleSearch(){ this.currentPage = 1; this.fetch() },
    resetSearch(){ this.searchForm = { studentName:'', phone:'', studentLevel:'', status: null }; this.handleSearch() },
    handleSizeChange(val){ this.pageSize = val; this.currentPage = 1; this.fetch() },
    handleCurrentChange(val){ this.currentPage = val; this.fetch() },
    levelText(v){ const m={ bronze:'青铜', silver:'白银', gold:'黄金' }; return m[v] || '-' },
    statusText(v){ const m={ 1:'在读', 2:'暂停', 3:'毕业', 0:'禁用' }; return m[v] || '-' },
    formatAmount(v){ if(v==null) return '0.00'; const n=Number(v); return isNaN(n)?'0.00':n.toFixed(2) },
    formatDate(v){ if(!v) return '-'; try{ return new Date(v).toLocaleString('zh-CN') }catch(e){ return '-' } },
    async updateLevel(row, val){
      try{
        await this.$confirm(`确认将 ${row.studentName} 等级调整为 ${this.levelText(val)} 吗？`,'提示')
        await request({ url:'/student/update-level', method:'post', data:{ id: row.id, studentLevel: val } })
        this.$message.success('已更新');
      }catch(e){ /* 取消或失败 */ }
    },
    async sendRechargeReminder(row){
      try{
        await this.$confirm('将向学生及其家长发送“余额不足，请及时充值”提醒','续费提醒',{type:'warning'})
        // 后端以 /api/student/send-renewal-reminder 为准
        const r = await request({ url:'/student/send-renewal-reminder', method:'post', data:{ studentId: row.id } })
        if (r && (r.code===200 || r.success===true)) this.$message.success('提醒已发送')
        else this.$message.warning((r&&r.message)||'提醒发送状态未知')
      }catch(e){}
    },
    goComplaint(row){
      if(!row.phone){ this.$message.error('学生手机号缺失，无法跳转投诉处理'); return }
      const host = process.env.VUE_APP_COMPLAINT_URL || '/complaint/'
      const full = host.startsWith('http') ? `${host}?phone=${encodeURIComponent(row.phone)}` : `${host}?phone=${encodeURIComponent(row.phone)}`
      window.open(full,'_blank')
    }
  }
}
</script>

<style scoped>
.search-bar{ margin-bottom:20px; padding:20px; background:#f5f7fa; border-radius:4px }
.pagination-container{ margin-top:20px; text-align:center }
</style>


