<template>
  <div class="app-wrapper">
    <!-- 左侧菜单布局 -->
    <div class="layout-container">
      <!-- 左侧菜单 -->
      <sidebar class="sidebar-container" />
      
      <!-- 右侧内容区域 -->
      <div class="main-container">
        <!-- 顶部导航栏 -->
        <div class="navbar">
          <div class="navbar-left">
            <i class="hamburger" :class="{'is-active': isCollapse}" @click="toggleSidebar">
              <svg class="svg-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"/>
              </svg>
            </i>
            <breadcrumb class="breadcrumb-container" />
          </div>
          <div class="navbar-right">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <i class="el-icon-user-solid"></i>
                {{ userInfo && (userInfo.realName || userInfo.username) || '用户' }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        
        <!-- 标签页导航 -->
        <div v-if="showTabs" class="tabs-view">
          <el-tabs
            v-model="activeTab"
            type="card"
            closable
            @tab-remove="removeTab"
            @tab-click="clickTab"
          >
            <el-tab-pane
              v-for="tab in visitedViews"
              :key="tab.path"
              :label="tab.title"
              :name="tab.path"
            >
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <!-- 主内容区域 -->
        <div class="app-main">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Sidebar from './Sidebar.vue'
import Breadcrumb from './Breadcrumb.vue'

export default {
  name: 'Layout',
  components: {
    Sidebar,
    Breadcrumb
  },
  data() {
    return {
      activeTab: '',
      visitedViews: [
        { path: '/dashboard', title: '数学教研' }
      ],
      showTabs: true
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isCollapse'])
  },
  watch: {
    $route: {
      handler(route) {
        this.addVisitedView(route)
      },
      immediate: true
    }
  },
  methods: {
    // 切换菜单折叠状态
    toggleSidebar() {
      this.$store.dispatch('app/toggleSidebar')
    },
    
    // 添加访问过的视图
    addVisitedView(route) {
      const { path, meta } = route
      const title = meta.title || '未命名页面'
      
      // 检查是否已存在
      const existingView = this.visitedViews.find(view => view.path === path)
      if (!existingView) {
        this.visitedViews.push({ path, title })
      }
      
      this.activeTab = path
    },
    
    // 移除标签页
    removeTab(targetName) {
      const tabs = this.visitedViews
      let activeName = this.activeTab
      
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.path === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.path
            }
          }
        })
      }
      
      this.activeTab = activeName
      this.visitedViews = tabs.filter(tab => tab.path !== targetName)
      
      if (this.activeTab !== this.$route.path) {
        this.$router.push(this.activeTab)
      }
    },
    
    // 点击标签页
    clickTab(tab) {
      if (tab.name !== this.$route.path) {
        this.$router.push(tab.name)
      }
    },
    
    // 处理用户下拉菜单命令
    handleCommand(command) {
      if (command === 'logout') {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('user/logout').then(() => {
            this.$router.push('/login')
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  
  .layout-container {
    display: flex;
    height: 100%;
  }
}

.sidebar-container {
  width: 210px;
  transition: width 0.28s;
  flex-shrink: 0;
  
  &.collapse {
    width: 54px;
  }
}

.main-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部导航栏
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  
  .navbar-left {
    display: flex;
    align-items: center;
    
    .hamburger {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
      cursor: pointer;
      margin-right: 16px;
      
      .svg-icon {
        width: 100%;
        height: 100%;
      }
    }
    
    .breadcrumb-container {
      margin-left: 8px;
    }
  }
  
  .navbar-right {
    .el-dropdown-link {
      color: #606266;
      cursor: pointer;
      display: flex;
      align-items: center;
      
      .el-icon-user-solid {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}

// 标签页
.tabs-view {
  background: #ffffff;
  padding: 0 10px;
  border-bottom: 1px solid #e6e6e6;
  
  ::v-deep .el-tabs {
    .el-tabs__header {
      margin: 0;
      
      .el-tabs__nav {
        border: none;
      }
      
      .el-tabs__item {
        height: 32px;
        line-height: 32px;
        border: 1px solid #d9d9d9;
        margin-right: 4px;
        border-radius: 4px 4px 0 0;
        
        &.is-active {
          background: #1890ff;
          color: #ffffff;
          border-color: #1890ff;
        }
      }
    }
  }
}

// 主内容区域
.app-main {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
  padding: 20px;
}
</style>