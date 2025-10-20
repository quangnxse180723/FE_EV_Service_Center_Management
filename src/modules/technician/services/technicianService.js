// MOCK SERVICE — thay thế bằng axios gọi backend khi có API thật
// Bạn có thể tạo http client: import axios from "axios"; const http = axios.create({ baseURL: import.meta.env.VITE_API_URL });

const mockJobs = [
  { record_id:101, customer_name:"Nguyễn Văn A", vehicle_model:"VinFast Feliz S", license_plate:"29A-123.45", appointment_time:"08:30", status:"Chờ nhận" },
  { record_id:102, customer_name:"Nguyễn Văn B", vehicle_model:"Yadea Ulike",        license_plate:"30B-456.78", appointment_time:"08:30", status:"Đang kiểm tra" },
];

const mockHeader = { owner:"Nguyễn Văn A", vehicle:"VinFast Feliz S", license:"29A-123.45", dateTime:"27/09/2025 08:30" };
const mockItems = [
  { id:1, name:"Tay phanh", status:"Thay thế", partCost:300000, laborCost:50000 },
  { id:2, name:"Đèn/ còi/ hiển thị đồng hồ", status:"Kiểm tra", partCost:0, laborCost:0 },
  { id:3, name:"Vỏ bọc, tay ga", status:"Kiểm tra", partCost:0, laborCost:0 },
  { id:4, name:"Chân chống cạnh/ đứng", status:"Bôi trơn", partCost:0, laborCost:0 },
  { id:5, name:"Cơ cấu khóa yên xe", status:"Thay thế", partCost:250000, laborCost:45000 },
];

export async function fetchAssignedJobs(technicianId, status="ALL") {
  // TODO: gọi GET /api/technicians/{id}/jobs?status=...
  await delay(150);
  if (status==="ASSIGNED") return mockJobs.filter(j=>j.status==="Chờ nhận");
  if (status==="IN_PROGRESS") return mockJobs.filter(j=>j.status!=="Chờ nhận");
  return mockJobs;
}

export async function checkInRecord(recordId) {
  // TODO: POST /api/records/{recordId}/check-in
  await delay(120);
  const idx = mockJobs.findIndex(j=>j.record_id===recordId);
  if (idx>=0) mockJobs[idx].status="Đang kiểm tra";
  return { ok:true };
}

export async function getOrCreateChecklist(recordId) {
  // TODO: GET /api/records/{id}/checklist (nếu 404 thì POST tạo mới)
  await delay(150);
  return { header: mockHeader, items: mockItems };
}

export async function submitForApproval(recordId) {
  // TODO: POST /api/records/{id}/submit-for-approval
  await delay(120);
  return { ok:true };
}

function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
