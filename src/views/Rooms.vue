<template>
  <div>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        เพิ่มห้องพัก
      </el-button>
    </div>

    <el-table :data="rooms" v-loading="loading" style="width: 100%">
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

    <!-- Add/Edit Room Dialog -->
    <el-dialog v-model="showAddDialog" :title="editingRoom ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพัก'" width="500px">
      <el-form :model="roomForm" label-width="120px">
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

const rooms = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const editingRoom = ref(null)

const roomForm = ref({
  number: '',
  tenant: '',
  phone: '',
  rentFee: 0,
  deposit: 0,
  electricRate: 6,
  waterRate: 20,
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

onMounted(() => {
  fetchRooms()
})
</script>