<template>
  <div class="complaint-manage">
    <div class="filter-container">
      <el-form :inline="true" :model="query" class="demo-form-inline">
        <el-form-item label="投诉状态">
          <el-select v-model="query.complaintStatus" clearable placeholder="全部" style="width: 160px">
            <el-option label="待处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="已解决" value="2" />
            <el-option label="已关闭" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="投诉类型">
          <el-select v-model="query.complaintType" clearable placeholder="全部" style="width: 160px">
            <el-option label="服务态度" value="service" />
            <el-option label="教学质量" value="quality" />
            <el-option label="时间安排" value="time" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList"><i class="el-icon-search"></i> 查询</el-button>
          <el-button @click="reset"><i class="el-icon-refresh"></i> 重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="list" v-loading="loading" border style="width:100%">
      <el-table-column prop="complaintNo" label="投诉编号" width="160" />
      <el-table-column prop="complainantName" label="投诉人" width="120" />
      <el-table-column prop="complainedName" label="被投诉人" width="120" />
      <el-table-column prop="complaintType" label="投诉类型" width="100">
        <template slot-scope="scope">
          {{ complaintTypeText(scope.row.complaintType) }}
        </template>
      </el-table-column>
      <el-table-column prop="complaintTitle" label="投诉标题" width="200" show-overflow-tooltip />
      <el-table-column prop="complaintContent" label="投诉内容" width="240" show-overflow-tooltip />
      <el-table-column prop="complaintStatus" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.complaintStatus)" size="small">{{ statusText(scope.row.complaintStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="投诉时间" width="180">
        <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleComplaint(scope.row)" :disabled="scope.row.complaintStatus===2 || scope.row.complaintStatus===3">处理</el-button>
          <!-- <el-button size="mini" type="success" @click="resolveComplaint(scope.row)" :disabled="scope.row.complaintStatus===2 || scope.row.complaintStatus===3">解决</el-button> -->
          <el-button size="mini" type="info" @click="viewDetail(scope.row)">详情</el-button>
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

    <!-- 投诉处理对话框 -->
    <el-dialog title="投诉处理" :visible.sync="dialogVisible" width="60%">
      <el-form :model="complaintForm" label-width="120px">
        <el-form-item label="投诉编号">
          <el-input v-model="complaintForm.complaintNo" readonly />
        </el-form-item>
        <el-form-item label="投诉人">
          <el-input v-model="complaintForm.complainantName" readonly />
        </el-form-item>
        <el-form-item label="被投诉人">
          <el-input v-model="complaintForm.complainedName" readonly />
        </el-form-item>
        <el-form-item label="投诉类型">
          <el-input v-model="complaintForm.complaintTypeText" readonly />
        </el-form-item>
        <el-form-item label="投诉标题">
          <el-input v-model="complaintForm.complaintTitle" readonly />
        </el-form-item>
        <el-form-item label="投诉内容">
          <el-input v-model="complaintForm.complaintContent" type="textarea" readonly :rows="4" />
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input v-model="complaintForm.processResult" type="textarea" :rows="4" placeholder="请输入处理结果" />
        </el-form-item>
        <el-form-item label="满意度评分">
          <el-rate v-model="complaintForm.satisfactionScore" show-score />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">提交处理</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import { getComplaintList, getComplaintDetail, processComplaint } from '@/api/operation'

export default {
  name: 'Complaint',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      query: {
        page: 1,
        size: 10,
        complaintStatus: '',
        complaintType: ''
      },
      dialogVisible: false,
      complaintForm: {
        id: '',
        complaintNo: '',
        complainantName: '',
        complainedName: '',
        complaintTypeText: '',
        complaintTitle: '',
        complaintContent: '',
        processResult: '',
        satisfactionScore: 0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const res = await getComplaintList(this.query)
        if (res && res.code === 200) {
          const data = res.data || {}
          this.list = data.items || data.list || []
          this.total = data.total || 0
        }
      } catch (error) {
        console.error('获取投诉列表失败', error)
      } finally {
        this.loading = false
      }
    },

    async handleComplaint(row) {
      this.complaintForm = {
        id: row.id,
        complaintNo: row.complaintNo,
        complainantName: row.complainantName,
        complainedName: row.complainedName,
        complaintTypeText: this.complaintTypeText(row.complaintType),
        complaintTitle: row.complaintTitle,
        complaintContent: row.complaintContent,
        processResult: '',
        satisfactionScore: 0
      }
      this.dialogVisible = true
    },

    async submitProcess() {
      try {
        await processComplaint(this.complaintForm.id, {
          processResult: this.complaintForm.processResult,
          satisfactionScore: this.complaintForm.satisfactionScore
        })
        this.$message.success('投诉处理成功')
        this.dialogVisible = false
        this.getList()
      } catch (error) {
        console.error('提交处理失败', error)
        this.$message.error('提交处理失败')
      }
    },

    async resolveComplaint(row) {
      try {
        await this.$confirm('确认解决此投诉吗？', '提示')
        const res = await request({
          url: `/operation/complaints/${row.id}/resolve`,
          method: 'post'
        })
        if (res && res.code === 200) {
          this.$message.success('投诉已解决')
          this.getList()
        }
      } catch (error) {
        console.error('解决投诉失败', error)
      }
    },

    async viewDetail(row) {
      try {
        const res = await getComplaintDetail(row.id)
        if (res && res.code === 200) {
          const detail = res.data
          this.$alert(`
            <div style="text-align: left;">
              <p><strong>投诉编号：</strong>${detail.complaintNo}</p>
              <p><strong>投诉人：</strong>${detail.complainantName}</p>
              <p><strong>被投诉人：</strong>${detail.complainedName}</p>
              <p><strong>投诉类型：</strong>${this.complaintTypeText(detail.complaintType)}</p>
              <p><strong>投诉标题：</strong>${detail.complaintTitle}</p>
              <p><strong>投诉内容：</strong>${detail.complaintContent}</p>
              <p><strong>处理结果：</strong>${detail.processResult || '暂无'}</p>
              <p><strong>满意度评分：</strong>${detail.satisfactionScore || '未评分'}</p>
            </div>
          `, '投诉详情', {
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true
          })
        }
      } catch (error) {
        console.error('获取投诉详情失败', error)
        this.$message.error('获取投诉详情失败')
      }
    },

    complaintTypeText(type) {
      const typeMap = {
        'service': '服务态度',
        'quality': '教学质量',
        'time': '时间安排',
        'other': '其他'
      }
      return typeMap[type] || type
    },

    statusTagType(status) {
      const typeMap = {
        0: 'warning', // 待处理
        1: 'info',    // 处理中
        2: 'success', // 已解决
        3: 'danger'   // 已关闭
      }
      return typeMap[status] || 'info'
    },

    statusText(status) {
      const textMap = {
        0: '待处理',
        1: '处理中',
        2: '已解决',
        3: '已关闭'
      }
      return textMap[status] || status
    },

    formatDate(ts) {
      if (!ts) return '-'
      return new Date(ts.toString().replace('T',' ').replace(/-/g,'/')).toLocaleString('zh-CN')
    },

    reset() {
      this.query = {
        page: 1,
        size: 10,
        complaintStatus: '',
        complaintType: ''
      }
      this.getList()
    }
  }
}
</script>

<style scoped>
.complaint-manage {
  padding: 20px;
}

.filter-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination-container {
  background: #fff;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: center;
}
</style>