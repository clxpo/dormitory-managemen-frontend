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

    <el-table :data="readings" v-loading="loading" style="width: 100%">
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
    </el-table>

    <!-- Add Reading Dialog -->
    <el-dialog v-model="showAddDialog" title="บันทึกมิเตอร์น้ำไฟ" width="500px">
      <el-form :model="readingForm" label-width="140px">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const rooms = ref([])
const readings = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const selectedRoom = ref('')

const readingForm = ref({
  roomId: '',
  readingDate: new Date(),
  electricMeter: 0,
  waterMeter: 0
})

const fetchRooms = async () => {
  try {
    const response = await axios.get('/api/rooms')
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
    const response = await axios.get(`/api/meter-readings/${selectedRoom.value}`)
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

    await axios.post('/api/meter-readings', readingForm.value)
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

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.el-table {
  font-size: 14px;
}
</style>