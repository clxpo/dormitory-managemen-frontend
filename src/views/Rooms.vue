<template>
  <div>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        <span class="button-text">เพิ่มห้องพัก</span>
      </el-button>
    </div>

    <!-- Desktop Table View -->
    <el-table 
      v-if="!isMobile" 
      :data="rooms" 
      v-loading="loading" 
      style="width: 100%"
    >
      <el-table-column prop="number" label="หมายเลขห้อง" width="120" />
      <el-table-column prop="tenant" label="ผู้เช่า" />
      <el-table-column prop="phone" label="เบอร์โทร" />
      <el-table-column prop="rentFee" label="ค่าเช่า (บาท)">
        <template #default="{ row }">
          {{ row.rentFee?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="electricRate" label="ค่าไฟ/หน่วย">
        <template #default="{ row }">
          ฿{{ row.electricRate }}
        </template>
      </el-table-column>
      <el-table-column prop="waterRate" label="ค่าน้ำ/หน่วย">
        <template #default="{ row }">
          ฿{{ row.waterRate }}
        </template>
      </el-table-column>
      <el-table-column label="Max มิเตอร์ไฟ" width="120">
        <template #default="{ row }">
          {{ row.meterMaxElectric ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="Max มิเตอร์น้ำ" width="120">
        <template #default="{ row }">
          {{ row.meterMaxWater ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="ค่าส่วนกลาง" width="140">
        <template #default="{ row }">
          ฿{{ row.commonFee?.toLocaleString() || 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="สถานะ" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'occupied' ? 'success' : 'info'">
            {{ row.status === 'occupied' ? 'มีผู้เช่า' : 'ว่าง' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="จัดการ" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="editRoom(row)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button size="small" type="danger" @click="deleteRoom(row)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Mobile Card View -->
    <div v-else v-loading="loading">
      <el-card 
        v-for="room in rooms" 
        :key="room._id" 
        class="room-card"
        shadow="hover"
      >
        <div class="room-card-header">
          <div>
            <h3 class="room-number">ห้อง {{ room.number }}</h3>
            <el-tag 
              :type="room.status === 'occupied' ? 'success' : 'info'"
              size="small"
            >
              {{ room.status === 'occupied' ? 'มีผู้เช่า' : 'ว่าง' }}
            </el-tag>
          </div>
          <div class="room-actions">
            <el-button size="small" circle @click="editRoom(room)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" type="danger" circle @click="deleteRoom(room)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <el-divider style="margin: 12px 0" />

        <div class="room-info">
          <div class="info-row" v-if="room.tenant">
            <span class="info-label">ผู้เช่า:</span>
            <span class="info-value">{{ room.tenant }}</span>
          </div>
          <div class="info-row" v-if="room.phone">
            <span class="info-label">เบอร์โทร:</span>
            <span class="info-value">{{ room.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ค่าเช่า:</span>
            <span class="info-value highlight">฿{{ room.rentFee?.toLocaleString() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ค่าส่วนกลาง:</span>
            <span class="info-value">฿{{ room.commonFee?.toLocaleString() || 0 }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ค่าไฟ/หน่วย:</span>
            <span class="info-value">฿{{ room.electricRate }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ค่าน้ำ/หน่วย:</span>
            <span class="info-value">฿{{ room.waterRate }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Max มิเตอร์ไฟ:</span>
            <span class="info-value">{{ room.meterMaxElectric ?? '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Max มิเตอร์น้ำ:</span>
            <span class="info-value">{{ room.meterMaxWater ?? '-' }}</span>
          </div>
          <div class="info-row" v-if="room.additionalDetails">
            <span class="info-label">รายละเอียดเพิ่มเติม:</span>
            <span class="info-value">{{ room.additionalDetails }}</span>
          </div>
        </div>
      </el-card>

      <el-empty v-if="rooms.length === 0 && !loading" description="ไม่มีข้อมูลห้องพัก" />
    </div>

    <!-- Add/Edit Room Dialog -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingRoom ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพัก'" 
      :width="dialogWidth"
      :fullscreen="isMobile"
    >
      <el-form :model="roomForm" :label-width="labelWidth">
        <el-form-item label="หมายเลขห้อง" required>
          <el-input v-model="roomForm.number" />
        </el-form-item>
        <el-form-item label="ผู้เช่า">
          <el-input v-model="roomForm.tenant" />
        </el-form-item>
        <el-form-item label="เบอร์โทร">
          <el-input v-model="roomForm.phone" />
        </el-form-item>
        <el-form-item label="ค่าเช่า (บาท)" required>
          <el-input-number v-model="roomForm.rentFee" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="ค่ามัดจำ (บาท)">
          <el-input-number v-model="roomForm.deposit" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="ค่าไฟ/หน่วย">
          <el-input-number v-model="roomForm.electricRate" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="ค่าน้ำ/หน่วย">
          <el-input-number v-model="roomForm.waterRate" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Max มิเตอร์ไฟ">
          <el-input-number v-model="roomForm.meterMaxElectric" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Max มิเตอร์น้ำ">
          <el-input-number v-model="roomForm.meterMaxWater" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="ค่าส่วนกลาง (บาท)">
          <el-input-number v-model="roomForm.commonFee" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="รายละเอียดเพิ่มเติม">
          <el-input type="textarea" v-model="roomForm.additionalDetails" placeholder="เช่น เงื่อนไขหรือหมายเหตุเพิ่มเติม" rows="3" />
        </el-form-item>
        <el-form-item label="สถานะ">
          <el-select v-model="roomForm.status" style="width: 100%">
            <el-option label="ว่าง" value="vacant" />
            <el-option label="มีผู้เช่า" value="occupied" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">ยกเลิก</el-button>
        <el-button type="primary" @click="saveRoom">บันทึก</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

const rooms = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const editingRoom = ref(null)
const screenWidth = ref(window.innerWidth)

const isMobile = computed(() => screenWidth.value < 768)
const dialogWidth = computed(() => isMobile.value ? '100%' : '500px')
const labelWidth = computed(() => isMobile.value ? '100px' : '120px')

const roomForm = ref({
  number: '',
  tenant: '',
  phone: '',
  rentFee: 0,
  deposit: 0,
  electricRate: 6,
  waterRate: 20,
  // new fields from backend
  meterMaxElectric: 9999,
  meterMaxWater: 9999,
  commonFee: 0,
  additionalDetails: '',
  status: 'vacant'
})

const fetchRooms = async () => {
  loading.value = true
  try {
    const response = await api.get('/rooms')
    rooms.value = response.data
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องพัก')
  }
  loading.value = false
}

const editRoom = (room) => {
  editingRoom.value = room
  roomForm.value = { ...room }
  showAddDialog.value = true
}

const saveRoom = async () => {
  try {
    if (editingRoom.value) {
      await api.put(`/rooms/${editingRoom.value._id}`, roomForm.value)
      ElMessage.success('แก้ไขห้องพักสำเร็จ')
    } else {
      await api.post('/rooms', roomForm.value)
      ElMessage.success('เพิ่มห้องพักสำเร็จ')
    }
    
    showAddDialog.value = false
    editingRoom.value = null
    roomForm.value = {
      number: '',
      tenant: '',
      phone: '',
      rentFee: 0,
      deposit: 0,
      electricRate: 6,
      waterRate: 20,
      // keep defaults for newly added fields
      meterMaxElectric: 9999,
      meterMaxWater: 9999,
      commonFee: 0,
      additionalDetails: '',
      status: 'vacant'
    }
    fetchRooms()
  } catch (error) {
    if (error.response?.data?.error === 'Room number already exists') {
      ElMessage.error('หมายเลขห้องนี้มีอยู่แล้ว')
    } else {
      ElMessage.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
  }
}

const deleteRoom = async (room) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบห้อง ${room.number} หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning',
      }
    )
    
    await api.delete(`/rooms/${room._id}`)
    ElMessage.success('ลบห้องพักสำเร็จ')
    fetchRooms()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('เกิดข้อผิดพลาดในการลบห้องพัก')
    }
  }
}

const handleResize = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  fetchRooms()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Mobile Card View */
.room-card {
  margin-bottom: 15px;
}

.room-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.room-number {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.info-value.highlight {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

/* Responsive button text */
@media (max-width: 480px) {
  .button-text {
    display: none;
  }
  
  .room-number {
    font-size: 16px;
  }
  
  .info-label,
  .info-value {
    font-size: 13px;
  }
  
  .info-value.highlight {
    font-size: 15px;
  }
}
</style>