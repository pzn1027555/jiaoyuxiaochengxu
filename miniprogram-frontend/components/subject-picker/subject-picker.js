const courseCategoryApi = require('../../api/courseCategory')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    value: {
      type: Array,
      value: [], // [{ id, name }]
      observer(newVal) {
        if (Array.isArray(newVal)) {
          const map = {}
          newVal.forEach(it => { if (it && it.id!=null) map[String(it.id)] = true })
          this.setData({
            selectedMap: map,
            selectedList: Array.isArray(newVal) ? newVal : []
          })
        }
      }
    },
    multiple: {
      type: Boolean,
      value: true
    },
    max: {
      type: Number,
      value: 20
    },
    title: {
      type: String,
      value: '请选择科目'
    }
  },

  data: {
    subjectTree: [],
    loading: false,
    selectedMap: {},
    selectedList: [],
    firstLoaded: false
  },

  lifetimes: {
    attached() {
      if (this.properties.show) {
        this.loadSubjects()
      }
    }
  },

  observers: {
    show(val) {
      if (val && !this.data.firstLoaded) {
        this.loadSubjects()
      }
    }
  },

  methods: {
    async loadSubjects() {
      if (this.data.loading) return
      this.setData({ loading: true })
      try {
        const res = await courseCategoryApi.getCategoryTree()
        const tree = (res && (res.success || res.code === 200) && Array.isArray(res.data)) ? res.data : []
        this.setData({ subjectTree: tree, firstLoaded: true })
        this.syncSelectionFromValue()
      } catch (error) {
        console.error('加载科目失败', error)
      } finally {
        this.setData({ loading: false })
      }
    },

    syncSelectionFromValue() {
      const value = this.properties.value
      if (!Array.isArray(value)) return
      const map = {}
      value.forEach(it => { if (it && it.id!=null) map[String(it.id)] = true })
      this.setData({ selectedMap: map, selectedList: value })
    },

    toggleSubject(e) {
      const { id, name, parentName } = e.currentTarget.dataset
      if (!id) return
      const key = String(id)
      const map = { ...this.data.selectedMap }
      const list = [...this.data.selectedList]
      const index = list.findIndex(item => String(item.id) === key)

      if (index >= 0) {
        delete map[key]
        list.splice(index, 1)
      } else {
        if (!this.properties.multiple && list.length > 0) {
          Object.keys(map).forEach(k => delete map[k])
          list.length = 0
        }
        if (this.properties.multiple && list.length >= this.properties.max) {
          wx.showToast({ title: `最多选择${this.properties.max}个科目`, icon: 'none' })
          return
        }
        map[key] = true
        list.push({ id, name, parentName })
      }

      this.setData({ selectedMap: map, selectedList: list })
    },

    confirm() {
      this.triggerEvent('confirm', { value: this.data.selectedList })
    },

    cancel() {
      this.triggerEvent('cancel')
    },

    stop() {}
  }
})

