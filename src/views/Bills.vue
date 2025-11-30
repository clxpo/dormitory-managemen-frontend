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
        <el-col :xs="24" :sm="12" :md="6">
          <el-select 
            v-model="filterStatus" 
            placeholder="ทุกสถานะ" 
            style="width: 100%; margin-bottom: 10px;" 
            @change="filterBills"
          >
            <el-option label="ทุกสถานะ" value="" />
            <el-option label="ยังไม่จ่าย" value="unpaid" />
            <el-option label="จ่ายแล้ว" value="paid" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select 
            v-model="filterRoom" 
            placeholder="ทุกห้อง" 
            style="width: 100%;" 
            @change="filterBills"
          >
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

    <!-- Desktop Table View -->
    <el-table 
      v-if="!isMobileView"
      :data="filteredBills" 
      v-loading="loading" 
      style="width: 100%"
    >
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
      <el-table-column label="ค่าส่วนกลาง" width="120">
        <template #default="{ row }">
          ฿{{ row.roomId?.commonFee?.toLocaleString() || 0 }}
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
            แชร์
          </el-button>
          <el-button size="small" type="danger" @click="deleteBill(row)">
            ลบ
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Mobile/Tablet Card View -->
    <div v-else v-loading="loading">
      <el-empty v-if="filteredBills.length === 0" description="ไม่มีข้อมูลบิล" />
      <el-card 
        v-for="bill in filteredBills" 
        :key="bill._id" 
        shadow="hover" 
        class="bill-card"
      >
        <div class="card-header">
          <div class="room-info">
            <span class="room-badge">ห้อง {{ bill.roomId?.number }}</span>
            <span class="tenant-name">{{ bill.roomId?.tenant || 'ไม่มีผู้เช่า' }}</span>
          </div>
          <el-tag :type="bill.status === 'paid' ? 'success' : 'warning'" size="large">
            {{ bill.status === 'paid' ? 'จ่ายแล้ว' : 'ยังไม่จ่าย' }}
          </el-tag>
        </div>

        <div class="period-info">
          <span class="period">{{ bill.month }} {{ bill.year }}</span>
          <span class="due-date">ครบกำหนด: {{ new Date(bill.dueDate).toLocaleDateString('th-TH') }}</span>
        </div>

        <el-divider />

        <div class="bill-details">
          <div class="detail-item">
            <span class="label">ค่าเช่าห้อง</span>
            <span class="value">฿{{ bill.rentFee?.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="label">ค่าส่วนกลาง</span>
            <span class="value">฿{{ bill.roomId?.commonFee?.toLocaleString() || 0 }}</span>
          </div>
          
          <div class="detail-item highlight">
            <div class="label-group">
              <span class="label">ค่าไฟฟ้า</span>
              <span class="usage" v-if="bill.meterData">
                {{ bill.meterData.previous.electric }} → {{ bill.meterData.current.electric }}
              </span>
            </div>
            <div class="value-group">
              <span class="usage-badge">{{ bill.electricUsage }} หน่วย</span>
              <span class="value">฿{{ bill.electricCost?.toLocaleString() }}</span>
            </div>
          </div>

          <div class="detail-item highlight">
            <div class="label-group">
              <span class="label">ค่าน้ำประปา</span>
              <span class="usage" v-if="bill.meterData">
                {{ bill.meterData.previous.water }} → {{ bill.meterData.current.water }}
              </span>
            </div>
            <div class="value-group">
              <span class="usage-badge">{{ bill.waterUsage }} หน่วย</span>
              <span class="value">฿{{ bill.waterCost?.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="total-section">
          <span class="total-label">รวมทั้งหมด</span>
          <span class="total-value">฿{{ bill.totalAmount?.toLocaleString() }}</span>
        </div>

        <div class="card-actions">
          <el-button 
            :type="bill.status === 'paid' ? 'warning' : 'success'"
            @click="togglePaymentStatus(bill)"
            style="flex: 1"
          >
            {{ bill.status === 'paid' ? 'ยกเลิกจ่าย' : 'จ่ายแล้ว' }}
          </el-button>
          <el-button 
            type="info" 
            @click="printBill(bill)"
            style="flex: 1"
          >
            แชร์
          </el-button>
          <el-button 
            type="danger" 
            @click="deleteBill(bill)"
            style="flex: 1"
          >
            ลบ
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- Generate Bill Dialog -->
    <el-dialog 
      v-model="showGenerateDialog" 
      title="สร้างบิลรายเดือน" 
      :width="isMobileView ? '90%' : '400px'"
      center
      align-center
    >
      <el-form :model="billForm" :label-width="isMobileView ? '80px' : '100px'">
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

    <!-- Share Bill Dialog -->
    <el-dialog 
      v-model="showPrintDialog" 
      title="แชร์ใบแจ้งหนี้" 
      :width="isMobileView ? '95%' : '700px'"
      center
      align-center
      :fullscreen="isMobileView"
    >
      <div v-if="selectedBill" class="bill-container">
        <!-- Bill Content for Image Generation -->
        <div ref="billContent" class="bill-print" id="bill-to-share">
          <div class="bill-header">
            <h2 style="text-align: center; margin: 0; color: #333;">ใบแจ้งค่าเช่าห้องพัก</h2>
            <div style="text-align: center; margin: 15px 0; font-size: 18px; color: #666;">
              <strong>{{ selectedBill.month }} {{ selectedBill.year }}</strong>
            </div>
          </div>
          
          <div class="bill-details-print">
            <div class="detail-row">
              <span class="detail-label">ห้อง:</span>
              <span class="detail-value">{{ selectedBill.roomId?.number }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ผู้เช่า:</span>
              <span class="detail-value">{{ selectedBill.roomId?.tenant || 'ไม่มีผู้เช่า' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">วันที่ครบกำหนด:</span>
              <span class="detail-value">{{ new Date(selectedBill.dueDate).toLocaleDateString('th-TH') }}</span>
            </div>
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
                <td>฿{{ selectedBill.rentFee?.toLocaleString() }}</td>
                <td>฿{{ selectedBill.rentFee?.toLocaleString() }}</td>
              </tr>
              <tr>
                <td>ค่าส่วนกลาง</td>
                <td>-</td>
                <td>-</td>
                <td>1 เดือน</td>
                <td>฿{{ selectedBill.roomId?.commonFee?.toLocaleString() || 0 }}</td>
                <td>฿{{ (selectedBill.roomId?.commonFee || 0).toLocaleString() }}</td>
              </tr>
              <tr>
                <td>ค่าไฟฟ้า</td>
                <td>{{ selectedBill.meterData?.previous?.electric || '-' }}</td>
                <td>{{ selectedBill.meterData?.current?.electric || '-' }}</td>
                <td>{{ selectedBill.electricUsage || 0 }} หน่วย</td>
                <td>฿{{ selectedBill.roomId?.electricRate || 0 }}/หน่วย</td>
                <td>฿{{ selectedBill.electricCost?.toLocaleString() || '0' }}</td>
              </tr>
              <tr>
                <td>ค่าน้ำประปา</td>
                <td>{{ selectedBill.meterData?.previous?.water || '-' }}</td>
                <td>{{ selectedBill.meterData?.current?.water || '-' }}</td>
                <td>{{ selectedBill.waterUsage || 0 }} หน่วย</td>
                <td>฿{{ selectedBill.roomId?.waterRate || 0 }}/หน่วย</td>
                <td>฿{{ selectedBill.waterCost?.toLocaleString() || '0' }}</td>
              </tr>
              <tr class="total-row">
                <td colspan="5"><strong>รวมทั้งสิ้น</strong></td>
                <td><strong>฿{{ selectedBill.totalAmount?.toLocaleString() }}</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- แสดงช่วงเวลาการอ่านมิเตอร์ -->
          <div class="meter-period" v-if="selectedBill.meterData">
            <p style="text-align: center; color: #666; margin: 15px 0; font-size: 14px;">
              การใช้งานตั้งแต่ {{ selectedBill.meterData.previous.month }} {{ selectedBill.meterData.previous.year }} 
              ถึง {{ selectedBill.meterData.current.month }} {{ selectedBill.meterData.current.year }}
            </p>
          </div>

          <!-- แสดงรายละเอียดเพิ่มเติมใต้ช่วงการใช้งาน (ถ้ามี) -->
          <div v-if="selectedBill.roomId?.additionalDetails" style="text-align: center; color: #666; margin-top: 10px; font-size: 13px;">
            {{ selectedBill.roomId.additionalDetails }}
          </div>

          <!-- แจ้งเตือนเมื่อไม่มีข้อมูลมิเตอร์ -->
          <div v-if="!selectedBill.meterData" class="no-meter-warning">
            <p style="text-align: center; color: #856404; margin: 15px 0; font-size: 14px;">
              ⚠️ ไม่พบข้อมูลการอ่านมิเตอร์สำหรับเดือนนี้
              <br>กรุณาบันทึกข้อมูลมิเตอร์ก่อนสร้างบิล
            </p>
          </div>
        </div>

        <!-- Preview Generated Image -->
        <div v-if="generatedImageUrl" class="image-preview">
          <h4>ตัวอย่างภาพที่สร้างขึ้น:</h4>
          <img :src="generatedImageUrl" alt="Bill Image" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPrintDialog = false">ปิด</el-button>
          <el-button 
            type="success" 
            @click="generateBillImage" 
            :loading="isGeneratingImage"
            :disabled="isGeneratingImage"
          >
            <el-icon v-if="!isGeneratingImage"><Picture /></el-icon>
            {{ isGeneratingImage ? 'กำลังสร้างภาพ...' : 'สร้างภาพ' }}
          </el-button>
          
          <!-- Share Options (show only when image is generated) -->
          <template v-if="generatedImageUrl">
            <el-button 
              type="warning" 
              @click="saveImageToDevice"
            >
              <el-icon><Download /></el-icon>
              แชร์
            </el-button>
            <el-button 
              type="info" 
              @click="downloadImage"
            >
              <el-icon><Download /></el-icon>
              ดาวน์โหลด
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture, Download } from '@element-plus/icons-vue'
import api from '@/api'

const bills = ref([])
const rooms = ref([])
const loading = ref(false)
const showGenerateDialog = ref(false)
const showPrintDialog = ref(false)
const selectedBill = ref(null)
const filterStatus = ref('')
const filterRoom = ref('')
const isGeneratingImage = ref(false)
const generatedImageUrl = ref('')
const billContent = ref(null)
const screenWidth = ref(window.innerWidth)

const isMobileView = computed(() => screenWidth.value <= 1024)

const billForm = ref({
  roomId: '',
  month: '',
  year: new Date().getFullYear()
})

// Function to load html2canvas library
const loadHtml2Canvas = async () => {
  if (window.html2canvas) {
    return window.html2canvas
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    script.onload = () => {
      if (window.html2canvas) {
        resolve(window.html2canvas)
      } else {
        reject(new Error('Failed to load html2canvas'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load html2canvas script'))
    document.head.appendChild(script)
  })
}

// ฟังก์ชันเฉพาะสำหรับบันทึกลงเครื่อง (สำหรับมือถือ)
const saveImageToDevice = async () => {
  if (!generatedImageUrl.value) {
    await generateBillImage()
  }
  
  try {
    const response = await fetch(generatedImageUrl.value)
    const blob = await response.blob()
    const filename = `Bill_Room${selectedBill.value.roomId?.number}_${selectedBill.value.month}${selectedBill.value.year}.png`
    
    // สำหรับมือถือ: ใช้ Share API เพื่อบันทึก
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'image/png' })
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'แจ้งค่าเช่าค่ะ',
        })
        return
      }
    }
    
    // Fallback: ดาวน์โหลดแบบปกติ
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success('บันทึกรูปภาพสำเร็จ!')
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Save error:', error)
      ElMessage.error('ไม่สามารถบันทึกได้')
    }
  }
}

// Function to convert HTML to Canvas and then to Image
const generateBillImage = async () => {
  try {
    isGeneratingImage.value = true
    
    // Reset previous image
    generatedImageUrl.value = ''
    
    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const element = billContent.value
    if (!element) {
      throw new Error('ไม่พบเนื้อหาบิลที่จะสร้างภาพ')
    }

    // Load html2canvas library
    const html2canvas = await loadHtml2Canvas()
    
    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      removeContainer: true,
      async: true
    })
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          generatedImageUrl.value = url
          ElMessage.success('สร้างภาพสำเร็จ!')
          resolve({ blob, url })
        } else {
          reject(new Error('ไม่สามารถสร้างภาพได้'))
        }
      }, 'image/png', 0.95)
    })
  } catch (error) {
    console.error('Error generating image:', error)
    ElMessage.error('เกิดข้อผิดพลาดในการสร้างภาพ')
    throw error
  } finally {
    isGeneratingImage.value = false
  }
}

// Function to download the image
const downloadImage = () => {
  if (!generatedImageUrl.value) {
    ElMessage.error('ไม่มีภาพให้ดาวน์โหลด')
    return
  }
  
  const filename = `ใบแจ้งหนี้_ห้อง${selectedBill.value.roomId?.number}_${selectedBill.value.month}_${selectedBill.value.year}.png`
  
  const link = document.createElement('a')
  link.href = generatedImageUrl.value
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('ดาวน์โหลดภาพสำเร็จ!')
}

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
    const response = await api.get('/bills')
    bills.value = response.data
  } catch (error) {
    console.error('Error fetching bills:', error)
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลบิล')
  }
  loading.value = false
}

const fetchRooms = async () => {
  try {
    const response = await api.get('/rooms')
    rooms.value = response.data
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องพัก')
  }
}

const generateBill = async () => {
  try {
    if (!billForm.value.roomId || !billForm.value.month || !billForm.value.year) {
      ElMessage.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const response = await api.post('/bills/generate', {
      roomId: billForm.value.roomId,
      month: billForm.value.month,
      year: parseInt(billForm.value.year)
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
    await api.put(`/bills/${bill._id}/status`, { status: newStatus })
    ElMessage.success('อัปเดตสถานะการจ่ายเงินสำเร็จ')
    fetchBills()
  } catch (error) {
    ElMessage.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
  }
}

const printBill = (bill) => {
  selectedBill.value = bill
  generatedImageUrl.value = ''
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
    
    await api.delete(`/bills/${bill._id}`)
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

const handleResize = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  fetchBills()
  fetchRooms()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Mobile Card Styles */
.bill-card {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.room-badge {
  background-color: #409eff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.tenant-name {
  color: #606266;
  font-size: 13px;
  margin-left: 2px;
}

.period-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
  margin-bottom: 10px;
}

.period {
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}

.due-date {
  color: #909399;
  font-size: 13px;
}

.bill-details {
  margin: 15px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item.highlight {
  background: #f9fafb;
  padding: 10px;
  margin: 8px -10px;
  border-radius: 6px;
  border-bottom: none;
}

.label-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.usage {
  font-size: 11px;
  color: #909399;
}

.value-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.usage-badge {
  background: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  margin: 15px -10px;
}

.total-label {
  font-weight: 700;
  color: #409eff;
  font-size: 16px;
}

.total-value {
  font-weight: 700;
  color: #409eff;
  font-size: 18px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

/* Bill Print Styles */
.bill-container {
  max-height: 70vh;
  overflow-y: auto;
}

.bill-print {
  font-family: 'Sarabun', Arial, sans-serif;
  background: #ffffff;
  padding: 30px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.bill-header {
  border-bottom: 3px solid #409EFF;
  padding-bottom: 20px;
  margin-bottom: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: -30px -30px 25px -30px;
  padding: 30px 30px 20px 30px;
  border-radius: 8px 8px 0 0;
}

.bill-details-print {
  margin-bottom: 25px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #333;
  min-width: 120px;
}

.detail-value {
  font-weight: 500;
  color: #666;
  text-align: right;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
  font-size: 14px;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.bill-table th,
.bill-table td {
  border: 1px solid #e0e0e0;
  padding: 14px 10px;
  text-align: left;
}

.bill-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  text-align: center;
  font-size: 13px;
}

.bill-table td {
  background: white;
  transition: background-color 0.2s;
}

.bill-table tr:nth-child(even) td {
  background: #fafafa;
}

.bill-table td:nth-child(2),
.bill-table td:nth-child(3),
.bill-table td:nth-child(4),
.bill-table td:nth-child(5),
.bill-table td:nth-child(6) {
  text-align: right;
  font-family: 'Courier New', monospace;
}

.total-row {
  font-weight: bold;
}

.total-row td {
  background: #e8f4fd !important;
  border-top: 2px solid #409EFF !important;
  font-size: 16px;
  padding: 16px 10px;
}

.meter-period {
  border-top: 2px solid #eee;
  padding-top: 15px;
  margin-top: 20px;
  background: #f0f9ff;
  margin-left: -30px;
  margin-right: -30px;
  padding: 15px 30px;
}

.no-meter-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  margin: 20px -30px -30px -30px;
  padding: 15px 30px 30px 30px;
  border-radius: 0 0 8px 8px;
}

.image-preview {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px dashed #ccc;
  margin-top: 20px;
}

.image-preview h4 {
  margin-top: 0;
  color: #606266;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .bill-card {
    margin-bottom: 12px;
  }
}

@media (max-width: 768px) {
  .room-badge {
    font-size: 13px;
    padding: 3px 10px;
  }
  
  .tenant-name {
    font-size: 12px;
  }
  
  .period {
    font-size: 14px;
  }
  
  .due-date {
    font-size: 12px;
  }
  
  .card-actions {
    flex-wrap: wrap;
  }
  
  .card-actions .el-button {
    flex: 1 1 calc(50% - 4px);
    min-width: calc(50% - 4px);
  }
  
  .card-actions .el-button:last-child {
    flex: 1 1 100%;
  }

  /* Bill Print Responsive */
  .bill-print {
    padding: 20px;
    font-size: 12px;
  }
  
  .bill-table {
    font-size: 11px;
  }
  
  .bill-table th,
  .bill-table td {
    padding: 8px 6px;
  }
  
  .bill-header {
    margin: -20px -20px 20px -20px;
    padding: 20px;
  }
  
  .bill-header h2 {
    font-size: 18px;
  }
  
  .bill-details-print {
    padding: 15px;
  }
  
  .meter-period,
  .no-meter-warning {
    margin-left: -20px;
    margin-right: -20px;
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .dialog-footer {
    justify-content: center;
  }
  
  .dialog-footer .el-button {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .total-section {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .bill-table th,
  .bill-table td {
    padding: 6px 4px;
    font-size: 10px;
  }
  
  .bill-header h2 {
    font-size: 16px;
  }
}

/* Dialog Responsive */
@media (max-width: 1024px) {
  :deep(.el-dialog) {
    margin: 5vh auto !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 15px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  :deep(.el-dialog__header) {
    padding: 15px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 15vh auto !important;
  }
  
  :deep(.el-dialog.is-fullscreen) {
    margin: 0 !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 12px;
  }
  
  :deep(.el-dialog__header) {
    padding: 12px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>