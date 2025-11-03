import axiosClient from '../../../api/axiosClient'; // Đảm bảo đường dẫn này đúng

// Lấy technicianId từ localStorage
const getTechnicianId = () => {
  let id = null;

  // CÁCH 1: Lấy trực tiếp 'technicianId' (được lưu ở Bước 4)
  id = localStorage.getItem('technicianId');
  if (id && id !== 'undefined' && id !== 'null') {
    console.log('✅ (Cách 1) Lấy ID từ "technicianId":', id);
    return id;
  }

  // CÁCH 2: Lấy từ 'user' object (cũng được lưu ở Bước 4)
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      // Ưu tiên technicianId, sau đó mới đến các ID khác
      id = user.technicianId || user.id || user.accountId || user.userId; 
      if (id && id !== 'undefined' && id !== 'null') {
        console.log('✅ (Cách 2) Lấy ID từ "user" object:', id);
        return id;
      }
    }
  } catch (e) {
    console.error('Lỗi parse user từ localStorage:', e);
  }

  // CÁCH 3: (Dự phòng) Lấy từ 'accountId'
  id = localStorage.getItem('accountId');
  if (id && id !== 'undefined' && id !== 'null') {
    console.warn('⚠️ (Cách 3) Không tìm thấy "technicianId", dùng "accountId" dự phòng:', id);
    return id;
  }

  // Nếu cả 3 cách đều thất bại
  console.error('❌ LỖI: Không tìm thấy technicianId trong localStorage.');
  console.log('   Đã kiểm tra "technicianId", "user.technicianId", và "accountId".');
  console.log('   Đảm bảo backend trả về "technicianId" khi đăng nhập.');
  return null; // Trả về null để API call thất bại rõ ràng
};

/**
 * Lấy danh sách xe được phân công cho kỹ thuật viên
 * @param {string} status - Trạng thái lọc: "ALL", "ASSIGNED", "IN_PROGRESS"
 * @returns {Promise<Array>} Danh sách xe được phân công
 */
export async function fetchAssignedJobs(status = "ALL") {
  try {
    const id = getTechnicianId(); // Tự động lấy ID
    
    if (!id) {
      // Nếu không có ID, không gọi API
      throw new Error("Không thể lấy ID kỹ thuật viên từ localStorage.");
    }
    
    let response;
    if (status === "ALL") {
      // Gọi API lấy tất cả xe được phân công
      console.log(`🔵 Gọi API: /technician/${id}/assigned-vehicles`);
      response = await axiosClient.get(`/technician/${id}/assigned-vehicles`);
    } else {
      // Gọi API lọc theo trạng thái
      console.log(`🔵 Gọi API: /technician/${id}/assigned-vehicles/filter?status=${status}`);
      response = await axiosClient.get(`/technician/${id}/assigned-vehicles/filter`, {
        params: { status }
      });
    }
    
    // Áp dụng mapping từ response backend sang frontend
    return mapVehicleResponse(response);

  } catch (error) {
    console.error('Error fetching assigned jobs:', error);
    throw error;
  }
}

/**
 * Mapping response từ backend sang format của frontend
 * Backend (VehicleAssignmentResponse): scheduleId, customerName, vehicleModel, licensePlate, status, scheduledDate
 * Frontend (AssignedJobsPage): record_id, customer_name, vehicle_model, license_plate, appointment_time, status
 */
function mapVehicleResponse(vehicles) {
  if (!Array.isArray(vehicles)) {
    console.warn('⚠️ Dữ liệu trả về không phải là một mảng:', vehicles);
    return [];
  }
  
  return vehicles.map(v => ({
    record_id: v.scheduleId,
    customer_name: v.customerName,
    vehicle_model: v.vehicleModel,
    license_plate: v.licensePlate,
    appointment_time: v.scheduledDate || v.appointmentTime, // Dùng scheduledDate từ backend
    status: mapStatus(v.status) // Mapping trạng thái
  }));
}

// Helper map trạng thái từ tiếng Anh (backend) sang tiếng Việt (frontend)
function mapStatus(status) {
  const statusUpper = (status || '').toUpperCase();
  switch (statusUpper) {
    case 'PENDING':
      return 'Chờ nhận';
    case 'IN_PROGRESS':
      return 'Đang kiểm tra';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return status;
  }
}


/**
 * Check-in xe (Xác nhận nhận xe)
 */
export async function checkInRecord(scheduleId) {
  try {
    console.log('🔵 Gọi check-in API:', `/technician/check-in/${scheduleId}`);
    // TODO: Backend cần API này, ví dụ:
    // const response = await axiosClient.post(`/technician/check-in/${scheduleId}`);
    // return response;
    
    // ---- GIẢ LẬP ----
    await new Promise(r => setTimeout(r, 100)); // Giả lập gọi API
    console.log('✅ (Giả lập) Check-in thành công cho:', scheduleId);
    return { success: true };
    // ---- HẾT GIẢ LẬP ----

  } catch (error) {
    console.error('❌ Error checking in record:', error);
    throw error;
  }
}

/**
 * Lấy hoặc tạo checklist cho xe
 */
export async function getOrCreateChecklist(scheduleId) {
  try {
    console.log('🔵 Gọi API thật:', `/service-ticket/${scheduleId}/detail`);
    
    // BƯỚC 1: GỌI API THẬT (thay vì mock data)
    const response = await axiosClient.get(`/service-ticket/${scheduleId}/detail`);
    
    console.log('✅ Lấy checklist thật thành công:', response);
    // response bây giờ có dạng:
    // { customerName, vehicleName, licensePlate, appointmentDateTime, items: [...] }

    // BƯỚC 2: Map dữ liệu backend sang format frontend (header, items)
    const header = {
      owner: response.customerName,
      vehicle: response.vehicleName,
      license: response.licensePlate,
      dateTime: response.appointmentDateTime
    };

    const items = response.items.map((item, index) => ({
      id: item.stt || index + 1, // Dùng stt (số thứ tự) làm ID
      name: item.partName || '',
      status: item.actionStatus || 'Kiểm tra', // actionStatus là "Thay thế", "Bôi trơn", ...
      
      // Lấy chi phí thật từ backend
      // partCost: Giá gốc từ backend (sẽ được frontend tính +10% khi hiển thị)
      partCost: item.materialCost || 0,
      laborCost: item.laborCost || 0,
      
      // Lưu giá gốc để khôi phục khi cần (khi đổi status về "Thay thế")
      originalPartCost: item.materialCost || 0, 
      originalLaborCost: item.laborCost || 0 
    }));
    
    console.log('🔄 Đã map dữ liệu:', { header, items });

    return { header, items };

  } catch (error) {
    console.error('❌ Error getting real checklist:', error);
    console.error('❌ API endpoint tried:', `/service-ticket/${scheduleId}/detail`);
    // Fallback về dữ liệu rỗng nếu lỗi
    return { header: { owner: "Lỗi tải dữ liệu", vehicle: "Vui lòng thử lại" }, items: [] };
  }
}

/**
 * Gửi biên bản cho khách hàng duyệt
 */
export async function submitForApproval(scheduleId) {
  try {
    console.log('🔵 Gọi submit approval API:', `/technician/submit-for-approval/${scheduleId}`);
    
    // TODO: Backend cần API này
    // const response = await axiosClient.post(`/technician/submit-for-approval/${scheduleId}`);
    // return response;

    // ---- GIẢ LẬP ----
    await new Promise(r => setTimeout(r, 100));
    console.log('✅ (Giả lập) Gửi duyệt thành công cho:', scheduleId);
    return { success: true };
    // ---- HẾT GIẢ LẬP ----

  } catch (error) {
    console.error('❌ Error submitting for approval:', error);
    throw error;
  }
}

// Các hàm khác (fetchServiceTickets, getServiceTicketDetail) giữ nguyên...

/**
 * Lấy danh sách phiếu dịch vụ cho kỹ thuật viên
 * @param {number} technicianId - ID của kỹ thuật viên (optional, mặc định lấy từ localStorage)
 * @returns {Promise<Array>} Danh sách phiếu dịch vụ
 */
export async function fetchServiceTickets(technicianId = null) {
  try {
    const id = technicianId || getTechnicianId();
    const response = await axiosClient.get(`/technician/${id}/service-tickets`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching service tickets:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết phiếu dịch vụ cho kỹ thuật viên
 * @param {number} scheduleId - ID của schedule (từ URL params)
 * @returns {Promise<Object>} Chi tiết phiếu dịch vụ
 */
export async function getServiceTicketDetail(scheduleId) {
  try {
    console.log('🔍 Calling API: /service-ticket/' + scheduleId + '/detail');
    const response = await axiosClient.get(`/service-ticket/${scheduleId}/detail`);
    console.log('✅ API Response:', response);
    console.log('📋 Items count:', response.items?.length || 0);
    
    // Kiểm tra nếu items rỗng
    if (!response.items || response.items.length === 0) {
      console.warn('⚠️ Backend trả về items rỗng. Có thể do:');
      console.warn('   1. Schedule này chưa được gán gói bảo dưỡng (maintenancePackage = null)');
      console.warn('   2. Gói bảo dưỡng không có hạng mục mẫu trong bảng PackageChecklistItem');
      console.warn('   3. Cần kiểm tra database: SELECT * FROM maintenanceschedule WHERE schedule_id = ' + scheduleId);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching service ticket detail:', error);
    console.error('   API endpoint:', `/service-ticket/${scheduleId}/detail`);
    throw error;
  }
}

