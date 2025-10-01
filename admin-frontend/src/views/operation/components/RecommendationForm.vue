<template>
  <div class="recommendation-form">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="教师姓名" prop="teacherName">
        <el-input v-model="form.teacherName" placeholder="请输入教师姓名"></el-input>
      </el-form-item>
      
      <el-form-item label="教学科目" prop="subject">
        <el-select v-model="form.subject" placeholder="请选择教学科目">
          <el-option label="数学" value="数学"></el-option>
          <el-option label="物理" value="物理"></el-option>
          <el-option label="化学" value="化学"></el-option>
          <el-option label="英语" value="英语"></el-option>
          <el-option label="生物" value="生物"></el-option>
          <el-option label="历史" value="历史"></el-option>
          <el-option label="地理" value="地理"></el-option>
          <el-option label="政治" value="政治"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="教师等级" prop="teacherLevel">
        <el-select v-model="form.teacherLevel" placeholder="请选择教师等级">
          <el-option label="专家级" value="专家级"></el-option>
          <el-option label="高级" value="高级"></el-option>
          <el-option label="中级" value="中级"></el-option>
          <el-option label="初级" value="初级"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="推荐类型" prop="recommendationType">
        <el-select v-model="form.recommendationType" placeholder="请选择推荐类型">
          <el-option label="热门推荐" value="hot"></el-option>
          <el-option label="优质推荐" value="quality"></el-option>
          <el-option label="新星推荐" value="new"></el-option>
          <el-option label="特色推荐" value="featured"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="推荐等级" prop="recommendationLevel">
        <el-rate v-model="form.recommendationLevel" :max="5" show-text></el-rate>
      </el-form-item>
      
      <el-form-item label="推荐理由" prop="recommendationReason">
        <el-input
          v-model="form.recommendationReason"
          type="textarea"
          :rows="3"
          placeholder="请输入推荐理由"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="推荐标签">
        <el-tag
          v-for="tag in form.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
          style="margin-right: 8px;"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="tagInputVisible"
          ref="tagInput"
          v-model="tagInputValue"
          size="mini"
          style="width: 80px;"
          @keyup.enter.native="addTag"
          @blur="addTag"
        ></el-input>
        <el-button
          v-else
          size="mini"
          @click="showTagInput"
        >
          + 添加标签
        </el-button>
      </el-form-item>
      
      <el-form-item label="排序权重" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999"></el-input-number>
      </el-form-item>
      
      <el-form-item label="是否置顶">
        <el-switch v-model="form.isTop" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      
      <el-form-item label="推荐时间">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="handleTimeChange"
        ></el-date-picker>
      </el-form-item>
      
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息"
        ></el-input>
      </el-form-item>
    </el-form>
    
    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ recommendation ? '更新' : '创建' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { createRecommendation, updateRecommendation } from '@/api/operation'

export default {
  name: 'RecommendationForm',
  props: {
    recommendation: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        teacherId: null,
        teacherName: '',
        avatar: '',
        subject: '',
        teacherLevel: '',
        recommendationType: 'hot',
        recommendationLevel: 5,
        recommendationReason: '',
        tags: [],
        sortOrder: 0,
        isTop: 0,
        startTime: null,
        endTime: null,
        status: 1,
        remark: ''
      },
      rules: {
        teacherName: [
          { required: true, message: '请输入教师姓名', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择教学科目', trigger: 'change' }
        ],
        teacherLevel: [
          { required: true, message: '请选择教师等级', trigger: 'change' }
        ],
        recommendationType: [
          { required: true, message: '请选择推荐类型', trigger: 'change' }
        ],
        recommendationReason: [
          { required: true, message: '请输入推荐理由', trigger: 'blur' }
        ]
      },
      timeRange: [],
      tagInputVisible: false,
      tagInputValue: '',
      submitting: false
    }
  },
  
  mounted() {
    if (this.recommendation) {
      this.initForm()
    }
  },
  
  methods: {
    initForm() {
      // 如果是编辑模式，初始化表单数据
      Object.assign(this.form, this.recommendation)
      
      if (this.recommendation.tags) {
        try {
          this.form.tags = JSON.parse(this.recommendation.tags)
        } catch {
          this.form.tags = []
        }
      }
      
      if (this.recommendation.startTime && this.recommendation.endTime) {
        this.timeRange = [
          new Date(this.recommendation.startTime),
          new Date(this.recommendation.endTime)
        ]
      }
    },
    
    handleTimeChange(timeRange) {
      if (timeRange && timeRange.length === 2) {
        this.form.startTime = timeRange[0]
        this.form.endTime = timeRange[1]
      } else {
        this.form.startTime = null
        this.form.endTime = null
      }
    },
    
    showTagInput() {
      this.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs.tagInput.$refs.input.focus()
      })
    },
    
    addTag() {
      const value = this.tagInputValue.trim()
      if (value && !this.form.tags.includes(value)) {
        this.form.tags.push(value)
      }
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    
    removeTag(tag) {
      this.form.tags = this.form.tags.filter(t => t !== tag)
    },
    
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.submitting = true
        
        // 处理标签数据
        const formData = {
          ...this.form,
          tags: JSON.stringify(this.form.tags),
          // 模拟教师ID（实际项目中应该通过教师选择组件获取）
          teacherId: this.form.teacherId || Math.floor(Math.random() * 1000) + 1
        }
        
        let response
        if (this.recommendation) {
          response = await updateRecommendation(this.recommendation.id, formData)
        } else {
          response = await createRecommendation(formData)
        }
        
        if (response.code === 200) {
          this.$emit('success', response.data)
        } else {
          this.$message.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('提交失败', error)
        this.$message.error('操作失败')
      } finally {
        this.submitting = false
      }
    },
    
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.recommendation-form {
  .form-actions {
    text-align: right;
    margin-top: 20px;
    
    .el-button {
      margin-left: 10px;
    }
  }
}
</style>