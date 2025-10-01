<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="form-row">
        <el-input v-model="form.title" placeholder="活动标题" style="width:360px;margin-right:12px" />
        <el-button type="primary" @click="save">{{ form.id ? '保存修改' : '新建活动' }}</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button @click="loadList">刷新</el-button>
      </div>
      <el-input type="textarea" :rows="6" v-model="form.description" placeholder="活动简述（1000字以内）" />

      <el-table :data="list" stripe style="width:100%;margin-top:12px">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="title" label="标题"/>
        <el-table-column prop="publishTime" label="发布时间" width="180"/>
        <el-table-column label="上架" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="toggleStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" style="color:#f56c6c" @click="remove(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'ResearchPost',
  data(){
    return { form: { id:null, title:'', description:'' }, list: [] }
  },
  created(){ this.loadList() },
  methods: {
    async save(){
      const { id, title, description } = this.form
      if (!title) return this.$message.warning('请输入标题')
      if (id) await request({ url: `/admin/research-post/${id}`, method: 'put', data: { title, description, status: 1 } })
      else await request({ url: '/admin/research-post/create', method: 'post', data: { title, description, status: 1 } })
      this.$message.success('保存成功'); this.reset(); this.loadList()
    },
    async loadList(){
      const res = await request({ url: '/mini/research/list', method: 'get' })
      this.list = res.data || res || []
    },
    async toggleStatus(row){ await request({ url: `/admin/research-post/${row.id}`, method: 'put', data: { title: row.title, description: row.description, status: row.status } }); this.$message.success('状态已更新') },
    edit(row){ this.form = { id: row.id, title: row.title, description: row.description } },
    async remove(row){ await request({ url: `/admin/research-post/${row.id}`, method: 'delete' }); this.$message.success('删除成功'); this.loadList() },
    reset(){ this.form = { id:null, title:'', description:'' } }
  }
}
</script>

<style scoped>
.form-row{ margin-bottom: 12px; display:flex; align-items:center }
</style>


