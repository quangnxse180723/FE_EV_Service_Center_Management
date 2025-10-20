// technicianService.js — mock API cho module Technician
import { TECH_STATUS, TECH_ACTIONS } from "@/modules/technician/utils/technicianConstants";

let __tickets = [
  {
    id: "TK-2025-0001",
    customerName: "Nguyễn Văn A",
    vehicle: "VinFast Feliz S",
    plate: "29A-123.45",
    schedule: "27/09/2025 08:30",
    status: TECH_STATUS.APPROVED,
    items: [
      { no: 1, name: "Tay phanh", action: TECH_ACTIONS[0], progress: "Hoàn thành", material: 300000, labor: 50000, confirmed: true },
      { no: 2, name: "Đèn/còi/đồng hồ", action: TECH_ACTIONS[1], progress: "Đang xử lý", material: 0, labor: 0, confirmed: false },
      { no: 3, name: "Vỏ bọc, tay ga", action: TECH_ACTIONS[1], progress: "Đang xử lý", material: 0, labor: 0, confirmed: false },
      { no: 4, name: "Chân chống", action: TECH_ACTIONS[2], progress: "Đang xử lý", material: 0, labor: 0, confirmed: false },
      { no: 5, name: "Khóa yên", action: TECH_ACTIONS[0], progress: "Đang xử lý", material: 250000, labor: 45000, confirmed: false },
    ],
  },
  {
    id: "TK-2025-0002",
    customerName: "Nguyễn Văn B",
    vehicle: "Yadea Ulike",
    plate: "30B-456.78",
    schedule: "27/09/2025 09:15",
    status: TECH_STATUS.PENDING,
    items: [
      { no: 1, name: "Thắng đĩa", action: TECH_ACTIONS[1], progress: "Đang xử lý", material: 0, labor: 0, confirmed: false },
    ],
  },
];

function clone(x) { return JSON.parse(JSON.stringify(x)); }
const sleep = (ms=120) => new Promise(r=>setTimeout(r, ms));

export async function fetchServiceTickets() {
  await sleep();
  return clone(__tickets);
}

export async function fetchServiceTicketById(id) {
  await sleep();
  return clone(__tickets.find(t => t.id === id) || null);
}

export async function setItemConfirmed(ticketId, no, confirmed) {
  await sleep();
  const t = __tickets.find(x => x.id === ticketId);
  if (!t) return null;
  const item = t.items.find(i => i.no === no);
  if (!item) return null;
  item.confirmed = confirmed;
  // nếu toàn bộ đã confirm thì chuyển trạng thái sang "Đang xử lý"
  if (t.items.length && t.items.every(i => i.confirmed)) {
    t.status = t.status === TECH_STATUS.DONE ? TECH_STATUS.DONE : TECH_STATUS.PROCESSING;
  }
  return clone(t);
}

export async function updateItemCosts(ticketId, no, material, labor) {
  await sleep();
  const t = __tickets.find(x => x.id === ticketId);
  if (!t) return null;
  const item = t.items.find(i => i.no === no);
  if (!item) return null;
  item.material = Number(material || 0);
  item.labor = Number(labor || 0);
  return clone(t);
}

export async function finalizeTicket(ticketId) {
  await sleep();
  const t = __tickets.find(x => x.id === ticketId);
  if (!t) return null;
  t.items.forEach(i => (i.progress = "Hoàn thành"));
  t.status = TECH_STATUS.DONE;
  return clone(t);
}

export function calcCosts(ticket) {
  const material = ticket.items.reduce((s, i) => s + (i.material || 0), 0);
  const labor = ticket.items.reduce((s, i) => s + (i.labor || 0), 0);
  return { material, labor, total: material + labor };
}

/**************************************************
 *  BỔ SUNG CÁC MOCK API CHO NHỮNG PHẦN CÒN LẠI 
 **************************************************/

//////////////////////////
// Assigned Jobs (mock) //
//////////////////////////
let __assignedJobs = [
  { id: "JOB-01", customerName: "Trần Hùng", vehicle: "VinFast Evo200", plate: "30A-999.66", schedule: "28/09/2025 09:00", status: "Chờ nhận" },
  { id: "JOB-02", customerName: "Lê Hoa",   vehicle: "DatBike Weaver",  plate: "29B-222.88", schedule: "28/09/2025 10:00", status: "Đang xử lý" },
];

export async function fetchAssignedJobs() {
  await sleep();
  return clone(__assignedJobs);
}

export async function acceptJob(jobId) {
  await sleep();
  const j = __assignedJobs.find(x => x.id === jobId);
  if (j && j.status === "Chờ nhận") j.status = "Đang xử lý";
  return clone(j);
}

//////////////////////////
// Dashboard Summary    //
//////////////////////////
export async function getTechDashboardSummary() {
  await sleep();
  const assigned   = __assignedJobs.length;
  const inprogress = __assignedJobs.filter(x => x.status === "Đang xử lý").length;
  const doneToday  = 1; // mock demo
  return { assigned, inprogress, doneToday };
}

//////////////////////////
// Checklist / Inspection
//////////////////////////
let __checklist = [
  { id: 1, name: "Phanh trước/sau",  action: "", note: "" },
  { id: 2, name: "Đèn/còi/đồng hồ",  action: "", note: "" },
  { id: 3, name: "Lốp/áp suất",      action: "", note: "" },
  { id: 4, name: "Xích/nhông/đĩa",   action: "", note: "" },
];

export async function fetchChecklistTemplate() {
  await sleep();
  return clone(__checklist);
}

export async function updateChecklistItem(id, patch) {
  await sleep();
  __checklist = __checklist.map(x => x.id === id ? { ...x, ...patch } : x);
  return clone(__checklist);
}

//////////////////////////
// Get or Create Checklist for InspectionPage
//////////////////////////
let __inspectionRecords = {};

export async function getOrCreateChecklist(recordId) {
  await sleep();
  
  // Nếu đã có record này rồi thì trả về
  if (__inspectionRecords[recordId]) {
    return clone(__inspectionRecords[recordId]);
  }
  
  // Tạo mới checklist cho recordId này
  const newRecord = {
    header: {
      recordId: recordId,
      vehiclePlate: "30A-123.45",
      customerName: "Nguyễn Văn A",
      vehicleModel: "VinFast Feliz S",
      date: new Date().toLocaleDateString('vi-VN'),
      status: "Đang kiểm tra"
    },
    items: [
      { id: 1, name: "Phanh trước/sau", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
      { id: 2, name: "Đèn/còi/đồng hồ", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
      { id: 3, name: "Lốp/áp suất", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
      { id: 4, name: "Xích/nhông/đĩa", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
      { id: 5, name: "Vỏ bọc, tay ga", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
      { id: 6, name: "Chân chống", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
      { id: 7, name: "Khóa yên", action: "Kiểm tra", note: "", partCost: 0, laborCost: 0 },
    ]
  };
  
  __inspectionRecords[recordId] = newRecord;
  return clone(newRecord);
}

export async function submitForApproval(recordId) {
  await sleep();
  
  if (__inspectionRecords[recordId]) {
    __inspectionRecords[recordId].header.status = "Chờ phê duyệt";
    return { ok: true, message: "Đã gửi khách hàng phê duyệt" };
  }
  
  return { ok: false, message: "Không tìm thấy biên bản" };
}

export async function createInspectionRecord(payload) {
  await sleep(200);
  // Tại đây khi nối API thật, bạn thay bằng POST lên server
  return { ok: true, id: "INSP-" + Math.floor(Math.random() * 10000) };
}

//////////////////////////
// Maintenance (mock)   //
//////////////////////////
let __maintenance = [
  { code: "MT-001", customerName: "Ngô Minh",  vehicle: "Yadea X5",        lastDate: "10/09/2025", note: "Thay bố thắng" },
  { code: "MT-002", customerName: "Đặng Tín",  vehicle: "VinFast Feliz",   lastDate: "20/09/2025", note: "Bảo dưỡng định kỳ" },
];

export async function fetchMaintenanceList() {
  await sleep();
  return clone(__maintenance);
}

//////////////////////////
// Certificates (mock)  //
//////////////////////////
let __certs = [
  { code: "CER-ABS", name: "Chứng chỉ sửa ABS",      issuer: "Hãng A", expiredAt: "31/12/2026" },
  { code: "CER-ECU", name: "Chứng chỉ chẩn đoán ECU", issuer: "Hãng B", expiredAt: "30/06/2027" },
];

export async function fetchCertificates() {
  await sleep();
  return clone(__certs);
}

// ===== Dashboard data for technician =====

/**
 * Helper function: Kiểm tra xem ca làm việc có thể check-in không
 * Dựa trên thời gian hiện tại và ngày trong tuần
 * 
 * ⚠️ ĐỂ TEST: Uncomment dòng return true; bên dưới để test
 */
function canCheckinShift(dayOfWeek, startHour) {
  // 🧪 TEST MODE: Bỏ comment dòng này để luôn hiện nút check-in sáng
  return true;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // dayOfWeek đã là số chuẩn: 1 = Monday, 3 = Wednesday, 5 = Friday
  // Kiểm tra có đúng ngày không
  if (currentDay !== dayOfWeek) {
    return false;
  }
  
  // Kiểm tra thời gian (cho phép check-in từ 30 phút trước đến 2 giờ sau giờ bắt đầu)
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startHour * 60;
  const timeDiff = currentTimeInMinutes - startTimeInMinutes;
  
  // Cho phép check-in từ -30 phút đến +120 phút (2 giờ)
  return timeDiff >= -30 && timeDiff <= 120;
}

export async function fetchTechnicianDashboard() {
  // có thể thay bằng API thật. Tạm thời mock với logic time-based
  await sleep(100);
  
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  
  // Tạo shifts với logic check-in dựa trên thời gian
  // now.getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const shifts = [
    { 
      id: 1, 
      label: "Thứ 2 8:00-12:00", 
      progress: 80, 
      canCheckin: canCheckinShift(1, 8), // Monday (1) 8AM
      showCheckin: true,
      dayOfWeek: 1 
    },
    { 
      id: 2, 
      label: "Thứ 4 8:00-12:00", 
      progress: 60, 
      canCheckin: canCheckinShift(3, 8), // Wednesday (3) 8AM
      showCheckin: true,
      dayOfWeek: 3 
    },
    { 
      id: 3, 
      label: "Thứ 6 8:00-12:00", 
      progress: 40, 
      canCheckin: canCheckinShift(5, 8), // Friday (5) 8AM
      showCheckin: true,
      dayOfWeek: 5 
    },
  ];
  
  return {
    processingCount: 2,     // Số xe đang xử lý
    todayTaskCount: 2,      // Công việc trong ngày
    shifts: shifts,
  };
}

// ví dụ check-in (mock)
export async function techCheckinShift(shiftId) {
  await sleep(120);
  return { ok: true, shiftId };
}


