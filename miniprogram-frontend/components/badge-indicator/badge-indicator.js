// components/badge-indicator/badge-indicator.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 红点标识键
    badgeKey: {
      type: String,
      value: ''
    },
    // 是否显示红点
    visible: {
      type: Boolean,
      value: false
    },
    // 红点数量（0表示只显示红点不显示数字）
    count: {
      type: Number,
      value: 0
    },
    // 红点大小类型：small, medium, large
    size: {
      type: String,
      value: 'medium'
    },
    // 自定义样式类
    customClass: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取显示的文本
    getDisplayText() {
      const count = this.properties.count
      if (count > 99) {
        return '99+'
      } else if (count > 0) {
        return count.toString()
      }
      return ''
    },

    // 获取红点样式类
    getBadgeClass() {
      const { size, customClass } = this.properties
      const sizeClass = `badge-${size}`
      return `badge-indicator ${sizeClass} ${customClass}`.trim()
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件初始化时的逻辑
    }
  }
})

