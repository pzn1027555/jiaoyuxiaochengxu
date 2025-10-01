<template>
  <div class="page-container">
    <div class="content-box">
      <h2>订单管理</h2>
      
      
      
      <!-- 搜索筛选 -->
      <el-form :model="queryForm" :inline="true" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="queryForm.orderNo" placeholder="请输入订单号" clearable style="width: 180px"></el-input>
        </el-form-item>
        
        <el-form-item label="学生姓名">
          <el-input v-model="queryForm.studentName" placeholder="请输入学生姓名" clearable style="width: 150px"></el-input>
        </el-form-item>
        
        <el-form-item label="订单状态">
          <el-select v-model="queryForm.orderStatus" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待支付" :value="1"></el-option>
            <el-option label="已支付" :value="2"></el-option>
            <el-option label="已完成" :value="3"></el-option>
            <el-option label="已取消" :value="4"></el-option>
            <el-option label="已退款" :value="5"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 订单列表 -->
      <el-table 
        :data="orderList" 
        v-loading="loading"
        stripe
        border>
        
        <el-table-column prop="orderNo" label="订单号" width="180">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewOrderDetail(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="studentName" label="学生" width="100"></el-table-column>
        <el-table-column prop="teacherName" label="教师" width="100"></el-table-column>
        <el-table-column prop="courseName" label="课程名称" width="150" show-overflow-tooltip></el-table-column>
        
        <el-table-column label="金额信息" width="150">
          <template slot-scope="scope">
            <div style="color: #67C23A; font-weight: bold;">实付：¥{{ formatAmount(scope.row.actualAmount) }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="订单状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getOrderStatusType(scope.row.orderStatus)">
              {{ getOrderStatusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        
        <!-- <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="viewOrderDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column> -->
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryForm.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    
    <!-- 订单详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="800px">
      <div v-if="orderDetail">
        <p>订单号：{{ orderDetail.orderNo }}</p>
        <p>学生：{{ orderDetail.studentName }}</p>
        <p>教师：{{ orderDetail.teacherName }}</p>
        <p>课程：{{ orderDetail.courseName }}</p>
        <p>金额：¥{{ formatAmount(orderDetail.actualAmount) }}</p>
        <p>
          状态：
          <el-tag :type="getOrderStatusType(orderDetail.orderStatus)">
            {{ getOrderStatusText(orderDetail.orderStatus) }}
          </el-tag>
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderList, getOrderDetail, getOrderStatistics } from '@/api/finance'

export default {
  name: 'OrderManagement',
  data() {
    return {
      loading: false,
      orderList: [],
      total: 0,
      statistics: {},
      
      queryForm: {
        orderNo: '',
        studentName: '',
        orderStatus: null,
        pageNum: 1,
        pageSize: 20
      },
      
      detailDialogVisible: false,
      orderDetail: null
    }
  },
  
  created() {
    this.loadOrderList()
    this.loadStatistics()
  },
  
  methods: {
    async loadOrderList() {
      this.loading = true
      try {
        const response = await getOrderList(this.queryForm)
        if (response.code === 200) {
          // 规范字段名：将后端 snake_case 转为前端使用的 camelCase
          this.orderList = (response.data.list || []).map(it => ({
            ...it,
            orderStatus: it.orderStatus != null ? it.orderStatus : (it.order_status != null ? it.order_status : (it.status != null ? it.status : null)),
            paymentStatus: it.paymentStatus != null ? it.paymentStatus : (it.payment_status != null ? it.payment_status : null),
            originalAmount: it.originalAmount != null ? it.originalAmount : (it.totalAmount != null ? it.totalAmount : (it.total_amount != null ? it.total_amount : it.original_amount)),
            actualAmount: it.actualAmount != null ? it.actualAmount : (it.actual_amount != null ? it.actual_amount : null),
            createTime: it.createTime != null ? it.createTime : (it.create_time != null ? it.create_time : null),
            studentName: it.studentName != null ? it.studentName : it.student_name,
            teacherName: it.teacherName != null ? it.teacherName : it.teacher_name,
            courseName: it.courseName != null ? it.courseName : it.course_name
          }))
          this.total = response.data.total
        }
      } catch (error) {
        this.$message.error('加载订单列表失败')
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await getOrderStatistics()
        if (response.code === 200) {
          this.statistics = response.data
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    },
    
    handleSearch() {
      this.queryForm.pageNum = 1
      this.loadOrderList()
    },
    
    handleReset() {
      this.queryForm = {
        orderNo: '',
        studentName: '',
        orderStatus: null,
        pageNum: 1,
        pageSize: 20
      }
      this.loadOrderList()
    },
    
    handleSizeChange(val) {
      this.queryForm.pageSize = val
      this.queryForm.pageNum = 1
      this.loadOrderList()
    },
    
    handleCurrentChange(val) {
      this.queryForm.pageNum = val
      this.loadOrderList()
    },
    
    async viewOrderDetail(row) {
      try {
        const response = await getOrderDetail(row.id)
        if (response.code === 200) {
          this.orderDetail = response.data
          this.detailDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取订单详情失败')
      }
    },
    
    handleAction(row) {
      this.$message.info('操作功能开发中')
    },
    
    formatAmount(amount) {
      return amount ? Number(amount).toFixed(2) : '0.00'
    },
    
    formatPercent(percent) {
      return percent ? Number(percent).toFixed(2) : '0.00'
    },
    
    formatDateTime(dateTime) {
      return dateTime ? new Date(dateTime).toLocaleString() : '-'
    },
    
    getOrderStatusType(status) {
      const types = { 1: 'warning', 2: 'info', 3: 'success', 4: '', 5: 'danger' }
      return types[Number(status)] || ''
    },
    
    getOrderStatusText(status) {
      const texts = { 1: '待支付', 2: '已支付', 3: '已完成', 4: '已取消', 5: '已退款' }
      return texts[Number(status)] || '未知状态'
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    
    i {
      font-size: 24px;
      color: white;
    }
  }
  
  .stat-content {
    flex: 1;
    
    .stat-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }
  }
}
</style>