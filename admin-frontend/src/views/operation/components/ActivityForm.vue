<template>
  <div class="activity-form">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="活动名称" prop="activityName">
        <el-input v-model="form.activityName" placeholder="请输入活动名称"></el-input>
      </el-form-item>
      
      <el-form-item label="活动编码" prop="activityCode">
        <el-input v-model="form.activityCode" placeholder="请输入活动编码（唯一）"></el-input>
      </el-form-item>
      
      <el-form-item label="活动描述">
        <el-input
          v-model="form.activityDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入活动描述"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="活动类型" prop="activityType">
        <el-select v-model="form.activityType" placeholder="请选择活动类型">
          <el-option label="邀请奖励" value="invite"></el-option>
          <el-option label="分享奖励" value="share"></el-option>
          <el-option label="任务奖励" value="task"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="奖励类型" prop="rewardType">
        <el-select v-model="form.rewardType" placeholder="请选择奖励类型">
          <el-option label="现金" value="cash"></el-option>
          <el-option label="优惠券" value="coupon"></el-option>
          <el-option label="积分" value="points"></el-option>
          <el-option label="课程" value="course"></el-option>
        </el-select>
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邀请人奖励" prop="inviterReward">
            <el-input-number
              v-model="form.inviterReward"
              :min="0"
              :precision="2"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被邀请人奖励" prop="inviteeReward">
            <el-input-number
              v-model="form.inviteeReward"
              :min="0"
              :precision="2"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最大邀请数" prop="maxInvitations">
            <el-input-number
              v-model="form.maxInvitations"
              :min="1"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单日限制">
            <el-input-number
              v-model="form.dailyLimit"
              :min="1"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="发放方式" prop="rewardDistribution">
        <el-select v-model="form.rewardDistribution" placeholder="请选择发放方式">
          <el-option label="立即发放" value="immediate"></el-option>
          <el-option label="定期发放" value="period"></el-option>
          <el-option label="手动发放" value="manual"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item 
        v-if="form.rewardDistribution === 'period'"
        label="发放周期"
      >
        <el-input-number
          v-model="form.distributionPeriod"
          :min="1"
          :max="30"
        ></el-input-number>
        <span style="margin-left: 8px;">天</span>
      </el-form-item>
      
      <el-form-item label="目标用户" prop="targetUserType">
        <el-select v-model="form.targetUserType" placeholder="请选择目标用户">
          <el-option label="全部用户" value="all"></el-option>
          <el-option label="新用户" value="new"></el-option>
          <el-option label="老用户" value="old"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="活动时间" prop="timeRange">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="handleTimeChange"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      
      <el-form-item label="预算上限">
        <el-input-number
          v-model="form.budgetLimit"
          :min="0"
          :precision="2"
          style="width: 200px"
        ></el-input-number>
      </el-form-item>
      
      <el-form-item label="活动规则">
        <el-input
          v-model="form.activityRules"
          type="textarea"
          :rows="4"
          placeholder="请输入活动规则说明"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="分享文案">
        <el-input
          v-model="form.shareContent"
          type="textarea"
          :rows="3"
          placeholder="请输入分享文案"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="排序权重">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999"></el-input-number>
      </el-form-item>
      
      <el-form-item label="是否启用">
        <el-switch v-model="form.isEnabled" :active-value="1" :inactive-value="0"></el-switch>
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
        {{ activity ? '更新' : '创建' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { createActivity, updateActivity } from '@/api/operation'

export default {
  name: 'ActivityForm',
  props: {
    activity: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        activityName: '',
        activityCode: '',
        activityDescription: '',
        activityType: 'invite',
        rewardType: 'cash',
        inviterReward: 0,
        inviteeReward: 0,
        maxInvitations: 100,
        dailyLimit: 10,
        rewardDistribution: 'immediate',
        distributionPeriod: 7,
        targetUserType: 'all',
        startTime: null,
        endTime: null,
        budgetLimit: 0,
        activityRules: '',
        shareContent: '',
        sortOrder: 0,
        isEnabled: 1,
        remark: ''
      },
      rules: {
        activityName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        activityCode: [
          { required: true, message: '请输入活动编码', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '活动编码只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        activityType: [
          { required: true, message: '请选择活动类型', trigger: 'change' }
        ],
        rewardType: [
          { required: true, message: '请选择奖励类型', trigger: 'change' }
        ],
        inviterReward: [
          { required: true, message: '请输入邀请人奖励金额', trigger: 'blur' }
        ],
        inviteeReward: [
          { required: true, message: '请输入被邀请人奖励金额', trigger: 'blur' }
        ],
        rewardDistribution: [
          { required: true, message: '请选择发放方式', trigger: 'change' }
        ],
        targetUserType: [
          { required: true, message: '请选择目标用户', trigger: 'change' }
        ],
        timeRange: [
          { required: true, message: '请选择活动时间', trigger: 'change' }
        ]
      },
      timeRange: [],
      submitting: false
    }
  },
  
  mounted() {
    if (this.activity) {
      this.initForm()
    } else {
      // 生成默认活动编码
      this.form.activityCode = 'ACT_' + Date.now()
    }
  },
  
  methods: {
    initForm() {
      // 如果是编辑模式，初始化表单数据
      Object.assign(this.form, this.activity)
      
      if (this.activity.startTime && this.activity.endTime) {
        this.timeRange = [
          new Date(this.activity.startTime),
          new Date(this.activity.endTime)
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
    
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        
        // 验证时间
        if (!this.timeRange || this.timeRange.length !== 2) {
          this.$message.error('请选择活动时间')
          return
        }
        
        this.submitting = true
        
        const formData = {
          ...this.form,
          status: 0, // 默认状态为未开始
          participantCount: 0,
          successInvitations: 0,
          totalRewardAmount: 0
        }
        
        let response
        if (this.activity) {
          response = await updateActivity(this.activity.id, formData)
        } else {
          response = await createActivity(formData)
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
.activity-form {
  .form-actions {
    text-align: right;
    margin-top: 20px;
    
    .el-button {
      margin-left: 10px;
    }
  }
}
</style>