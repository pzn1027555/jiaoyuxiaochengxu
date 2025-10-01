<template>
  <div class="circle-button-group">
    <el-tooltip 
      v-for="(action, index) in actions" 
      :key="index"
      :content="action.tooltip"
      placement="top"
    >
      <button
        :class="['circle-btn', action.type || 'primary']"
        @click="handleClick(action)"
        :disabled="action.disabled"
      >
        <i :class="action.icon"></i>
      </button>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'CircleButton',
  props: {
    actions: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    handleClick(action) {
      if (action.disabled) return
      this.$emit('action-click', action)
    }
  }
}
</script>

<style scoped>
.circle-button-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 14px;
  position: relative;
  overflow: hidden;
}

.circle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.circle-btn.primary {
  background: #e6f7ff;
  color: var(--primary-color, #409eff);
}

.circle-btn.primary:hover:not(:disabled) {
  background: var(--primary-color, #409eff);
  color: white;
  transform: scale(1.1);
}

.circle-btn.success {
  background: #f6ffed;
  color: var(--success-color, #67c23a);
}

.circle-btn.success:hover:not(:disabled) {
  background: var(--success-color, #67c23a);
  color: white;
  transform: scale(1.1);
}

.circle-btn.warning {
  background: #fffbe6;
  color: var(--warning-color, #e6a23c);
}

.circle-btn.warning:hover:not(:disabled) {
  background: var(--warning-color, #e6a23c);
  color: white;
  transform: scale(1.1);
}

.circle-btn.danger {
  background: #fff2f0;
  color: var(--danger-color, #f56c6c);
}

.circle-btn.danger:hover:not(:disabled) {
  background: var(--danger-color, #f56c6c);
  color: white;
  transform: scale(1.1);
}

.circle-btn.info {
  background: #f5f5f5;
  color: var(--info-color, #909399);
}

.circle-btn.info:hover:not(:disabled) {
  background: var(--info-color, #909399);
  color: white;
  transform: scale(1.1);
}
</style>