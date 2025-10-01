<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="handleTabClick(tab)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tab-content">
      <slot :activeTab="activeTab"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabsContainer',
  props: {
    tabs: {
      type: Array,
      required: true,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeTab: this.value || (this.tabs.length > 0 ? this.tabs[0].key : '')
    }
  },
  watch: {
    value(newVal) {
      this.activeTab = newVal
    }
  },
  methods: {
    handleTabClick(tab) {
      if (tab.disabled) return
      this.activeTab = tab.key
      this.$emit('input', tab.key)
      this.$emit('tab-change', tab)
    }
  }
}
</script>

<style scoped>
.tabs-container {
  background: var(--card-background, #ffffff);
  border-radius: 8px;
  border: 1px solid var(--border-lighter, #ebeef5);
  overflow: hidden;
  margin-bottom: 16px;
}

.tabs-header {
  display: flex;
  background: #fafbfc;
  border-bottom: 1px solid var(--border-lighter, #ebeef5);
}

.tab-item {
  padding: 16px 24px;
  cursor: pointer;
  border-right: 1px solid var(--border-lighter, #ebeef5);
  transition: all 0.3s;
  font-size: 14px;
  color: var(--text-regular, #606266);
  position: relative;
  white-space: nowrap;
}

.tab-item:last-child {
  border-right: none;
}

.tab-item:hover {
  background: #f0f9ff;
  color: var(--primary-color, #409eff);
}

.tab-item.active {
  background: var(--card-background, #ffffff);
  color: var(--primary-color, #409eff);
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-color, #409eff);
}

.tab-content {
  padding: 0;
  min-height: 400px;
}
</style>