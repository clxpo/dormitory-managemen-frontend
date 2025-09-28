<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background-color: #304156;">
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
      <el-header style="background-color: #409eff; color: white; display: flex; align-items: center; padding: 0 20px;">
        <h2>{{ getPageTitle() }}</h2>
      </el-header>
      
      <el-main style="background-color: #f0f2f5;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const getPageTitle = () => {
  const titles = {
    '/': 'แดชบอร์ด',
    '/rooms': 'จัดการห้องพัก',
    '/meter-readings': 'บันทึกมิเตอร์น้ำไฟ',
    '/bills': 'บิลรายเดือน'
  }
  return titles[route.path] || 'ระบบจัดการหอพัก'
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Kanit', sans-serif;
}

.el-menu-item {
  height: 50px !important;
  line-height: 50px !important;
}
</style>