// components/search-selector/search-selector.js
Component({
  options: {
    multipleSlots: true
  },

  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: false
    },
    // 选择器标题
    title: {
      type: String,
      value: '请选择'
    },
    // 选项数据
    options: {
      type: Array,
      value: []
    },
    // 当前选中值
    value: {
      type: Array,
      value: []
    },
    // 是否多选
    multiple: {
      type: Boolean,
      value: false
    },
    // 搜索字段名（针对对象数组）
    searchKey: {
      type: String,
      value: 'label'
    }
  },

  data: {
    searchText: '',
    filteredOptions: [],
    selectedValues: []
  },

  observers: {
    'options, value, searchText': function(options, value, searchText) {
      this.updateFilteredOptions()
    }
  },

  methods: {
    // 更新过滤后的选项
    updateFilteredOptions() {
      const { options, value, searchText, searchKey, multiple } = this.data
      
      if (!Array.isArray(options)) {
        this.setData({ filteredOptions: [] })
        return
      }

      let filtered = options

      // 搜索过滤
      if (searchText && searchText.trim()) {
        const keyword = searchText.trim().toLowerCase()
        filtered = options.filter(item => {
          const searchValue = typeof item === 'string' ? item : (item[searchKey] || item.label || '')
          return searchValue.toLowerCase().includes(keyword)
        })
      }

      // 标记选中状态
      const selectedSet = new Set(Array.isArray(value) ? value : [value])
      const processedOptions = filtered.map(item => {
        const itemValue = typeof item === 'string' ? item : (item.value || item.label || item)
        return {
          ...item,
          value: itemValue,
          label: typeof item === 'string' ? item : (item.label || item.value || item),
          selected: selectedSet.has(itemValue)
        }
      })

      this.setData({ filteredOptions: processedOptions })
    },

    // 搜索输入
    onSearchInput(e) {
      this.setData({ searchText: e.detail.value })
    },

    // 搜索确认
    onSearchConfirm(e) {
      this.setData({ searchText: e.detail.value })
    },

    // 清除搜索
    clearSearch() {
      this.setData({ searchText: '' })
    },

    // 选择选项
    selectOption(e) {
      const { value, label } = e.currentTarget.dataset
      const { multiple } = this.data

      if (multiple) {
        // 多选模式
        let selectedValues = [...this.data.selectedValues]
        const index = selectedValues.findIndex(item => item.value === value)
        
        if (index > -1) {
          selectedValues.splice(index, 1)
        } else {
          selectedValues.push({ value, label })
        }
        
        this.setData({ selectedValues })
        this.updateFilteredOptions()
      } else {
        // 单选模式，直接触发选择并关闭
        this.triggerEvent('change', { value, label })
        this.hide()
      }
    },

    // 确认选择（多选模式）
    confirm() {
      if (this.data.multiple) {
        this.triggerEvent('change', { 
          value: this.data.selectedValues.map(item => item.value),
          label: this.data.selectedValues.map(item => item.label)
        })
      }
      this.hide()
    },

    // 显示选择器
    show() {
      const { value, multiple } = this.data
      
      if (multiple) {
        const selectedValues = Array.isArray(value) ? 
          value.map(val => ({ value: val, label: val })) : []
        this.setData({ selectedValues })
      }
      
      this.setData({ 
        show: true,
        searchText: ''
      })
      this.updateFilteredOptions()
    },

    // 隐藏选择器
    hide() {
      this.setData({ 
        show: false,
        searchText: '',
        selectedValues: []
      })
    },

    // 阻止事件冒泡
    preventClose() {
      // 空函数，阻止点击弹窗内容时关闭
    }
  }
})
