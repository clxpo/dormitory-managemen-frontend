<template>
  <div>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        บันทึกมิเตอร์
      </el-button>
    </div>

    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="selectedRoom" placeholder="เลือกห้อง" style="width: 100%" @change="fetchReadings">
            <el-option
              v-for="room in rooms"
              :key="room._id"
              :label="`ห้อง ${room.number} - ${room.tenant || 'ไม่มีผู้เช่า'}`"
              :value="room._id"
            />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- Desktop Table View -->
    <el-table 
      v-if="!isMobileView" 
      :data="readings" 
      v-loading="loading" 
      style="width: 100%"
    >
      <el-table-column label="วันที่บันทึก">
        <template #default="{ row }">
          {{ new Date(row.readingDate).toLocaleDateString('th-TH') }}
        </template>
      </el-table-column>
      <el-table-column prop="month" label="เดือน" width="100" />
      <el-table-column prop="year" label="ปี" width="80" />
      <el-table-column prop="electricMeter" label="มิเตอร์ไฟ" width="100" />
      <el-table-column prop="waterMeter" label="มิเตอร์น้ำ" width="100" />
      <el-table-column prop="electricUsage" label="ใช้ไฟ (หน่วย)" width="120" />
      <el-table-column prop="waterUsage" label="ใช้น้ำ (หน่วย)" width="120" />
      <el-table-column label="ค่าไฟ (บาท)" width="120">
        <template #default="{ row }">
          {{ row.electricCost?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="ค่าน้ำ (บาท)" width="120">
        <template #default="{ row }">
          {{ row.waterCost?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="รวม (บาท)" width="120">
        <template #default="{ row }">
          {{ row.totalCost?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="จัดการ" width="180" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="warning" 
            size="small" 
            @click="openEditDialog(row)"
            :icon="Edit"
          >
            แก้ไข
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="deleteReading(row._id)"
            :icon="Delete"
          >
            ลบ
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Mobile/Tablet Card View -->
    <div v-else v-loading="loading">
      <el-empty v-if="readings.length === 0" description="ไม่มีข้อมูลมิเตอร์" />
      <el-card 
        v-for="row in readings" 
        :key="row._id" 
        shadow="hover" 
        class="reading-card"
      >
        <div class="card-header">
          <div class="date-badge">
            {{ new Date(row.readingDate).toLocaleDateString('th-TH') }}
          </div>
          <div class="month-year">
            เดือน {{ row.month }} / {{ row.year }}
          </div>
        </div>
        
        <el-divider />
        
        <div class="meter-info">
          <div class="info-row">
            <span class="label">มิเตอร์ไฟ:</span>
            <span class="value">{{ row.electricMeter }} หน่วย</span>
          </div>
          <div class="info-row">
            <span class="label">มิเตอร์น้ำ:</span>
            <span class="value">{{ row.waterMeter }} หน่วย</span>
          </div>
          <div class="info-row highlight">
            <span class="label">ใช้ไฟ:</span>
            <span class="value">{{ row.electricUsage }} หน่วย</span>
          </div>
          <div class="info-row highlight">
            <span class="label">ใช้น้ำ:</span>
            <span class="value">{{ row.waterUsage }} หน่วย</span>
          </div>
        </div>
        
        <el-divider />
        
        <div class="cost-info">
          <div class="cost-row">
            <span class="label">ค่าไฟ:</span>
            <span class="value">{{ row.electricCost?.toLocaleString() }} บาท</span>
          </div>
          <div class="cost-row">
            <span class="label">ค่าน้ำ:</span>
            <span class="value">{{ row.waterCost?.toLocaleString() }} บาท</span>
          </div>
          <div class="cost-row total">
            <span class="label">รวมทั้งหมด:</span>
            <span class="value">{{ row.totalCost?.toLocaleString() }} บาท</span>
          </div>
        </div>
        
        <div class="card-actions">
          <el-button 
            type="warning" 
            @click="openEditDialog(row)"
            :icon="Edit"
            style="flex: 1"
          >
            แก้ไข
          </el-button>
          <el-button 
            type="danger" 
            @click="deleteReading(row._id)"
            :icon="Delete"
            style="flex: 1"
          >
            ลบ
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- Add Reading Dialog -->
    <el-dialog 
      v-model="showAddDialog" 
      title="บันทึกมิเตอร์น้ำไฟ" 
      :width="isMobileView ? '90%' : '500px'"
      center
      align-center
    >
      <el-form :model="readingForm" :label-width="isMobileView ? '120px' : '140px'">
        <el-form-item label="ห้อง" required>
          <el-select v-model="readingForm.roomId" placeholder="เลือกห้อง" style="width: 100%">
            <el-option
              v-for="room in rooms"
              :key="room._id"
              :label="`ห้อง ${room.number} - ${room.tenant || 'ไม่มีผู้เช่า'}`"
              :value="room._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="วันที่บันทึก" required>
          <el-date-picker
            v-model="readingForm.readingDate"
            type="date"
            placeholder="เลือกวันที่"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="มิเตอร์ไฟ (หน่วย)" required>
          <el-input-number v-model="readingForm.electricMeter" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="มิเตอร์น้ำ (หน่วย)" required>
          <el-input-number v-model="readingForm.waterMeter" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">ยกเลิก</el-button>
        <el-button type="primary" @click="saveReading">บันทึก</el-button>
      </template>
    </el-dialog>

    <!-- Edit Reading Dialog -->
    <el-dialog 
      v-model="showEditDialog" 
      title="แก้ไขมิเตอร์น้ำไฟ" 
      :width="isMobileView ? '90%' : '500px'"
      center
      align-center
    >
      <el-form :model="editForm" :label-width="isMobileView ? '120px' : '140px'">
        <el-form-item label="ห้อง">
          <el-input :value="editRoomLabel" disabled />
        </el-form-item>
        <el-form-item label="วันที่บันทึก" required>
          <el-date-picker
            v-model="editForm.readingDate"
            type="date"
            placeholder="เลือกวันที่"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="มิเตอร์ไฟ (หน่วย)" required>
          <el-input-number v-model="editForm.electricMeter" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="มิเตอร์น้ำ (หน่วย)" required>
          <el-input-number v-model="editForm.waterMeter" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">ยกเลิก</el-button>
        <el-button type="primary" @click="updateReading">บันทึก</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import api from '@/api'

const rooms = ref([])
const readings = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedRoom = ref('')
const screenWidth = ref(window.innerWidth)

const isMobileView = computed(() => screenWidth.value <= 1024)

const readingForm = ref({
  roomId: '',
  readingDate: new Date(),
  electricMeter: 0,
  waterMeter: 0
})

const editForm = ref({
  _id: '',
  roomId: '',
  readingDate: new Date(),
  electricMeter: 0,
  waterMeter: 0
})

const editRoomLabel = computed(() => {
  const room = rooms.value.find(r => r._id === editForm.value.roomId)
  return room ? `ห้อง ${room.number} - ${room.tenant || 'ไม่มีผู้เช่า'}` : ''
})

const fetchRooms = async () => {
  try {
    const response = await api.get('/rooms')
    rooms.value = response.data
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องพัก')
  }
}

const fetchReadings = async () => {
  if (!selectedRoom.value) {
    readings.value = []
    return
  }
  
  loading.value = true
  try {
    const response = await api.get(`/meter-readings/${selectedRoom.value}`)
    readings.value = response.data
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลมิเตอร์')
  }
  loading.value = false
}

const saveReading = async () => {
  try {
    if (!readingForm.value.roomId || !readingForm.value.readingDate) {
      ElMessage.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    await api.post('/meter-readings', readingForm.value)
    ElMessage.success('บันทึกมิเตอร์สำเร็จ')
    
    showAddDialog.value = false
    readingForm.value = {
      roomId: '',
      readingDate: new Date(),
      electricMeter: 0,
      waterMeter: 0
    }
    
    if (selectedRoom.value) {
      fetchReadings()
    }
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  }
}

const openEditDialog = (row) => {
  editForm.value = {
    _id: row._id,
    roomId: row.roomId,
    readingDate: new Date(row.readingDate),
    electricMeter: row.electricMeter,
    waterMeter: row.waterMeter
  }
  showEditDialog.value = true
}

const updateReading = async () => {
  try {
    if (!editForm.value.readingDate) {
      ElMessage.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    await api.put(`/meter-readings/${editForm.value._id}`, {
      readingDate: editForm.value.readingDate,
      electricMeter: editForm.value.electricMeter,
      waterMeter: editForm.value.waterMeter
    })
    
    ElMessage.success('แก้ไขมิเตอร์สำเร็จ')
    showEditDialog.value = false
    fetchReadings()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล')
  }
}

const deleteReading = async (id) => {
  try {
    await ElMessageBox.confirm(
      'คุณต้องการลบข้อมูลมิเตอร์นี้หรือไม่?',
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning',
      }
    )

    await api.delete(`/meter-readings/${id}`)
    ElMessage.success('ลบข้อมูลมิเตอร์สำเร็จ')
    fetchReadings()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('เกิดข้อผิดพลาดในการลบข้อมูล')
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
.el-table {
  font-size: 14px;
}

/* Mobile Card Styles */
.reading-card {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.date-badge {
  background-color: #409eff;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
}

.month-year {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.meter-info, .cost-info {
  margin: 10px 0;
}

.info-row, .cost-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child, .cost-row:last-child {
  border-bottom: none;
}

.info-row.highlight {
  background-color: #f0f9ff;
  padding: 8px 10px;
  margin: 5px -10px;
  border-radius: 5px;
  border-bottom: none;
}

.label {
  color: #606266;
  font-weight: 500;
}

.value {
  color: #303133;
  font-weight: 600;
}

.cost-row.total {
  background-color: #f0f9ff;
  padding: 10px;
  margin: 10px -10px -10px;
  border-radius: 5px;
  font-size: 16px;
}

.cost-row.total .label,
.cost-row.total .value {
  color: #409eff;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .date-badge {
    font-size: 12px;
    padding: 4px 10px;
  }
  
  .month-year {
    font-size: 13px;
  }
  
  .reading-card {
    margin-bottom: 12px;
  }
  
  /* Dialog adjustments for mobile */
  :deep(.el-dialog) {
    margin: 5vh auto !important;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.el-dialog__body) {
    overflow-y: auto;
    padding: 15px;
  }
  
  :deep(.el-dialog__header) {
    padding: 15px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
  
  :deep(.el-input__inner),
  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog) {
    margin: 20vh auto !important;
    max-height: 94vh;
  }
  
  :deep(.el-dialog__header) {
    padding: 12px;
  }
  
  :deep(.el-dialog__body) {
    padding: 12px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}
</style>