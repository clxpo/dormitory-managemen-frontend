<template>
  <div class="layout-wrapper">
    <!-- Mobile Header with Hamburger -->
    <el-header v-if="isMobile" class="mobile-header">
      <el-button :icon="Menu" @click="drawerVisible = true" circle class="hamburger-btn" />
      <h2 class="mobile-title">{{ getPageTitle() }}</h2>
    </el-header>

    <!-- Mobile Drawer Menu -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :size="280"
      :with-header="false"
    >
      <div class="drawer-header">
        <h2>ระบบจัดการหอพัก</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        @select="handleMenuSelect"
        class="mobile-menu"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>แดชบอร์ด</span>
        </el-menu-item>
        <el-menu-item index="/rooms">
          <el-icon><OfficeBuilding /></el-icon>
          <span>จัดการห้องพัก</span>
        </el-menu-item>
        <el-menu-item index="/meter-readings">
          <el-icon><Odometer /></el-icon>
          <span>บันทึกมิเตอร์</span>
        </el-menu-item>
        <el-menu-item index="/bills">
          <el-icon><Document /></el-icon>
          <span>บิลรายเดือน</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- Desktop/Tablet Layout -->
    <el-container style="height: 100vh;">
      <!-- Desktop Sidebar -->
      <el-aside v-if="!isMobile" width="200px" style="background-color: #304156;">
        <div style="padding: 20px; text-align: center; color: white; font-weight: bold; font-size: 18px;">
          ระบบจัดการหอพัก
        </div>
        <el-menu
          :default-active="$route.path"
          router
          background-color="#304156"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>แดชบอร์ด</span>
          </el-menu-item>
          <el-menu-item index="/rooms">
            <el-icon><OfficeBuilding /></el-icon>
            <span>จัดการห้องพัก</span>
          </el-menu-item>
          <el-menu-item index="/meter-readings">
            <el-icon><Odometer /></el-icon>
            <span>บันทึกมิเตอร์</span>
          </el-menu-item>
          <el-menu-item index="/bills">
            <el-icon><Document /></el-icon>
            <span>บิลรายเดือน</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <!-- Desktop Header -->
        <el-header v-if="!isMobile" style="background-color: #409eff; color: white; display: flex; align-items: center; padding: 0 20px;">
          <h2>{{ getPageTitle() }}</h2>
        </el-header>
        
        <!-- Main Content -->
        <el-main :style="mainStyle">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const drawerVisible = ref(false)
const screenWidth = ref(window.innerWidth)

const isMobile = computed(() => screenWidth.value < 768)

const mainStyle = computed(() => ({
  backgroundColor: '#f0f2f5',
  padding: isMobile.value ? '80px 15px 20px 15px' : '20px'
}))

const getPageTitle = () => {
  const titles = {
    '/': 'แดชบอร์ด',
    '/rooms': 'จัดการห้องพัก',
    '/meter-readings': 'บันทึกมิเตอร์น้ำไฟ',
    '/bills': 'บิลรายเดือน'
  }
  return titles[route.path] || 'ระบบจัดการหอพัก'
}

const handleMenuSelect = (index) => {
  router.push(index)
  drawerVisible.value = false
}

const handleResize = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Kanit', sans-serif;
}

.layout-wrapper {
  height: 100vh;
  overflow: hidden;
}

.el-menu-item {
  height: 50px !important;
  line-height: 50px !important;
}

/* Mobile Header */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #409eff;
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 15px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hamburger-btn {
  background-color: white;
  border: none;
  flex-shrink: 0;
}

.mobile-title {
  margin: 0;
  color: white;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Drawer Styles */
.drawer-header {
  padding: 20px;
  background-color: #304156;
  color: white;
  text-align: center;
  border-bottom: 1px solid #1f2d3d;
}

.drawer-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.mobile-menu {
  border-right: none;
}

.mobile-menu .el-menu-item {
  color: #303133;
}

.mobile-menu .el-menu-item:hover {
  background-color: #f5f7fa;
}

.mobile-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .el-main {
    padding: 80px 15px 20px 15px !important;
  }
  
  .el-container {
    height: 100vh !important;
  }
}

@media (max-width: 480px) {
  .el-main {
    padding: 80px 10px 20px 10px !important;
  }
  
  .mobile-title {
    font-size: 16px;
  }
}
</style>