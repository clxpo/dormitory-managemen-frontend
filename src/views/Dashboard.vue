<template>
  <div>
    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <el-icon size="40" color="#409eff"><OfficeBuilding /></el-icon>
            <div class="stat-info">
              <h3>{{ stats.totalRooms }}</h3>
              <p>ห้องทั้งหมด</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <el-icon size="40" color="#67c23a"><User /></el-icon>
            <div class="stat-info">
              <h3>{{ stats.occupiedRooms }}</h3>
              <p>ห้องที่มีคนพัก</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <el-icon size="40" color="#e6a23c"><House /></el-icon>
            <div class="stat-info">
              <h3>{{ stats.vacantRooms }}</h3>
              <p>ห้องว่าง</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <el-icon size="40" color="#f56c6c"><Warning /></el-icon>
            <div class="stat-info">
              <h3>{{ stats.unpaidBills }}</h3>
              <p>บิลค้างจ่าย</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>รายได้ประจำเดือน</span>
            </div>
          </template>
          <div class="revenue-display">
            <h2 style="color: #67c23a; margin: 0;">
              ฿{{ stats.monthlyRevenue?.toLocaleString() || '0' }}
            </h2>
            <p style="margin: 5px 0; color: #909399;">
              {{ getCurrentMonth() }} {{ new Date().getFullYear() }}
            </p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="recent-rooms-card">
          <template #header>
            <div class="card-header">
              <span>ห้องที่เช่าล่าสุด</span>
            </div>
          </template>
          <div v-if="recentRooms.length > 0">
            <div v-for="room in recentRooms.slice(0, 3)" :key="room._id" class="recent-room">
              <span>ห้อง {{ room.number }}</span>
              <span>{{ room.tenant || 'ไม่มีผู้เช่า' }}</span>
            </div>
          </div>
          <div v-else style="text-align: center; color: #909399;">
            ไม่มีข้อมูล
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const stats = ref({
  totalRooms: 0,
  occupiedRooms: 0,
  vacantRooms: 0,
  monthlyRevenue: 0,
  unpaidBills: 0
})

const recentRooms = ref([])

const fetchStats = async () => {
  try {
    const response = await api.get('/dashboard/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchRecentRooms = async () => {
  try {
    const response = await api.get('/rooms')
    recentRooms.value = response.data.filter(room => room.status === 'occupied')
  } catch (error) {
    console.error('Error fetching rooms:', error)
  }
}

const getCurrentMonth = () => {
  return new Date().toLocaleString('th-TH', { month: 'long' })
}

onMounted(() => {
  fetchStats()
  fetchRecentRooms()
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-card-wrapper {
  margin-bottom: 20px;
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.revenue-display {
  text-align: center;
  padding: 20px;
}

.recent-room {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.recent-room:last-child {
  border-bottom: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.recent-rooms-card {
  margin-bottom: 20px;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .stat-card {
    gap: 10px;
  }
  
  .stat-info h3 {
    font-size: 20px;
  }
  
  .stat-info p {
    font-size: 12px;
  }
  
  .el-icon {
    font-size: 32px !important;
  }
  
  .revenue-display {
    padding: 15px;
  }
  
  .revenue-display h2 {
    font-size: 24px !important;
  }
  
  .recent-room {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .stat-info h3 {
    font-size: 18px;
  }
  
  .stat-info p {
    font-size: 11px;
  }
  
  .revenue-display h2 {
    font-size: 20px !important;
  }
  
  .recent-room {
    flex-direction: column;
    gap: 5px;
    text-align: center;
  }
}
</style>