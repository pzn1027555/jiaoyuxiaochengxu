<template>
  <div class="page-container">
    <div class="content-box">
      <h2>课程轮播图管理</h2>

      <div class="toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog()">新增轮播图</el-button>
        <el-button icon="el-icon-refresh" @click="loadList" :loading="loading">刷新</el-button>
      </div>

      <el-table :data="list" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="imageUrl" label="封面" width="180">
          <template slot-scope="scope">
            <el-image :src="normalizeUrl(scope.row.imageUrl)" style="width: 140px; height: 80px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="linkType" label="跳转类型" width="120">
          <template slot-scope="scope">
            {{ getLinkTypeText(scope.row.linkType) }}
          </template>
        </el-table-column>
        <el-table-column prop="linkValue" label="跳转地址/路径" min-width="220" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column prop="isEnabled" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isEnabled === 1 ? 'success' : 'info'">
              {{ scope.row.isEnabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="封面图片">
            <el-upload
              class="upload-block"
              :action="dummyAction"
              :http-request="uploadImage"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button size="small" type="primary">上传图片</el-button>
            </el-upload>
            <div v-if="form.imageUrl" class="preview">
              <el-image :src="normalizeUrl(form.imageUrl)" style="width: 200px; height: 110px" fit="cover" />
            </div>
          </el-form-item>
          <el-form-item label="跳转类型">
            <el-select v-model="form.linkType" placeholder="请选择" style="width: 100%">
              <el-option label="无" value="none" />
              <el-option label="小程序页面" value="miniapp" />
              <el-option label="外部链接" value="web" />
            </el-select>
          </el-form-item>
          <el-form-item label="跳转值" v-if="form.linkType !== 'none'">
            <el-input v-model="form.linkValue" placeholder="小程序路径或外部链接" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :step="1" style="width: 100%" />
          </el-form-item>
          <el-form-item label="是否启用">
            <el-switch v-model="form.isEnabled" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit" :loading="saving">保存</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { courseBannerApi } from '@/api/system'
import request from '@/utils/request'

export default {
  name: 'CourseBanner',
  data () {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      dialogTitle: '新增轮播图',
      saving: false,
      dummyAction: 'about:blank',
      form: this.getEmptyForm()
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    getEmptyForm () {
      return {
        id: null,
        title: '',
        imageUrl: '',
        linkType: 'none',
        linkValue: '',
        sortOrder: 0,
        isEnabled: 1
      }
    },
    async loadList () {
      this.loading = true
      try {
        const res = await courseBannerApi.list()
        if (res.code === 200) this.list = res.data || []
      } finally {
        this.loading = false
      }
    },
    openDialog (row) {
      if (row) {
        this.dialogTitle = '编辑轮播图'
        this.form = { ...row }
      } else {
        this.dialogTitle = '新增轮播图'
        this.form = this.getEmptyForm()
      }
      this.dialogVisible = true
    },
    async submit () {
      if (!this.form.imageUrl) {
        this.$message.warning('请上传封面图片')
        return
      }
      this.saving = true
      try {
        if (this.form.id) {
          await courseBannerApi.update(this.form.id, this.form)
        } else {
          await courseBannerApi.create(this.form)
        }
        this.$message.success('保存成功')
        this.dialogVisible = false
        this.loadList()
      } catch (e) {
        this.$message.error('保存失败')
      } finally {
        this.saving = false
      }
    },
    async handleDelete (row) {
      try {
        await this.$confirm('确认删除该轮播图？', '提示', { type: 'warning' })
        await courseBannerApi.remove(row.id)
        this.$message.success('删除成功')
        this.loadList()
      } catch (e) {
        if (e !== 'cancel') this.$message.error('删除失败')
      }
    },
    async uploadImage (req) {
      try {
        const fd = new FormData()
        fd.append('file', req.file)
        const res = await request({
          url: '/mini/upload/file',
          method: 'post',
          data: fd,
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (res && res.code === 200 && res.data) {
          this.form.imageUrl = res.data.url
          req.onSuccess(res, req.file)
        } else {
          req.onError(new Error('上传失败'))
        }
      } catch (e) {
        req.onError(e)
      }
    },
    normalizeUrl (url) {
      if (!url) return ''
      if (/^https?:\/\//.test(url)) return url
      const path = url.startsWith('/') ? url : `/${url}`
      const base = process.env.VUE_APP_BASE_API || '/api'
      return `${base}${path}`
    },
    getLinkTypeText (type) {
      const map = { none: '无', miniapp: '小程序页面', web: '外部链接' }
      return map[type] || '无'
    },
    formatDate (val) {
      if (!val) return ''
      return new Date(val).toLocaleString()
    }
  }
}
</script>

<style scoped>
.content-box {
  padding: 16px;
  background: #fff;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.preview {
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 6px;
  display: inline-block;
  background: #fafafa;
}
</style>


