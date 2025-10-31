import axiosClient from '../../../api/axiosClient';

// Lấy technicianId từ localStorage (được lưu khi login)
const getTechnicianId = () => {
  // Thử lấy từ accountId
  let id = localStorage.getItem('accountId');
  
  // Nếu accountId là "undefined" (string) hoặc null, thử parse user object
  if (!id || id === 'undefined') {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        id = user.id || user.accountId || user.userId || user.technicianId;
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  
  console.log('📌 TechnicianId from localStorage:', id);
  console.log('⚠️ User object không có ID! Backend cần trả về ID khi login.');
  
  // TEMPORARY FIX: Hardcode ID = 1 vì backend chưa trả về ID
  // TODO: Sửa backend để trả về technicianId trong response khi login
  const finalId = (id && id !== 'undefined') ? id : 1;
  console.log('✅ Using technician ID:', finalId);
  
  return finalId;
};

/**
 * Lấy danh sách xe được phân công cho kỹ thuật viên
 * @param {number} technicianId - ID của kỹ thuật viên (optional, mặc định lấy từ localStorage)
 * @param {string} status - Trạng thái lọc: "ALL", "ASSIGNED", "IN_PROGRESS"
 * @returns {Promise<Array>} Danh sách xe được phân công
 */
export async function fetchAssignedJobs(technicianId = null, status = "ALL") {
  try {
    const id = technicianId || getTechnicianId();
    
    if (status === "ALL") {
      // Gọi API lấy tất cả xe được phân công
      const response = await axiosClient.get(`/technician/${id}/assigned-vehicles`);
      return mapVehicleResponse(response);
    } else {
      // Gọi API lọc theo trạng thái
      const response = await axiosClient.get(`/technician/${id}/assigned-vehicles/filter`, {
        params: { status }
      });
      return mapVehicleResponse(response);
    }
  } catch (error) {
    console.error('Error fetching assigned jobs:', error);
    throw error;
  }
}

/**
 * Mapping response từ backend sang format của frontend
 * Backend format: scheduleId, customerName, vehicleModel, licensePlate, ownerName, status, action, scheduledDate
 * Frontend format: record_id, customer_name, vehicle_model, license_plate, appointment_time, status
 */
function mapVehicleResponse(vehicles) {
  if (!Array.isArray(vehicles)) return [];
  
  return vehicles.map(v => ({
    record_id: v.scheduleId,
    customer_name: v.customerName,
    vehicle_model: v.vehicleModel,
    license_plate: v.licensePlate,
    appointment_time: v.scheduledDate || v.appointmentTime,
    status: v.status
  }));
}

/**
 * Check-in xe (Xác nhận nhận xe)
 */
export async function checkInRecord(scheduleId) {
  try {
    console.log('🔵 Calling check-in API:', `/technician/check-in/${scheduleId}`);
    const response = await axiosClient.post(`/technician/check-in/${scheduleId}`);
    return response;
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
    console.log('🔵 Calling checklist API:', `/technician/checklist/${scheduleId}`);
    const response = await axiosClient.get(`/technician/checklist/${scheduleId}`);
    console.log('✅ Checklist response:', response);
    
    // Map backend fields to frontend format
    if (response && response.items) {
      console.log('🔍 Raw items from backend:', response.items);
      
      const mappedItems = response.items.map((item, index) => {
        console.log(`Item ${index + 1}:`, {
          name: item.name,
          description: item.description,
          status: item.status,
          actionStatus: item.actionStatus,
          originalPartCost: item.originalPartCost,
          originalLaborCost: item.originalLaborCost,
          mapped_name: item.name || item.partName || '',
          mapped_status: item.description || item.actionStatus || 'Kiểm tra'
        });
        
        return {
          id: item.id || item.itemId || index + 1,
          name: item.name || item.partName || '',
          status: item.description || item.actionStatus || 'Kiểm tra',  // Ưu tiên description (Kiểm tra/Thay thế/Bôi trơn)
          partCost: item.partCost || item.materialCost || 0,
          laborCost: item.laborCost || 0,
          originalPartCost: item.originalPartCost || 0,  // Giá gốc vật tư từ kho
          originalLaborCost: item.originalLaborCost || 0  // Giá gốc nhân công
        };
      });
      
      console.log('🔄 Mapped items:', mappedItems);
      
      return {
        header: response.header,
        items: mappedItems
      };
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error getting checklist:', error);
    console.error('❌ API endpoint tried:', `/technician/checklist/${scheduleId}`);
    throw error;
  }
}

/**
 * Gửi biên bản cho khách hàng duyệt
 */
export async function submitForApproval(scheduleId) {
  try {
    console.log('🔵 Calling submit approval API:', `/technician/submit-for-approval/${scheduleId}`);
    const response = await axiosClient.post(`/technician/submit-for-approval/${scheduleId}`);
    return response;
  } catch (error) {
    console.error('❌ Error submitting for approval:', error);
    throw error;
  }
}

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
    const response = await axiosClient.get(`/service-ticket/${scheduleId}/detail`);
    return response;
  } catch (error) {
    console.error('Error fetching service ticket detail:', error);
    throw error;
  }
}

