# 通用顶部导航组件 (custom-header)

## 功能特点
- 自动处理刘海屏和状态栏适配
- 支持自定义标题
- 左侧返回按钮
- 支持右侧自定义内容插槽
- 自动计算顶部高度，传递给父页面

## 使用方法

### 1. 在页面JSON中引入组件
```json
{
  "navigationStyle": "custom",
  "usingComponents": {
    "custom-header": "/components/custom-header/custom-header"
  }
}
```

### 2. 在页面WXML中使用
```xml
<!-- 基础使用 -->
<custom-header 
  title="页面标题" 
  bind:headerReady="onHeaderReady"
>
</custom-header>

<!-- 带右侧内容 -->
<custom-header 
  title="页面标题" 
  bind:headerReady="onHeaderReady"
  bind:back="onBackTap"
>
  <view slot="right">
    <button>操作按钮</button>
  </view>
</custom-header>

<!-- 页面内容需要设置顶部内边距 -->
<view style="padding-top: {{headerHeight}}px;">
  <!-- 页面内容 -->
</view>
```

### 3. 在页面JS中处理事件
```javascript
Page({
  data: {
    headerHeight: 0
  },

  // 顶部导航栏准备完成
  onHeaderReady(e) {
    const { totalHeight } = e.detail
    this.setData({
      headerHeight: totalHeight
    })
  },

  // 处理返回按钮点击（可选）
  onBackTap() {
    // 自定义返回逻辑
    // 如果不处理，组件会自动执行默认返回
  }
})
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | String | '页面标题' | 页面标题文字 |
| showBack | Boolean | true | 是否显示返回按钮 |
| backgroundColor | String | '#fff' | 背景颜色 |

## 组件事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| headerReady | 组件初始化完成 | { statusBarHeight, headerHeight, totalHeight } |
| back | 返回按钮点击 | - |

## 插槽

| 插槽名 | 说明 |
|--------|------|
| right | 右侧内容区域 |
