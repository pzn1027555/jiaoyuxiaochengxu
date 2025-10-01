<template>
  <div style="padding:24px; max-width:520px;">
    <el-card>
      <div slot="header">课时价格设置</div>
      <el-form :model="form" label-width="120px">
        <el-form-item label="课时价格(元/课时)">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" controls-position="right" style="width: 100%;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
          <el-button @click="load">刷新</el-button>
        </el-form-item>
      </el-form>
      <div style="color:#999; font-size:12px;">该价格用于平台统一的“每节课费用”默认值，影响教师排学习计划与下单。</div>
    </el-card>
  </div>
  
</template>

<script>
import { lessonPriceApi } from '@/api/system'

export default {
  name: 'LessonPrice',
  data(){
    return { form: { price: 0 }, saving: false }
  },
  created(){ this.load() },
  methods:{
    async load(){
      try{
        const res = await lessonPriceApi.current()
        if(res && res.code===200 && res.data){ this.form.price = Number(res.data.price || 0) }
      }catch(e){}
    },
    async onSave(){
      this.saving = true
      try{
        const res = await lessonPriceApi.save({ price: this.form.price, currency: 'CNY' })
        if(res && res.code===200){ this.$message.success('保存成功') }
        else{ this.$message.error(res && res.message || '保存失败') }
      }finally{ this.saving = false }
    }
  }
}
</script>


