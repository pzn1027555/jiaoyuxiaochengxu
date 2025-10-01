<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span>班课发布</span>
      </div>
      <el-form :model="form" :rules="rules" ref="form" label-width="110px" label-position="left">
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="form.teacherId" filterable placeholder="请选择教师" style="width: 360px" @visible-change="onTeacherDropdown">
            <el-option
              v-for="t in teacherOptions"
              :key="t.id"
              :label="t.teacherName + '（' + (t.phone||'-') + '）'"
              :value="t.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="科目" prop="subjectId">
          <el-cascader
            v-model="form.subjectPath"
            :options="subjectTree"
            :props="{ value: 'id', label: 'categoryName', children: 'children', checkStrictly: true }"
            clearable
            style="width: 360px"
            @change="onSubjectChange"
            placeholder="请选择科目（最多二级）"
          />
        </el-form-item>

        <el-form-item label="课程名称" prop="title">
          <el-input v-model="form.title" maxlength="50" show-word-limit style="width: 360px" placeholder="请输入课程名称" />
        </el-form-item>

        <el-form-item label="课时" prop="totalLessons">
          <el-input-number v-model="form.totalLessons" :min="1" :max="200" />
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>

        <el-form-item label="上课时间" prop="startTime">
          <el-time-picker v-model="form.startTime" placeholder="选择时间" value-format="HH:mm" format="HH:mm" />
        </el-form-item>

        <el-form-item label="单节时长(分钟)" prop="durationMinutes">
          <el-input-number v-model="form.durationMinutes" :min="30" :max="300" />
        </el-form-item>

        <el-form-item label="重复" prop="repeatType">
          <el-radio-group v-model="form.repeatType">
            <el-radio-button label="daily">每天</el-radio-button>
            <el-radio-button label="every3days">每三天</el-radio-button>
            <el-radio-button label="every5days">每五天</el-radio-button>
            <el-radio-button label="weekly">每周</el-radio-button>
            <el-radio-button label="monthly">每月</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="授课方式" prop="teachMode">
          <el-radio-group v-model="form.teachMode">
            <el-radio-button label="offline">线下</el-radio-button>
            <el-radio-button label="online">线上</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="封面图">
          <el-upload
            class="upload-demo"
            action="#"
            :http-request="uploadCover"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button size="small" type="primary">上传封面</el-button>
          </el-upload>
          <div v-if="form.coverUrl" class="cover-preview">
            <img :src="normalizeUrl(form.coverUrl)" alt="cover" />
          </div>
        </el-form-item>

        <el-form-item label="课程标签">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="输入后回车新增" style="width: 480px" />
        </el-form-item>

        <el-form-item label="课程介绍">
          <el-input type="textarea" :rows="4" v-model="form.intro" placeholder="请输入课程介绍" />
        </el-form-item>

        <el-form-item label="上课地址" v-if="form.teachMode==='offline'">
          <el-input v-model="form.address" style="width: 480px" placeholder="地址（可选）" />
          <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
            <el-input v-model="form.province" placeholder="省" style="width:120px" />
            <el-input v-model="form.city" placeholder="市" style="width:120px" />
            <el-input v-model="form.district" placeholder="区/县" style="width:120px" />
          </div>
          <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
            <el-input v-model="form.detailAddress" placeholder="详细地址" style="width:360px" />
            <el-input v-model="form.contactPhone" placeholder="联系电话（必填）" style="width:200px" />
          </div>
        </el-form-item>

        <el-form-item label="联系电话" v-if="form.teachMode!=='offline'" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="联系电话（必填）" style="width:200px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">发布</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import { getTeacherList } from '@/api/teacher'
import { courseCategoryApi } from '@/api/system'
import { createBigClassPlan } from '@/api/schedule'

export default {
  name: 'BigClassPublish',
  data(){
    return {
      form: {
        teacherId: null,
        subjectId: null,
        subjectName: '',
        subjectPath: [],
        title: '',
        totalLessons: 2,
        startDate: '',
        startTime: '',
        durationMinutes: 120,
        repeatType: 'daily',
        teachMode: 'offline',
        coverUrl: '',
        tags: [],
        intro: '',
        address: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        contactPhone: ''
      },
      rules: {
        teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
        title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
        totalLessons: [{ required: true, message: '请输入课时', trigger: 'change' }],
        startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择上课时间', trigger: 'change' }],
        contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
      },
      teacherOptions: [],
      subjectTree: [],
      submitting: false
    }
  },
  mounted(){
    this.loadTeachers()
    this.loadSubjects()
  },
  methods:{
    async loadTeachers(){
      try{
        const res = await getTeacherList({ pageNum:1, pageSize:200 })
        const list = (res && res.data && res.data.list) ? res.data.list : []
        this.teacherOptions = list
      }catch(e){}
    },
    async loadSubjects(){
      try{
        const res = await courseCategoryApi.tree()
        const convert = (nodes)=> (nodes||[]).map(n=>({
          id: n.id,
          categoryName: n.categoryName || n.name,
          children: convert(n.children)
        }))
        this.subjectTree = convert(res && res.data || [])
      }catch(e){}
    },
    onTeacherDropdown(){ if (!this.teacherOptions.length) this.loadTeachers() },
    onSubjectChange(path){
      if (Array.isArray(path) && path.length){
        // 限制为最多二级：若超过两级仅取前两级，选择的最后一级作为科目
        if (path.length > 2) {
          this.form.subjectPath = path.slice(0, 2)
        }
        this.form.subjectId = this.form.subjectPath[this.form.subjectPath.length-1]
        // 反查名称
        const findName = (arr, id)=>{
          for (let i=0;i<arr.length;i++){
            const n = arr[i];
            if (n.id === id) return n.categoryName
            const c = n.children && findName(n.children, id)
            if (c) return c
          }
          return ''
        }
        this.form.subjectName = findName(this.subjectTree, this.form.subjectId)
      } else {
        this.form.subjectId = null
        this.form.subjectName = ''
      }
    },
    normalizeUrl(url){
      if (!url) return ''
      const base = process.env.VUE_APP_BASE_API || ''
      if (/^https?:\/\//i.test(url)) return url
      return base.replace(/\/$/, '') + '/' + url.replace(/^\//,'')
    },
    async uploadCover(req){
      try{
        const formData = new FormData()
        formData.append('file', req.file)
        const res = await request({ url: '/mini/upload/file', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
        if(res && res.code === 200 && res.data){
          this.form.coverUrl = res.data.url
          this.$message.success('上传成功')
          req.onSuccess(res, req.file)
        }else{
          req.onError(new Error(res?.message || '上传失败'))
        }
      }catch(e){ req.onError(e) }
    },
    onReset(){ this.$refs.form && this.$refs.form.resetFields(); this.form.tags = []; this.form.coverUrl=''; },
    async onSubmit(){
      this.$refs.form.validate(async valid =>{
        if (!valid) return
        this.submitting = true
        try{
          const payload = { ...this.form }
          // 将 tags 数组序列化为 JSON 字符串，由后端存入 course_tags
          if (Array.isArray(payload.tags)) payload.tags = JSON.stringify(payload.tags)
          // startTime 仅时分，统一补秒为 00
          if (payload.startTime) {
            const t = String(payload.startTime)
            payload.startTime = t.length === 5 ? (t + ':00') : t
          }
          const res = await createBigClassPlan(payload)
          if (res && (res.code === 200 || res.success)){
            this.$message.success('发布成功')
            this.onReset()
          } else {
            this.$message.error(res && res.message ? res.message : '发布失败')
          }
        }catch(e){
          this.$message.error(e && e.message ? e.message : '发布失败')
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style scoped>
.page-container{ padding:16px; }
.cover-preview{ margin-top:8px; }
.cover-preview img{ width: 240px; height: 140px; object-fit: cover; border-radius: 4px; border:1px solid #eee; }
</style>


