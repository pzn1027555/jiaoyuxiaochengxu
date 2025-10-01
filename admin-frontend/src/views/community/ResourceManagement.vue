<template>
  <div class="page-container">
    <div class="content-box">
      <h2>资源管理</h2>
      
      <el-tabs v-model="activeSource" @tab-click="handleSourceChange" class="mb-10">
        <el-tab-pane label="社区资源" name="community"></el-tab-pane>
        <el-tab-pane label="教师资源" name="teacher"></el-tab-pane>
      </el-tabs>
      
      <!-- 搜索筛选 -->
      <el-form :model="queryForm" :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="搜索标题和描述" clearable style="width: 200px"></el-input>
        </el-form-item>
        
        <el-form-item label="上传者">
          <el-input v-model="queryForm.uploaderName" placeholder="请输入上传者姓名" clearable style="width: 150px"></el-input>
        </el-form-item>
        
        <el-form-item label="学科" v-if="activeSource === 'community'">
          <el-select v-model="queryForm.subject" placeholder="请选择学科" clearable style="width: 120px">
            <el-option label="数学" value="math"></el-option>
            <el-option label="物理" value="physics"></el-option>
            <el-option label="化学" value="chemistry"></el-option>
            <el-option label="生物" value="biology"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 批量操作 -->
      <div class="toolbar">
        <div class="toolbar-left">
          
          <el-button 
            v-if="activeSource === 'community'"
            type="success" 
            @click="openCreateDialog" 
            icon="el-icon-upload">
            发布
          </el-button>
          
        </div>
        
        <div class="toolbar-right">
          <el-button type="text" @click="handleRefresh" icon="el-icon-refresh">刷新</el-button>
        </div>
      </div>
      
      <!-- 资源列表 -->
      <el-table 
        :data="resourceList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border>
        <el-table-column type="selection" width="55"></el-table-column>
        
        <el-table-column prop="title" label="标题" >
          <template slot-scope="scope">
            <el-link type="primary" @click="viewResourceDetail(scope.row)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="uploaderName" label="上传者" width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.uploaderName }}</div>
          </template>
        </el-table-column>

        <el-table-column v-if="activeSource === 'teacher'" label="资源类型" width="120">
          <template slot-scope="scope">
            {{ getResourceTypeText(scope.row.fileType) }}
          </template>
        </el-table-column>

        <el-table-column v-if="activeSource === 'teacher'" label="描述" min-width="240">
          <template slot-scope="scope">
            {{ scope.row.description || '-' }}
          </template>
        </el-table-column>
        
        <!-- <el-table-column label="资源信息" width="150">
          <template slot-scope="scope">
            <div>类型: {{ getResourceTypeText(scope.row.resourceType) }}</div>
            <div>来源: {{ getSourceText(scope.row.source) }}</div>
            <div>学科: {{ getSubjectText(scope.row.subject) }}</div>
          </template>
        </el-table-column> -->
        
        <!-- <el-table-column label="文件信息" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.fileName }}</div>
            <div style="color: #909399; font-size: 12px;">{{ getFileSizeText(scope.row.fileSize) }}</div>
          </template>
        </el-table-column> -->
        
        <!-- <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <div>
              <el-tag :type="getResourceStatusType(scope.row.resourceStatus)">
                {{ getResourceStatusText(scope.row.resourceStatus) }}
              </el-tag>
            </div>
            
          </template>
        </el-table-column> -->
        
        <el-table-column v-if="activeSource === 'community'" label="统计数据" width="120">
          <template slot-scope="scope">
            <div>下载: {{ scope.row.downloadCount || 0 }}</div>
            <div>浏览: {{ scope.row.viewCount || 0 }}</div>
            <div>点赞: {{ scope.row.likeCount || 0 }}</div>
            <div>评分: {{ formatRating(scope.row.avgRating) }}</div>
          </template>
        </el-table-column>
        
        <el-table-column v-if="activeSource === 'community'" label="价格信息" width="100">
          <template slot-scope="scope">
            <div v-if="scope.row.isFree">
              <el-tag type="success" size="mini">免费</el-tag>
            </div>
            <div v-else-if="scope.row.requirePoints">
              <el-tag type="warning" size="mini">{{ scope.row.pointsRequired }}积分</el-tag>
            </div>
            <div v-else>
              <el-tag type="primary" size="mini">¥{{ formatAmount(scope.row.price) }}</el-tag>
            </div>
          </template>
        </el-table-column>
        
        
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" :width="activeSource==='teacher'? 120 : 280" fixed="right">
          <template slot-scope="scope">
            <template v-if="activeSource === 'teacher'">
              <el-button type="text" size="mini" style="color: #F56C6C;" @click="deleteResource(scope.row)">删除</el-button>
            </template>
            <template v-else>
              <el-button type="text" size="mini" @click="viewResourceDetail(scope.row)">查看详情</el-button>
              <el-button type="text" size="mini" @click="openEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="downloadResource(scope.row)">下载资源</el-button>
              <el-button type="text" size="mini" style="color: #F56C6C;" @click="deleteResource(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
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
    
    <!-- 资源详情弹窗 -->
    <el-dialog title="资源详情" :visible.sync="detailDialogVisible" width="800px">
      <div v-if="resourceDetail">
        <h3>{{ resourceDetail.title }}</h3>
        <p><strong>上传者:</strong> {{ resourceDetail.uploaderName }}</p>
        <p><strong>资源类型:</strong> {{ getResourceTypeText(resourceDetail.resourceType || resourceDetail.fileType) }}</p>
        <p><strong>创建时间:</strong> {{ formatDateTime(resourceDetail.createTime) }}</p>
        <div v-if="resourceDetail.coverUrl" style="margin-top: 10px;">
          <strong>封面:</strong>
          <div style="margin-top: 10px;">
            <el-image :src="normalizeUrl(resourceDetail.coverUrl)" style="width: 240px; height: 135px" fit="cover" />
          </div>
        </div>
        <div v-if="activeSource === 'community'" style="margin-top: 20px;">
          <strong>描述:</strong>
          <div style="margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            {{ resourceDetail.description }}
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="openEditFromDetail">编辑</el-button>
      </span>
    </el-dialog>
    
    <!-- 创建社区资源弹窗 -->
    <el-dialog title="发布社区资源" :visible.sync="createDialogVisible" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="createForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="4" v-model="createForm.description" placeholder="资源描述（可选）"></el-input>
        </el-form-item>
        
        <el-form-item label="价格(元)">
          <el-input v-model.number="createForm.price" type="number" min="0" placeholder="如需收费请输入价格"></el-input>
        </el-form-item>
        <el-form-item label="文件上传">
          <el-upload
            class="upload-block"
            :action="dummyAction"
            :http-request="uploadFile"
            :accept="acceptFiles"
            :limit="1"
            :on-success="handleFileSuccess"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            :show-file-list="true">
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">支持 pdf/doc/docx/ppt/pptx/mp4 等</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="封面上传">
          <el-upload
            class="cover-uploader"
            :action="dummyAction"
            :http-request="uploadCover"
            accept="image/*"
            :limit="1"
            :on-success="handleCoverSuccess"
            :on-remove="handleCoverRemove"
            :file-list="coverList"
            list-type="picture-card">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件类型">
          <el-select v-model="createForm.fileType" placeholder="选择类型">
            <el-option label="文档" value="document"></el-option>
            <el-option label="视频" value="video"></el-option>
            <el-option label="音频" value="audio"></el-option>
            <el-option label="图片" value="image"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitCreate">发布</el-button>
      </div>
    </el-dialog>

    <!-- 编辑资源弹窗 -->
    <el-dialog title="编辑资源" :visible.sync="editDialogVisible" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="4" v-model="editForm.description" placeholder="资源描述（可选）"></el-input>
        </el-form-item>

        <el-form-item label="价格(元)" v-if="activeSource === 'community'">
          <el-input v-model.number="editForm.price" type="number" min="0" placeholder="如需收费请输入价格"></el-input>
        </el-form-item>

        <el-form-item label="文件上传">
          <el-upload
            class="upload-block"
            :action="dummyAction"
            :http-request="uploadFile"
            :accept="acceptFiles"
            :limit="1"
            :on-success="handleEditFileSuccess"
            :on-remove="handleEditFileRemove"
            :file-list="editFileList"
            :show-file-list="true">
            <el-button size="small" type="primary">更换文件</el-button>
            <div slot="tip" class="el-upload__tip">支持 pdf/doc/docx/ppt/pptx/mp4 等</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="封面上传">
          <el-upload
            class="cover-uploader"
            :action="dummyAction"
            :http-request="uploadCover"
            accept="image/*"
            :limit="1"
            :on-success="handleEditCoverSuccess"
            :on-remove="handleEditCoverRemove"
            :file-list="editCoverList"
            list-type="picture-card">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件类型">
          <el-select v-model="editForm.fileType" placeholder="选择类型">
            <el-option label="文档" value="document"></el-option>
            <el-option label="资料" value="material"></el-option>
            <el-option label="视频" value="video"></el-option>
            <el-option label="音频" value="audio"></el-option>
            <el-option label="图片" value="image"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="submitEdit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getResourceList, 
  getResourceDetail, 
  deleteResource,
  downloadResource,
  updateResource
} from '@/api/community'
import request from '@/utils/request'

export default {
  name: 'ResourceManagement',
  data() {
    return {
      loading: false,
      resourceList: [],
      total: 0,
      selectedResources: [],
      statistics: {},
      activeSource: 'community',
      
      queryForm: {
        keyword: '',
        uploaderName: '管理员',
        resourceType: '',
        source: 'community',
        subject: '',
        resourceStatus: null,
        pageNum: 1,
        pageSize: 20
      },
      
      detailDialogVisible: false,
      resourceDetail: null,
      
      auditDialogVisible: false,
      auditLoading: false,
      auditForm: {
        id: null,
        auditStatus: 1,
        auditRemark: ''
      },
      createDialogVisible: false,
      createLoading: false,
      createForm: {
        title: '',
        description: '',
        uploaderName: '',
        price: null,
        fileUrl: '',
        coverUrl: '',
        fileType: ''
      },
      acceptFiles: '.pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mkv,.flv,.wmv',
      fileList: [],
      coverList: [],

      editDialogVisible: false,
      editLoading: false,
      editForm: {
        id: null,
        title: '',
        description: '',
        uploaderName: '',
        price: null,
        fileUrl: '',
        coverUrl: '',
        fileType: ''
      },
      editFileList: [],
      editCoverList: [],
      // 兼容 el-upload 必填 action，但实际使用 :http-request 自定义上传
      dummyAction: 'about:blank'
    }
  },
  
  created() {
    this.loadResourceList()
  },
  watch: {
    activeSource() {
      this.handleSourceChange()
    }
  },
  
  methods: {
    handleSourceChange(){
      this.queryForm.source = this.activeSource
      this.queryForm.pageNum = 1
      this.loadResourceList()
    },
    async loadResourceList() {
      this.loading = true
      try {
        const response = await getResourceList({ ...this.queryForm, source: this.activeSource })
        if (response.code === 200) {
          // 正常化字段名（不同来源字段略有差异）
          this.resourceList = (response.data.list || []).map(it => ({
            ...it,
            resourceStatus: it.resourceStatus != null ? it.resourceStatus : (it.status != null ? it.status : 1),
            fileType: it.fileType || it.type
          }))
          this.total = response.data.total
        }
      } catch (error) {
        this.$message.error('加载资源列表失败')
      } finally {
        this.loading = false
      }
    },
    async downloadResource(row) {
      try {
        const response = await downloadResource(row.id, 1, this.activeSource)
        if (response.code === 200 && response.data && response.data.url) {
          const url = response.data.url
          // 统一通过后端接口访问静态资源
          const full = this.normalizeUrl(url)
          window.open(full, '_blank')
        } else {
          this.$message.error('未获取到下载链接')
        }
      } catch (error) {
        this.$message.error('下载失败')
      }
    },
    
    
    handleSearch() {
      this.queryForm.pageNum = 1
      this.loadResourceList()
    },
    
    handleReset() {
      this.queryForm = {
        keyword: '',
        uploaderName: '',
        resourceType: '',
        source: 'community',
        subject: '',
        resourceStatus: null,
        pageNum: 1,
        pageSize: 20
      }
      this.loadResourceList()
    },
    
    handleRefresh() {
      this.loadResourceList()
      
    },
    
    handleSizeChange(val) {
      this.queryForm.pageSize = val
      this.queryForm.pageNum = 1
      this.loadResourceList()
    },
    
    handleCurrentChange(val) {
      this.queryForm.pageNum = val
      this.loadResourceList()
    },
    
    handleSelectionChange(selection) {
      this.selectedResources = selection
    },
    
    async viewResourceDetail(row) {
      try {
        const response = await getResourceDetail(row.id, this.activeSource)
        if (response.code === 200) {
          this.resourceDetail = response.data
          this.detailDialogVisible = true
        }
      } catch (error) {
        this.$message.error('获取资源详情失败')
      }
    },

    async openEdit(row){
      try{
        const resp = await getResourceDetail(row.id, this.activeSource)
        if(resp.code === 200){
          const d = resp.data || {}
          this.editForm = {
            id: d.id,
            title: d.title || '',
            description: d.description || '',
            uploaderName: d.uploaderName || '管理员',
            price: d.price != null ? d.price : null,
            fileUrl: d.fileUrl || '',
            coverUrl: d.coverUrl || '',
            fileType: d.fileType || d.type || ''
          }
          this.editFileList = this.editForm.fileUrl ? [{ name: this.editForm.title || '文件', url: this.normalizeUrl(this.editForm.fileUrl) }] : []
          this.editCoverList = this.editForm.coverUrl ? [{ name: '封面', url: this.normalizeUrl(this.editForm.coverUrl) }] : []
          this.editDialogVisible = true
        }
      }catch(e){
        this.$message.error('打开编辑失败')
      }
    },
    openEditFromDetail(){
      if(!this.resourceDetail){ return }
      const d = this.resourceDetail
      this.editForm = {
        id: d.id,
        title: d.title || '',
        description: d.description || '',
        uploaderName: d.uploaderName || '管理员',
        price: d.price != null ? d.price : null,
        fileUrl: d.fileUrl || '',
        coverUrl: d.coverUrl || '',
        fileType: d.fileType || d.type || ''
      }
      this.editFileList = this.editForm.fileUrl ? [{ name: this.editForm.title || '文件', url: this.normalizeUrl(this.editForm.fileUrl) }] : []
      this.editCoverList = this.editForm.coverUrl ? [{ name: '封面', url: this.normalizeUrl(this.editForm.coverUrl) }] : []
      this.editDialogVisible = true
    },
    async submitEdit(){
      if(!this.editForm.id || !this.editForm.title){
        this.$message.warning('请填写标题')
        return
      }
      this.editLoading = true
      try{
        const payload = { ...this.editForm, source: this.activeSource }
        const res = await updateResource(payload)
        if(res.code === 200){
          this.$message.success('保存成功')
          this.editDialogVisible = false
          // 若在详情弹窗中发起编辑，更新详情
          if(this.detailDialogVisible && this.resourceDetail && this.resourceDetail.id === this.editForm.id){
            this.resourceDetail = { ...this.resourceDetail, ...this.editForm }
          }
          this.loadResourceList()
        }
      }catch(e){
        this.$message.error('保存失败')
      }finally{
        this.editLoading = false
      }
    },
    
    
    async batchPublish() {
      this.$message.info('批量发布功能开发中')
    },
    
    
    async deleteResource(row) {
      try {
        await this.$confirm('确认删除该资源？将被标记为删除', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 二次确认
        await this.$confirm('再次确认删除该资源？此操作不可恢复', '二次确认', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await deleteResource(row.id, this.activeSource)
        if (response.code === 200) {
          this.$message.success('已删除')
          this.loadResourceList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    openCreateDialog() {
      this.createForm = { title: '', description: '', uploaderName: '管理员', price: null, fileUrl: '', coverUrl: '', fileType: '' }
      this.fileList = []
      this.coverList = []
      this.createDialogVisible = true
    },
    async submitCreate() {
      if (!this.createForm.title || !this.createForm.fileUrl) {
        this.$message.warning('请填写标题与文件URL')
        return
      }
      // 规范化文件/封面 URL，避免后端接收到完整域名导致拼接重复
      const payload = { ...this.createForm }
      payload.fileUrl = this.stripApiBase(payload.fileUrl)
      payload.coverUrl = this.stripApiBase(payload.coverUrl)
      this.createLoading = true
      try {
        const res = await request({
          url: '/community/resources/create',
          method: 'post',
          data: payload
        })
        if (res.code === 200) {
          this.$message.success('发布成功')
          this.createDialogVisible = false
          this.loadResourceList()
        }
      } catch (e) {
        this.$message.error('发布失败')
      } finally {
        this.createLoading = false
      }
    },
    async uploadFile(req){
      try{
        if(!req || !req.file){
          req?.onError?.(new Error('请选择文件'))
          return
        }
        const formData = new FormData()
        formData.append('file', req.file)
        const res = await request({ url: '/mini/upload/file', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
        if(res && res.code === 200 && res.data){
          req.onSuccess(res, req.file)
        }else{
          req.onError(new Error(res?.message || '上传失败'))
        }
      }catch(e){
        req.onError(e)
      }
    },
    async uploadCover(req){
      try{
        if(!req || !req.file){
          req?.onError?.(new Error('请选择图片'))
          return
        }
        if(req.file.type && !/^image\//i.test(req.file.type)){
          req.onError(new Error('封面仅支持图片格式'))
          return
        }
        const formData = new FormData()
        formData.append('file', req.file)
        const res = await request({ url: '/mini/upload/file', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
        if(res && res.code === 200 && res.data){
          req.onSuccess(res, req.file)
        }else{
          req.onError(new Error(res?.message || '上传失败'))
        }
      }catch(e){
        req.onError(e)
      }
    },
    handleFileSuccess(resp, file) {
      if (resp && resp.code === 200 && resp.data) {
        this.createForm.fileUrl = resp.data.url
        // 若后端生成封面则自动带出
        if (resp.data.coverUrl) this.createForm.coverUrl = resp.data.coverUrl
        // 猜测文件类型（简单根据扩展名）
        const name = (resp.data.url || '').toLowerCase()
        if (name.match(/\.(pdf|doc|docx|ppt|pptx)$/)) this.createForm.fileType = 'document'
        else if (name.match(/\.(mp4|mov|avi|mkv|flv|wmv)$/)) this.createForm.fileType = 'video'
        else this.createForm.fileType = 'other'
        // 展示时需要绝对路径
        this.fileList = [{ name: file.name || '文件', url: this.normalizeUrl(this.createForm.fileUrl) }]
      }
    },
    handleFileRemove() {
      this.createForm.fileUrl = ''
      this.fileList = []
    },
    handleCoverSuccess(resp, file) {
      if (resp && resp.code === 200 && resp.data) {
        this.createForm.coverUrl = resp.data.url
        this.coverList = [{ name: '封面', url: this.normalizeUrl(this.createForm.coverUrl) }]
      }
    },
    handleCoverRemove() {
      this.createForm.coverUrl = ''
      this.coverList = []
    },

    handleEditFileSuccess(resp, file){
      if (resp && resp.code === 200 && resp.data) {
        this.editForm.fileUrl = resp.data.url
        // 简单识别文件类型
        const name = (resp.data.url || '').toLowerCase()
        if (name.match(/\.(pdf|doc|docx|ppt|pptx)$/)) this.editForm.fileType = 'document'
        else if (name.match(/\.(mp4|mov|avi|mkv|flv|wmv)$/)) this.editForm.fileType = 'video'
        else this.editForm.fileType = this.editForm.fileType || 'other'
        this.editFileList = [{ name: file.name || '文件', url: this.normalizeUrl(this.editForm.fileUrl) }]
      }
    },
    handleEditFileRemove(){
      this.editForm.fileUrl = ''
      this.editFileList = []
    },
    handleEditCoverSuccess(resp, file){
      if (resp && resp.code === 200 && resp.data) {
        this.editForm.coverUrl = resp.data.url
        this.editCoverList = [{ name: '封面', url: this.normalizeUrl(this.editForm.coverUrl) }]
      }
    },
    handleEditCoverRemove(){
      this.editForm.coverUrl = ''
      this.editCoverList = []
    },
    
    // 辅助方法
    normalizeUrl(url){
      if (!url) return ''
      if (/^https?:\/\//.test(url)) return url
      const path = url.startsWith('/') ? url : `/${url}`
      const apiBase = process.env.VUE_APP_BASE_API || '/api'
      return `${apiBase}${path}`
    },
    stripApiBase(url){
      if(!url) return ''
      const apiBase = process.env.VUE_APP_BASE_API || '/api'
      // 只移除以 apiBase 开头的前缀，保存后端存储的相对路径
      if(url.startsWith(apiBase)){
        return url.slice(apiBase.length)
      }
      // 也可能是完整域名拼接了 /api
      try{
        const u = new URL(url)
        const p = u.pathname
        return p.startsWith(apiBase) ? p.slice(apiBase.length) : p
      }catch(e){
        return url
      }
    },
    formatDateTime(dateTime) {
      return dateTime ? new Date(dateTime).toLocaleString() : '-'
    },
    
    formatAmount(amount) {
      return amount ? Number(amount).toFixed(2) : '0.00'
    },
    
    formatRating(rating) {
      return rating ? Number(rating).toFixed(1) : '0.0'
    },
    
    getFileSizeText(size) {
      if (!size || size === 0) return '0 B'
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let unitIndex = 0
      let fileSize = Number(size)
      
      while (fileSize >= 1024 && unitIndex < units.length - 1) {
        fileSize /= 1024
        unitIndex++
      }
      
      return fileSize.toFixed(2) + ' ' + units[unitIndex]
    },
    
    getResourceStatusText(status) {
      const texts = { 0: '草稿', 1: '待审核', 2: '已发布', 3: '已下架', 4: '已删除' }
      return texts[status] || '未知状态'
    },
    
    getResourceStatusType(status) {
      const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'info' }
      return types[status] || ''
    },
    
    
    getResourceTypeText(type) {
      const texts = { 
        'document': '文档', 'material': '资料', 'video': '视频', 'audio': '音频', 
        'image': '图片', 'course': '课程', 'other': '其他' 
      }
      return texts[type] || '文档'
    },
    
    getSourceText(source) {
      const texts = { 'community': '社区', 'teacher': '教师' }
      return texts[source] || '社区'
    },
    
    getSubjectText(subject) {
      const texts = { 
        'math': '数学', 'physics': '物理', 'chemistry': '化学', 
        'biology': '生物', 'other': '其他' 
      }
      return texts[subject] || '数学'
    },
    
    getUploaderTypeText(type) {
      const texts = { 'student': '学生', 'teacher': '教师', 'admin': '管理员' }
      return texts[type] || '学生'
    },
    
    getUploaderTypeColor(type) {
      const colors = { 'student': '', 'teacher': 'success', 'admin': 'warning' }
      return colors[type] || ''
    },
    
    getViolationTypeText(type) {
      const texts = { 
        'copyright': '版权问题', 
        'inappropriate': '不当内容', 
        'virus': '病毒文件', 
        'other': '其他' 
      }
      return texts[type] || ''
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .toolbar-left {
    display: flex;
    gap: 8px;
  }
}
</style>