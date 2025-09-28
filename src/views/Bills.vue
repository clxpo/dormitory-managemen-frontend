<template>
  <div>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="showGenerateDialog = true">
        <el-icon><Plus /></el-icon>
        สร้างบิลรายเดือน
      </el-button>
    </div>

    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="ทุกสถานะ" style="width: 100%" @change="filterBills">
            <el-option label="ทุกสถานะ" value="" />
            <el-option label="ยังไม่จ่าย" value="unpaid" />
            <el-option label="จ่ายแล้ว" value="paid" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterRoom" placeholder="ทุกห้อง" style="width: 100%" @change="filterBills">
            <el-option label="ทุกห้อง" value="" />
            <el-option
              v-for="room in rooms"
              :key="room._id"
              :label="`ห้อง ${room.number}`"
              :value="room._id"
            />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="filteredBills" v-loading="loading" style="width: 100%">
      <el-table-column label="ห้อง" width="80">
        <template #default="{ row }">
          {{ row.roomId?.number }}
        </template>
      </el-table-column>
      <el-table-column label="ผู้เช่า">
        <template #default="{ row }">
          {{ row.roomId?.tenant || 'ไม่มีผู้เช่า' }}
        </template>
      </el-table-column>
      <el-table-column prop="month" label="เดือน" width="100" />
      <el-table-column prop="year" label="ปี" width="80" />
      <el-table-column label="ค่าเช่า" width="100">
        <template #default="{ row }">
          ฿{{ row.rentFee?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="ไฟ" width="120">
        <template #default="{ row }">
          <div style="font-size: 12px;">
            <div>{{ row.electricUsage }} หน่วย</div>
            <div style="color: #999;" v-if="row.meterData">
              {{ row.meterData.previous.electric }} → {{ row.meterData.current.electric }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="ค่าไฟ" width="100">
        <template #default="{ row }">
          ฿{{ row.electricCost?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="น้ำ" width="120">
        <template #default="{ row }">
          <div style="font-size: 12px;">
            <div>{{ row.waterUsage }} หน่วย</div>
            <div style="color: #999;" v-if="row.meterData">
              {{ row.meterData.previous.water }} → {{ row.meterData.current.water }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="ค่าน้ำ" width="100">
        <template #default="{ row }">
          ฿{{ row.waterCost?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="รวมทั้งหมด" width="120">
        <template #default="{ row }">
          ฿{{ row.totalAmount?.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="กำหนดจ่าย" width="120">
        <template #default="{ row }">
          {{ new Date(row.dueDate).toLocaleDateString('th-TH') }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="สถานะ" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
            {{ row.status === 'paid' ? 'จ่ายแล้ว' : 'ยังไม่จ่าย' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="จัดการ" width="200">
        <template #default="{ row }">
          <el-button 
            size="small" 
            :type="row.status === 'paid' ? 'warning' : 'success'"
            @click="togglePaymentStatus(row)"
          >
            {{ row.status === 'paid' ? 'ยกเลิกจ่าย' : 'จ่ายแล้ว' }}
          </el-button>
          <el-button size="small" type="info" @click="printBill(row)">
            พิมพ์
          </el-button>
          <el-button size="small" type="danger" @click="deleteBill(row)">
            ลบ
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Generate Bill Dialog -->
    <el-dialog v-model="showGenerateDialog" title="สร้างบิลรายเดือน" width="400px">
      <el-form :model="billForm" label-width="100px">
        <el-form-item label="ห้อง" required>
          <el-select v-model="billForm.roomId" placeholder="เลือกห้อง" style="width: 100%">
            <el-option
              v-for="room in rooms"
              :key="room._id"
              :label="`ห้อง ${room.number} - ${room.tenant || 'ไม่มีผู้เช่า'}`"
              :value="room._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="เดือน" required>
          <el-select v-model="billForm.month" placeholder="เลือกเดือน" style="width: 100%">
            <el-option label="มกราคม" value="มกราคม" />
            <el-option label="กุมภาพันธ์" value="กุมภาพันธ์" />
            <el-option label="มีนาคม" value="มีนาคม" />
            <el-option label="เมษายน" value="เมษายน" />
            <el-option label="พฤษภาคม" value="พฤษภาคม" />
            <el-option label="มิถุนายน" value="มิถุนายน" />
            <el-option label="กรกฎาคม" value="กรกฎาคม" />
            <el-option label="สิงหาคม" value="สิงหาคม" />
            <el-option label="กันยายน" value="กันยายน" />
            <el-option label="ตุลาคม" value="ตุลาคม" />
            <el-option label="พฤศจิกายน" value="พฤศจิกายน" />
            <el-option label="ธันวาคม" value="ธันวาคม" />
          </el-select>
        </el-form-item>
        <el-form-item label="ปี" required>
          <el-input-number v-model="billForm.year" :min="2023" :max="2030" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateDialog = false">ยกเลิก</el-button>
        <el-button type="primary" @click="generateBill">สร้างบิล</el-button>
      </template>
    </el-dialog>

    <!-- Print Bill Dialog -->
    <el-dialog v-model="showPrintDialog" title="ใบแจ้งหนี้" width="600px">
      <div v-if="selectedBill" class="bill-print">
        <div class="bill-header">
          <h2 style="text-align: center; margin: 0;">ใบแจ้งหนี้ค่าเช่าห้องพัก</h2>
          <div style="text-align: center; margin: 10px 0;">
            <strong>{{ selectedBill.month }} {{ selectedBill.year }}</strong>
          </div>
        </div>
        
        <div class="bill-details">
          <p><strong>ห้อง:</strong> {{ selectedBill.roomId?.number }}</p>
          <p><strong>ผู้เช่า:</strong> {{ selectedBill.roomId?.tenant || 'ไม่มีผู้เช่า' }}</p>
          <p><strong>วันที่ครบกำหนด:</strong> {{ new Date(selectedBill.dueDate).toLocaleDateString('th-TH') }}</p>
        </div>

        <table class="bill-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>เดือนก่อน</th>
              <th>เดือนปัจจุบัน</th>
              <th>การใช้งาน</th>
              <th>ราคา/หน่วย</th>
              <th>จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ค่าเช่าห้อง</td>
              <td>-</td>
              <td>-</td>
              <td>1 เดือน</td>
              <td>{{ selectedBill.rentFee?.toLocaleString() }}</td>
              <td>{{ selectedBill.rentFee?.toLocaleString() }}</td>
            </tr>
            <tr>
              <td>ค่าไฟฟ้า</td>
              <td>{{ selectedBill.meterData?.previous?.electric || '-' }}</td>
              <td>{{ selectedBill.meterData?.current?.electric || '-' }}</td>
              <td>{{ selectedBill.electricUsage || 0 }} หน่วย</td>
              <td>{{ selectedBill.roomId?.electricRate || 0 }}</td>
              <td>{{ selectedBill.electricCost?.toLocaleString() || '0' }}</td>
            </tr>
            <tr>
              <td>ค่าน้ำประปา</td>
              <td>{{ selectedBill.meterData?.previous?.water || '-' }}</td>
              <td>{{ selectedBill.meterData?.current?.water || '-' }}</td>
              <td>{{ selectedBill.waterUsage || 0 }} หน่วย</td>
              <td>{{ selectedBill.roomId?.waterRate || 0 }}</td>
              <td>{{ selectedBill.waterCost?.toLocaleString() || '0' }}</td>
            </tr>
            <tr class="total-row">
              <td colspan="5"><strong>รวมทั้งสิ้น</strong></td>
              <td><strong>฿{{ selectedBill.totalAmount?.toLocaleString() }}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- แสดงช่วงเวลาการอ่านมิเตอร์ -->
        <div class="meter-period" v-if="selectedBill.meterData">
          <p style="text-align: center; color: #666; margin-top: 15px;">
            <small>
              การใช้งานตั้งแต่ {{ selectedBill.meterData.previous.month }} {{ selectedBill.meterData.previous.year }} 
              ถึง {{ selectedBill.meterData.current.month }} {{ selectedBill.meterData.current.year }}
            </small>
          </p>
        </div>

        <!-- แจ้งเตือนเมื่อไม่มีข้อมูลมิเตอร์ -->
        <div v-else style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-top: 15px; border-radius: 4px;">
          <p style="text-align: center; color: #856404; margin: 0;">
            <small>
              ⚠️ ไม่พบข้อมูลการอ่านมิเตอร์สำหรับเดือนนี้ 
              <br>กรุณาบันทึกข้อมูลมิเตอร์ก่อนสร้างบิล
            </small>
          </p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showPrintDialog = false">ปิด</el-button>
        <el-button type="primary" @click="window.print()">พิมพ์</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const bills = ref([])
const rooms = ref([])
const loading = ref(false)
const showGenerateDialog = ref(false)
const showPrintDialog = ref(false)
const selectedBill = ref(null)
const filterStatus = ref('')
const filterRoom = ref('')

const billForm = ref({
  roomId: '',
  month: '',
  year: new Date().getFullYear()
})

const filteredBills = computed(() => {
  let filtered = bills.value

  if (filterStatus.value) {
    filtered = filtered.filter(bill => bill.status === filterStatus.value)
  }

  if (filterRoom.value) {
    filtered = filtered.filter(bill => bill.roomId?._id === filterRoom.value)
  }

  return filtered
})

const fetchBills = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/bills')
    bills.value = response.data
  } catch (error) {
    console.error('Error fetching bills:', error)
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลบิล')
  }
  loading.value = false
}

const fetchRooms = async () => {
  try {
    const response = await axios.get('/api/rooms')
    rooms.value = response.data
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องพัก')
  }
}

const generateBill = async () => {
  try {
    // Validation
    if (!billForm.value.roomId || !billForm.value.month || !billForm.value.year) {
      ElMessage.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    // Debug: Log ข้อมูลก่อนส่ง
    console.log('Sending bill data:', billForm.value)

    const response = await axios.post('/api/bills/generate', {
      roomId: billForm.value.roomId,
      month: billForm.value.month,
      year: parseInt(billForm.value.year) // แปลงเป็น number
    })

    ElMessage.success('สร้างบิลสำเร็จ')
    
    showGenerateDialog.value = false
    billForm.value = {
      roomId: '',
      month: '',
      year: new Date().getFullYear()
    }
    
    fetchBills()
  } catch (error) {
    console.error('Error generating bill:', error)
    
    // Handle specific error messages
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error
      if (errorMessage === 'Bill for this month already exists') {
        ElMessage.error('บิลสำหรับเดือนนี้มีอยู่แล้ว')
      } else if (errorMessage === 'Room not found') {
        ElMessage.error('ไม่พบห้องที่เลือก')
      } else {
        ElMessage.error(`ข้อผิดพลาด: ${errorMessage || 'ข้อมูลที่ส่งไปไม่ถูกต้อง'}`)
      }
    } else {
      ElMessage.error('เกิดข้อผิดพลาดในการสร้างบิล')
    }
  }
}

const togglePaymentStatus = async (bill) => {
  try {
    const newStatus = bill.status === 'paid' ? 'unpaid' : 'paid'
    await axios.put(`/api/bills/${bill._id}/status`, { status: newStatus })
    ElMessage.success('อัปเดตสถานะการจ่ายเงินสำเร็จ')
    fetchBills()
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
  }
}

const printBill = (bill) => {
  selectedBill.value = bill
  showPrintDialog.value = true
}

const deleteBill = async (bill) => {
  try {
    await ElMessageBox.confirm(
      `คุณต้องการลบบิลห้อง ${bill.roomId?.number} เดือน ${bill.month} หรือไม่?`,
      'ยืนยันการลบ',
      {
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        type: 'warning',
      }
    )
    
    await axios.delete(`/api/bills/${bill._id}`)
    ElMessage.success('ลบบิลสำเร็จ')
    fetchBills()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('เกิดข้อผิดพลาดในการลบบิล')
    }
  }
}

const filterBills = () => {
  // This function is called when filter changes
  // The computed property will automatically update
}

onMounted(() => {
  fetchBills()
  fetchRooms()
})
</script>

<style scoped>
.bill-print {
  font-family: 'Sarabun', sans-serif;
}

.bill-header {
  border-bottom: 2px solid #000;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.bill-details {
  margin-bottom: 20px;
}

.bill-details p {
  margin: 8px 0;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.bill-table th,
.bill-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.bill-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.bill-table th:nth-child(2),
.bill-table th:nth-child(3),
.bill-table th:nth-child(4),
.bill-table th:nth-child(5),
.bill-table th:nth-child(6) {
  text-align: center;
}

.bill-table td:nth-child(2),
.bill-table td:nth-child(3),
.bill-table td:nth-child(4),
.bill-table td:nth-child(5),
.bill-table td:nth-child(6) {
  text-align: right;
}

.meter-period {
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}

.total-row {
  font-weight: bold;
  background-color: #f9f9f9;
}

@media print {
  .el-dialog__header,
  .el-dialog__footer {
    display: none !important;
  }
  
  .el-dialog {
    box-shadow: none !important;
  }
}
</style>