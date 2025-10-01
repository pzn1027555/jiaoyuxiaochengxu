<template>
  <div class="horizontal-layout">
    <!-- 顶部导航栏 -->
    <div class="layout-header">
      <!-- 品牌区域 -->
      <div class="brand-area">
        <div class="logo">
          <i class="el-icon-reading" />
          <span class="brand-text">管理系统平台</span>
        </div>
      </div>
      
      <!-- 水平菜单区域 -->
      <div class="menu-area">
        <HorizontalMenu />
      </div>
      
      <!-- 用户信息区域 -->
      <div class="user-area">
        <!-- 通知 -->
        <div class="notification-area">
          <el-badge :value="3" class="notification-badge">
            <el-button type="text" icon="el-icon-bell" class="notification-btn" />
          </el-badge>
        </div>
        
        <!-- 用户下拉菜单 -->
        <el-dropdown @command="handleUserCommand" trigger="click">
          <span class="user-info">
            <el-avatar 
              :size="32" 
              :src="userInfo.avatar" 
              icon="el-icon-user-solid"
              class="user-avatar"
            />
            <span class="username">欢迎您，{{ userInfo.nickname || userInfo.username || 'George Li' }}</span>
            <i class="el-icon-arrow-down" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">
              <i class="el-icon-user"></i> 个人设置
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <i class="el-icon-switch-button"></i> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 面包屑导航 -->
    <div class="breadcrumb-area" v-if="showBreadcrumb">
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="breadcrumbData.parent">
            {{ breadcrumbData.parent.name }}
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="breadcrumbData.current">
            {{ breadcrumbData.current.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 页面操作按钮 -->
        <div class="page-actions">
          <slot name="page-actions" />
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="layout-main">
      <div class="main-container">
        <!-- 页面内容 -->
        <div class="page-content">
          <slot />
        </div>
        
        <!-- 页面底部 -->
        <div class="layout-footer">
          <div class="footer-content">
            <span>© 2024 教育管理系统平台 - 专注于教育科技创新</span>
            <div class="footer-links">
              <a href="#" class="footer-link">帮助中心</a>
              <a href="#" class="footer-link">隐私政策</a>
              <a href="#" class="footer-link">服务条款</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HorizontalMenu from './HorizontalMenu.vue'
import { findMenuByPath } from '@/config/menus'

export default {
  name: 'HorizontalLayout',
  components: {
    HorizontalMenu
  },
  data() {
    return {
      showBreadcrumb: true
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters.getUser || { username: 'Admin', nickname: '管理员' }
    },
    breadcrumbData() {
      const menuInfo = findMenuByPath(this.$route.path)
      return menuInfo || { parent: null, current: null }
    }
  },
  methods: {
    handleUserCommand(command) {
      switch (command) {
        case 'profile':
          this.$message.info('个人设置功能开发中...')
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout')
        this.$message.success('退出登录成功')
        this.$router.push('/login')
      }).catch(() => {
        // 取消操作
      })
    }
  }
}
</script>

<style scoped>
.horizontal-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

/* 顶部导航栏 */
.layout-header {
  background: #ffffff;
  display: flex;
  align-items: center;
  min-height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

/* 品牌区域 */
.brand-area {
  flex-shrink: 0;
  padding: 0 24px;
  border-right: 1px solid #e8e8e8;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.logo i {
  font-size: 24px;
  color: #1890ff;
}

.brand-text {
  white-space: nowrap;
}

/* 菜单区域 */
.menu-area {
  flex: 1;
  min-width: 0;
}

/* 用户信息区域 */
.user-area {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
}

.notification-area {
  display: flex;
  align-items: center;
}

.notification-btn {
  color: #606266;
  font-size: 18px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.notification-btn:hover {
  color: #1890ff;
  background: #f0f9ff;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
  color: #606266;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  border: 2px solid #e4e7ed;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* 面包屑区域 */
.breadcrumb-area {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 0;
}

.breadcrumb-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-actions {
  display: flex;
  gap: 8px;
}

/* 主内容区域 */
.layout-main {
  flex: 1;
  overflow-y: auto;
  background: #f0f2f5;
}

.main-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

/* 页面底部 */
.layout-footer {
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  padding: 16px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  color: #909399;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .brand-area {
    padding: 0 16px;
  }
  
  .brand-text {
    display: none;
  }
  
  .user-area {
    padding: 0 16px;
  }
  
  .username {
    display: none;
  }
  
  .breadcrumb-container,
  .page-content,
  .footer-content {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 768px) {
  .layout-header {
    min-height: 56px;
  }
  
  .logo {
    font-size: 16px;
  }
  
  .logo i {
    font-size: 20px;
  }
  
  .breadcrumb-area {
    padding: 8px 0;
  }
  
  .page-content {
    padding: 16px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

/* 滚动条样式 */
.layout-main::-webkit-scrollbar {
  width: 6px;
}

.layout-main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.layout-main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.layout-main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>