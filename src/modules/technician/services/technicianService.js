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
// Hàm này dùng chung cho tất cả các trang: Xe được phân công, Phiếu dịch vụ, Chi tiết phiếu
function mapStatus(status) {
  if (!status) return status;
  
  const statusUpper = status.toString().toUpperCase().trim();
  
  // Nếu đã là tiếng Việt thì giữ nguyên
  if (statusUpper.includes('CHỜ') || statusUpper.includes('ĐÃ') || 
      statusUpper.includes('ĐANG') || statusUpper.includes('HOÀN')) {
    return status;
  }
  
  // Mapping trạng thái (thống nhất cho tất cả trang)
  const statusMap = {
    // Trạng thái chính
    'PENDING': 'Chờ nhận',
    'APPROVED': 'Đã duyệt',
    'IN_PROGRESS': 'Đang kiểm tra',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'REJECTED': 'Từ chối',
    
    // Các biến thể khác
    'WAITING': 'Chờ duyệt',
    'DONE': 'Hoàn thành',
    'ASSIGNED': 'Đã phân công',
    'NOT_STARTED': 'Chưa bắt đầu',
    'PROCESSING': 'Đang xử lý'
  };
  
  return statusMap[statusUpper] || status;
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
    console.log('🔍 DEBUG: response.checklistId =', response.checklistId);
    console.log('🔍 DEBUG: Full response keys:', Object.keys(response));
    
    // response bây giờ có dạng:
    // { checklistId, customerName, vehicleName, licensePlate, appointmentDateTime, items: [...] }

    // BƯỚC 2: Map dữ liệu backend sang format frontend (header, items)
    const header = {
      checklistId: response.checklistId || null, // Lưu checklistId để gửi duyệt
      scheduleId: scheduleId, // Fallback: lưu scheduleId nếu backend chưa trả checklistId
      owner: response.customerName,
      vehicle: response.vehicleName,
      license: response.licensePlate,
      dateTime: response.appointmentDateTime
    };
    
    // Log warning nếu không có checklistId
    if (!response.checklistId) {
      console.warn('⚠️ Backend chưa trả về checklistId! Cần thêm field này vào ServiceTicketDetailResponse');
      console.warn('⚠️ Tạm thời sẽ dùng scheduleId để gửi duyệt (cần backend hỗ trợ)');
    }

    const items = response.items.map((item, index) => ({
      id: item.stt || index + 1, // Dùng stt (số thứ tự) làm ID hiển thị
      itemId: item.itemId || null, // ✅ Lưu itemId để update
      name: item.partName || '',
      status: item.actionStatus || 'Kiểm tra', // actionStatus là "Thay thế", "Bôi trơn", ...
      
      // Lấy chi phí thật từ backend
      // partCost là giá gốc (không +10% nữa)
      partCost: item.partCost || 0,
      laborCost: item.laborCost || 0,
      
      // Lưu giá gốc để khôi phục khi cần (khi đổi status về "Thay thế")
      originalPartCost: item.partCost || 0, 
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
 * Cập nhật checklist items (lưu thay đổi giá, status)
 * @param {number} scheduleId - ID của MaintenanceSchedule
 * @param {Array} items - Danh sách items đã chỉnh sửa
 */
export async function updateChecklist(scheduleId, items) {
  try {
    console.log('🔵 Gọi update checklist API:', `/technician/checklist/${scheduleId}`);
    console.log('🔍 DEBUG: items TRƯỚC KHI GỬI:', items);
    
    // Map items từ frontend sang format backend (UpdateChecklistRequest)
    const payload = {
      items: items.map(item => {
        const mapped = {
          itemId: item.itemId || null, // null nếu là item mới
          partName: item.name,
          status: item.status, // "Thay thế", "Kiểm tra", "Bôi trơn"
          materialCost: item.partCost || 0, // Giá vật tư
          laborCost: item.laborCost || 0 // Giá nhân công
        };
        
        console.log(`🔍 Item "${item.name}":`, {
          status: item.status,
          partCost: item.partCost,
          laborCost: item.laborCost,
          '→ Gửi lên': mapped
        });
        
        return mapped;
      })
    };
    
    console.log('🔍 DEBUG: payload GỬI LÊN BACKEND:', JSON.stringify(payload, null, 2));
    
    const response = await axiosClient.put(`/technician/checklist/${scheduleId}`, payload);
    console.log('✅ Cập nhật checklist thành công:', response);
    return response;

  } catch (error) {
    console.error('❌ Error updating checklist:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
}

/**
 * Gửi biên bản cho khách hàng duyệt
 * @param {number} scheduleId - ID của MaintenanceSchedule
 */
export async function submitForApproval(scheduleId) {
  try {
    console.log('🔵 Gọi submit approval API:', `/technician/submit-for-approval/${scheduleId}`);
    
    const response = await axiosClient.post(`/technician/submit-for-approval/${scheduleId}`);
    console.log('✅ Gửi duyệt thành công:', response);
    return response;

  } catch (error) {
    console.error('❌ Error submitting for approval:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    
    // Log thêm để debug
    if (error.response?.status === 500) {
      console.error('🔍 Backend Error 500 - Kiểm tra:');
      console.error('   1. checklistId có tồn tại trong DB không?');
      console.error('   2. Backend log có stack trace gì?');
      console.error('   3. Checklist có đầy đủ dữ liệu (customer, items) không?');
    }
    
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
    
    // Mapping trạng thái sang tiếng Việt (dùng hàm mapStatus chung)
    const mappedResponse = Array.isArray(response) ? response.map(ticket => ({
      ...ticket,
      status: mapStatus(ticket.status)
    })) : [];
    
    return mappedResponse;
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
    
    // Mapping trạng thái processStatus sang tiếng Việt cho từng item
    if (response.items && Array.isArray(response.items)) {
      response.items = response.items.map(item => ({
        ...item,
        processStatus: mapStatus(item.processStatus)
      }));
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching service ticket detail:', error);
    console.error('   API endpoint:', `/service-ticket/${scheduleId}/detail`);
    throw error;
  }
}

/**
 * Xác nhận hoàn thành một hạng mục (set status = DONE)
 * @param {number} itemId - ID của item
 * @returns {Promise<void>}
 */
export async function confirmItemCompletion(itemId) {
  try {
    console.log('🔍 Confirming item completion:', itemId);
    await axiosClient.put(`/service-ticket/item/${itemId}/confirm`);
    console.log('✅ Item confirmed successfully');
  } catch (error) {
    console.error('❌ Error confirming item:', error);
    throw error;
  }
}

/**
 * Lấy danh sách biên bản kiểm tra của kỹ thuật viên
 * @param {number} technicianId - ID của kỹ thuật viên (optional, mặc định lấy từ localStorage)
 * @returns {Promise<Array>} Danh sách biên bản kiểm tra
 */
export async function fetchInspectionReports(technicianId = null) {
  try {
    const id = technicianId || getTechnicianId();
    // Sử dụng lại API service-tickets nhưng có thể backend cần endpoint riêng
    // Hoặc dùng: /technician/${id}/inspection-reports
    const response = await axiosClient.get(`/technician/${id}/service-tickets`);
    
    // Mapping trạng thái sang tiếng Việt và đổi tên field
    const mappedResponse = Array.isArray(response) ? response.map(report => ({
      ...report,
      inspectionDate: report.startTime || report.scheduledDate, // Đổi tên field
      status: mapStatus(report.status)
    })) : [];
    
    return mappedResponse;
  } catch (error) {
    console.error('Error fetching inspection reports:', error);
    throw error;
  }
}

/**
 * Xác nhận hoàn thành toàn bộ lịch hẹn (set status = COMPLETED)
 * @param {number} scheduleId - ID của schedule
 * @returns {Promise<void>}
 */
export async function completeSchedule(scheduleId) {
  try {
    console.log('🔍 Completing schedule:', scheduleId);
    await axiosClient.put(`/service-ticket/${scheduleId}/complete`);
    console.log('✅ Schedule completed successfully');
  } catch (error) {
    console.error('❌ Error completing schedule:', error);
    throw error;
  }
}

