<template>
  <div class="page-container">
    <div class="content-box">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="课程标题/教师/学生" class="mr8" clearable @clear="handleSearch" @keyup.enter.native="handleSearch" />
        <el-select v-model="query.classType" placeholder="班型" clearable class="mr8" @change="handleSearch">
          <el-option label="一对一" value="one_to_one" />
          <el-option label="小班课" value="small_class" />
          <el-option label="大班课" value="big_class" />
          <el-option label="体验课" value="trial" />
        </el-select>
        <el-date-picker v-model="query.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mr8" @change="handleSearch" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="list" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="title" label="课程标题" min-width="200"/>
        <el-table-column prop="teacherName" label="教师" width="140"/>
        <el-table-column prop="studentNames" label="学生" min-width="220">
          <template slot-scope="scope">
            <span>{{ (scope.row.studentNames||[]).join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="classTypeText" label="班型" width="100"/>
        <el-table-column prop="startTime" label="开始时间" width="160"/>
        <el-table-column prop="endTime" label="结束时间" width="160"/>
        <el-table-column prop="studentCount" label="人数" width="80"/>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="total"
          :page-size="query.pageSize"
          :current-page.sync="query.pageNum"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getScheduleList } from '@/api/schedule'

export default {
  name: 'CourseList',
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        classType: '',
        dateRange: []
      },
      list: [],
      total: 0,
      loading: false
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    handleSearch() {
      this.query.pageNum = 1
      this.loadData()
    },
    handleSizeChange(size) {
      this.query.pageSize = size
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          pageNum: this.query.pageNum,
          pageSize: this.query.pageSize,
          keyword: this.query.keyword || undefined,
          classType: this.query.classType || undefined,
          startDate: this.query.dateRange && this.query.dateRange[0] ? this.formatDate(this.query.dateRange[0]) : undefined,
          endDate: this.query.dateRange && this.query.dateRange[1] ? this.formatDate(this.query.dateRange[1]) : undefined
        }
        const res = await getScheduleList(params)
        const page = (res && (res.data || res.result || res))
        const items = (page && (page.list || page.items)) || []
        this.total = page && (page.total || page.totalCount || 0)
        this.list = items.map(it => ({
          id: it.id,
          title: it.title,
          teacherName: it.teacherName,
          studentNames: Array.isArray(it.studentNames) ? it.studentNames : (typeof it.studentNames === 'string' && it.studentNames ? it.studentNames.split(',') : []),
          classType: it.classType,
          classTypeText: this.classTypeText(it.classType),
          startTime: (it.startTime || '').toString().replace('T', ' ').slice(0, 16),
          endTime: (it.endTime || '').toString().replace('T', ' ').slice(0, 16),
          studentCount: typeof it.studentCount === 'number' ? it.studentCount : (it.studentNames ? it.studentNames.length : 0)
        }))
      } catch (e) {
        this.$message.error('加载失败')
      } finally {
        this.loading = false
      }
    },
    formatDate(d) {
      const dt = d instanceof Date ? d : new Date(d)
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const dd = String(dt.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    },
    classTypeText(t) {
      if (t === 'one_to_one') return '一对一'
          if (t === 'small_class') return '小班课'
          if (t === 'big_class') return '大班课'
          if (t === 'trial') return '体验课'
      return t || '-'
    }
  }
}
</script>

<style scoped>
.toolbar { margin-bottom: 12px; display: flex; align-items: center; }
.mr8 { margin-right: 8px; }
.pager { margin-top: 12px; text-align: right; }
</style>