Component({
  properties: {
    ec: {
      type: Object,
      value: {}
    },
    canvasId: {
      type: String,
      value: ''
    }
  },
  data: {},
  lifetimes: {
    attached() {}
  },
  methods: {
    init(callback) {
      const query = this.createSelectorQuery()
      query.select('canvas').fields({ node: true, size: true }).exec((res) => {
        const result = res && res[0]
        if (!result || !result.node) {
          // 若节点未就绪，稍后重试，避免直接抛错
          setTimeout(() => this.init(callback), 50)
          return
        }
        const canvas = result.node
        const width = result.width
        const height = result.height
        if (!width || !height) {
          // 尺寸尚未计算，延迟重试以避免 0 宽高导致空白
          setTimeout(() => this.init(callback), 50)
          return
        }
        const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        const ctx = canvas.getContext('2d')
        // 兼容 echarts 的 canvas API
        const echarts = require('./echarts')
        echarts.setCanvasCreator(() => canvas)
        callback(canvas, width, height, dpr)
      })
    }
  }
})


