<template>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <h2 class="logo">教育管理平台</h2>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      unique-opened
      router
      class="el-menu-vertical"
    >
      <sidebar-item
        v-for="route in routes"
        :key="route.path"
        :item="route"
        :base-path="route.path"
      />
    </el-menu>
  </div>
</template>

<script>
import SidebarItem from './SidebarItem.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'Sidebar',
  components: {
    SidebarItem
  },
  computed: {
    ...mapGetters(['isCollapse']),
    
    routes() {
      return this.$router.options.routes.filter(route => {
        return route.path !== '/login' && 
               route.path !== '/404' && 
               route.path !== '*' && 
               route.component && 
               route.component.name === 'Layout'
      })
    },
    
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: #304156;
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #263445;
    
    .logo {
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }
  
  .el-menu {
    border: none;
    height: calc(100vh - 60px);
    overflow: auto;
  }
}
</style>