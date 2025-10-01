<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-input v-model="query.teacherId" placeholder="教师ID" style="width:200px;margin-right:12px" clearable />
        <el-input v-model="query.postId" placeholder="活动ID" style="width:200px;margin-right:12px" clearable />
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>
      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="createTime" label="报名时间" width="180"/>
        <el-table-column label="教师">
          <template slot-scope="scope">
            <span>{{ scope.row.teacherName || ('#'+scope.row.teacherId) }}</span>
            <span v-if="scope.row.teacherPhone" style="color:#999;margin-left:8px">{{ scope.row.teacherPhone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="postTitle" label="活动名"/>
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
import request from '@/utils/request'
export default {
  name: 'ResearchApplication',
  data(){
    return { query: { teacherId:'', postId:'' }, list: [], page:1, size:10, total:0 }
  },
  created(){ this.loadData() },
  methods: {
    async loadData(){
      const params = { page: this.page, size: this.size }
      if (this.query.teacherId) params.teacherId = this.query.teacherId
      if (this.query.postId) params.postId = this.query.postId
      const res = await request({ url: '/admin/research-application/list', method: 'get', params })
      const data = res.data || res
      const pageInfo = data.list ? data : (data.pageNum ? data : {})
      this.list = pageInfo.list || data || []
      this.total = pageInfo.total || 0
    },
    handlePageChange(p){ this.page = p; this.loadData() }
  }
}
</script>

<style scoped>
.filter-bar{ margin-bottom: 12px; }
.pagination{ margin-top: 16px; text-align: right; }
</style>


