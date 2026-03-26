// ========================================
// src/data/Techsample.jsx
// Mock Data สำหรับระบบจัดการงานซ่อมบำรุง
// ========================================

/**
 * ACTIVITIES - ประวัติกิจกรรมต่างๆ ในระบบ
 */
const ACTIVITIES = [
  {
    id: 1,
    text: 'แผนกสมชาย ใจดี เปลี่ยนสถานะ J002 เป็น กำลังทำ',
    timestamp: '2025-11-21 14:30',
    department: 'ไฟฟ้า'
  },
  {
    id: 2,
    text: 'หัวหน้าแผนกสมหญิง ตรวจสอบและอนุมัติงาน J003',
    timestamp: '2025-11-21 10:15',
    department: 'ไฟฟ้า'
  },
  {
    id: 3,
    text: 'Admin สร้างใบงานใหม่ J006',
    timestamp: '2025-11-20 09:00',
    department: 'ไฟฟ้า'
  },
  {
    id: 4,
    text: 'ใบงาน J004 ถูกมอบหมายให้แผนกประปา',
    timestamp: '2025-11-19 16:20',
    department: 'ประปา'
  }
];

/**
 * sampleJobs - ข้อมูลใบงานตัวอย่าง
 * 
 * โครงสร้างข้อมูล:
 * - id: รหัสใบงาน (เช่น J001)
 * - name: ชื่องาน / รายละเอียดงาน
 * - date: วันที่สร้างงาน
 * - technician: ชื่อช่างที่รับผิดชอบ (null = ยังไม่มอบหมาย)
 * - technicianId: รหัสช่าง
 * - creator: ผู้สร้างงาน
 * - status: สถานะงาน (เสร็จสิ้น, กำลังดำเนินการ, รอตรวจสอบ, รอดำเนินการ)
 * - department: แผนกที่รับผิดชอบ
 * - location: สถานที่ทำงาน
 * - updatedAt: วันที่อัพเดทล่าสุด
 * - priority: ระดับความสำคัญ (ด่วนมาก, สูง, ปานกลาง, ต่ำ)
 * - dueDate: วันครบกำหนด
 */
const sampleJobs = [
  {
    id: 'J001',
    name: 'เปลี่ยนหลอดไฟทางเดิน ชั้น 2 (หลอดขาด 5 จุด)',
    date: '2024-11-10',
    technician: 'วิชัย ช่างดี',
    technicianId: 'tech3',
    creator: 'Admin',
    status: 'เสร็จสิ้น',
    department: 'แผนกไฟฟ้า',
    location: 'ทางเดิน ชั้น 2',
    updatedAt: '2025-11-10 11:20',
    priority: 'ต่ำ',
    dueDate: '2024-11-12'
  },
  {
    id: 'J002',
    name: 'ติดตั้งพัดลมติดผนัง โรงอาหาร',
    date: '2024-11-11',
    technician: 'สมชาย ใจดี',
    technicianId: 'tech1',
    creator: 'Admin',
    status: 'กำลังดำเนินการ',
    department: 'แผนกไฟฟ้า',
    location: 'โรงอาหาร',
    updatedAt: '2025-11-11 16:45',
    priority: 'ปานกลาง',
    dueDate: '2024-11-13'
  },
  {
    id: 'J004',
    name: 'เดินสายไฟเครื่องจักรใหม่ ไลน์การผลิต B',
    date: '2024-11-13',
    technician: null,
    technicianId: null,
    creator: 'Admin',
    status: 'รอดำเนินการ',
    department: '',
    location: 'ไลน์การผลิต B',
    updatedAt: '2025-11-13 10:15',
    priority: 'สูง',
    dueDate: '2024-11-15'
  },
  {
    id: 'J005',
    name: 'ซ่อมพัดลมระบายอากาศเสีย ห้องเก็บสารเคมี',
    date: '2024-11-14',
    technician: null,
    technicianId: null,
    creator: 'Admin',
    status: 'รอดำเนินการ',
    department: '',
    location: 'ห้องเก็บสารเคมี',
    updatedAt: '2025-11-14 10:00',
    priority: 'ปานกลาง',
    dueDate: '2024-11-16'
  },
  {
    id: 'J006',
    name: 'เปลี่ยนแบตเตอรี่ไฟฉุกเฉิน (Emergency Light)',
    date: '2024-11-15',
    technician: null,
    technicianId: null,
    creator: 'Admin',
    status: 'รอดำเนินการ',
    department: '',
    location: 'ทั่วอาคาร',
    updatedAt: '2025-11-15 09:00',
    priority: 'ด่วนมาก',
    dueDate: '2024-11-17'
  },
  {
    id: 'J007',
    name: 'เบรกเกอร์ตัดบ่อย โซนห้องเครื่องจักร',
    date: '2024-11-16',
    technician: null,
    technicianId: null,
    creator: 'Admin',
    status: 'รอดำเนินการ',
    department: '',
    location: 'ห้องเครื่องจักร',
    updatedAt: '2025-11-16 15:00',
    priority: 'สูง',
    dueDate: '2024-11-18'
  },
  {
    id: 'J008',
    name: 'ทาสีกำแพง',
    date: '2024-11-18',
    technician: 'สมศักดิ์ ขยัน',
    technicianId: 'tech2',
    creator: 'Admin',
    status: 'กำลังดำเนินการ',
    department: 'แผนกโครงสร้าง',
    location: 'โรงอาหาร',
    updatedAt: '2025-11-18 08:00',
    priority: 'สูง',
    dueDate: '2024-11-20'
  }
];

// Export ข้อมูลเพื่อใช้ในส่วนอื่นๆ ของระบบ
export default { sampleJobs, ACTIVITIES };