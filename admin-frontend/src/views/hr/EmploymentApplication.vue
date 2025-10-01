<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-input v-model="query.teacherId" placeholder="教师ID" style="width:200px;margin-right:12px" clearable />
        <el-input v-model="query.postId" placeholder="岗位ID" style="width:200px;margin-right:12px" clearable />
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>
      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="createTime" label="申请时间" width="180"/>
        <el-table-column label="教师">
          <template slot-scope="scope">
            <span>{{ scope.row.teacherName || ('#'+scope.row.teacherId) }}</span>
            <span v-if="scope.row.teacherPhone" style="color:#999;margin-left:8px">{{ scope.row.teacherPhone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="postTitle" label="岗位"/>
        <el-table-column prop="resumeName" label="简历文件" width="220"/>
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="download(scope.row)">下载简历</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="page"
          :page-size="size"
          layout="prev, pager, next,total"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
  
</template>

<script>
import { employmentApplicationList } from '@/api/researchEmployment'

export default {
  name: 'EmploymentApplication',
  data() {
    return {
      query: { teacherId: '', postId: '' },
      list: [],
      page: 1,
      size: 10,
      total: 0
    }
  },
  created() { this.loadData() },
  methods: {
    async loadData(){
      const params = { page: this.page, size: this.size }
      if (this.query.teacherId) params.teacherId = this.query.teacherId
      if (this.query.postId) params.postId = this.query.postId
      const res = await employmentApplicationList(params)
      // 兼容后端返回结构 {code:200, data:{list, total}}
      const data = res.data || res
      const pageInfo = data.list ? data : (data.pageNum ? data : {})
      this.list = pageInfo.list || data || []
      this.total = pageInfo.total || 0
    },
    handlePageChange(p){ this.page = p; this.loadData() },
    download(row){
      if (!row.resumeUrl) return this.$message.warning('无下载地址')
      const base = process.env.VUE_APP_BASE_API || '/api'
      const url = row.resumeUrl.startsWith('http') ? row.resumeUrl : `${base}${row.resumeUrl}`
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped>
.filter-bar{ margin-bottom: 12px; }
.pagination{ margin-top: 16px; text-align: right; }
</style>


