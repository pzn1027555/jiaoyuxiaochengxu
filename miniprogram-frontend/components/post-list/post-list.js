const request = require('../../utils/request')

Component({
  properties: {
    // research | employment
    type: {
      type: String,
      value: 'research'
    }
  },

  data: {
    loading: false,
    items: []
  },

  lifetimes: {
    attached() {
      this.fetchList()
    }
  },

  methods: {
    async fetchList() {
      this.setData({ loading: true })
      try {
        const url = this.data.type === 'employment' ? '/mini/employment/list' : '/mini/research/list'
        const res = await request.get(url)
        if (res && res.success) {
          this.setData({ items: res.data || [] })
        } else {
          this.setData({ items: [] })
        }
      } catch (e) {
        this.setData({ items: [] })
      } finally {
        this.setData({ loading: false })
      }
    },

    onViewDetail(e) {
      const id = e.currentTarget.dataset.id
      const type = this.data.type
      const item = this.data.items.find(i => i.id === id)
      if (!id) return
      const url = type === 'employment'
        ? `/pages/teacher/employment-detail/employment-detail?id=${id}`
        : `/pages/teacher/research-detail/research-detail?id=${id}`
      wx.navigateTo({
        url,
        success: (res) => {
          if (item) {
            res.eventChannel.emit('postData', { item, type })
          }
        }
      })
    }
  }
})



