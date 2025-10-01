/*
  轻量 ECharts 入口包装（为避免引入完整大文件，这里仅提供 require 接口与 setCanvasCreator 占位）。
  在实际项目中建议替换为官方 wx-echarts 提供的 echarts.js 构建文件。
*/
let echarts = require('./echarts.min.js')
let _canvasCreator = null
echarts.setCanvasCreator = function(fn){ _canvasCreator = fn }
module.exports = echarts


