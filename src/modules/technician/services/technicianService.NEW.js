/**
 * =====================================================
 * TECHNICIAN SERVICE - Real API Integration
 * =====================================================
 * 
 * File mẫu để thay thế technicianService.js hiện tại
 * khi Backend đã cung cấp API thật.
 * 
 * HƯỚNG DẪN:
 * 1. Backup file technicianService.js cũ
 * 2. Copy nội dung file này
 * 3. Paste vào technicianService.js
 * 4. Test từng function
 */

import technicianApi from '@/api/technicianApi';

// ========================================
// 1. DASHBOARD & STATISTICS
// ========================================

/**
 * Lấy thống kê tổng quan cho dashboard
 */
export async function getTechDashboardSummary() {
  try {
    const data = await technicianApi.getDashboardStats();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
}

/**
 * Alias cho dashboard (tương thích với code cũ)
 */
export async function fetchTechnicianDashboard() {
  return await getTechDashboardSummary();
}

// ========================================
// 2. ASSIGNED JOBS (Công việc được phân)
// ========================================

/**
 * Lấy danh sách công việc được phân công
 * @param {Object} params - { status, page, limit }
 */
export async function fetchAssignedJobs(params = {}) {
  try {
    const data = await technicianApi.getAssignedJobs(params);
    return data;
  } catch (error) {
    console.error('Error fetching assigned jobs:', error);
    throw error;
  }
}

/**
 * Nhận công việc (chuyển từ "Chờ nhận" → "Đang xử lý")
 * @param {string} jobId - ID công việc
 */
export async function acceptJob(jobId) {
  try {
    const data = await technicianApi.acceptJob(jobId);
    return data;
  } catch (error) {
    console.error('Error accepting job:', error);
    throw error;
  }
}

// ========================================
// 3. SERVICE TICKETS (Phiếu sửa chữa)
// ========================================

/**
 * Lấy danh sách phiếu sửa chữa
 * @param {Object} params - { status, fromDate, toDate, page, limit }
 */
export async function fetchServiceTickets(params = {}) {
  try {
    const data = await technicianApi.getServiceTickets(params);
    return data;
  } catch (error) {
    console.error('Error fetching service tickets:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết một phiếu sửa chữa
 * @param {string} ticketId - ID phiếu
 */
export async function fetchServiceTicketById(ticketId) {
  try {
    const data = await technicianApi.getServiceTicketById(ticketId);
    return data;
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    throw error;
  }
}

/**
 * Xác nhận hạng mục sửa chữa
 * @param {string} ticketId - ID phiếu
 * @param {string|number} itemNo - Số thứ tự hoặc ID hạng mục
 * @param {boolean} confirmed - true/false
 */
export async function setItemConfirmed(ticketId, itemNo, confirmed) {
  try {
    const data = await technicianApi.confirmTicketItem(ticketId, itemNo, confirmed);
    return data;
  } catch (error) {
    console.error('Error confirming item:', error);
    throw error;
  }
}

/**
 * Cập nhật chi phí cho hạng mục
 * @param {string} ticketId - ID phiếu
 * @param {string|number} itemNo - Số thứ tự hoặc ID hạng mục
 * @param {number} material - Chi phí vật tư
 * @param {number} labor - Chi phí công
 */
export async function updateItemCosts(ticketId, itemNo, material, labor) {
  try {
    const data = await technicianApi.updateItemCosts(ticketId, itemNo, {
      materialCost: Number(material || 0),
      laborCost: Number(labor || 0),
    });
    return data;
  } catch (error) {
    console.error('Error updating item costs:', error);
    throw error;
  }
}

/**
 * Hoàn thành phiếu sửa chữa
 * @param {string} ticketId - ID phiếu
 */
export async function finalizeTicket(ticketId) {
  try {
    const data = await technicianApi.finalizeTicket(ticketId);
    return data;
  } catch (error) {
    console.error('Error finalizing ticket:', error);
    throw error;
  }
}

/**
 * Tính tổng chi phí (utility function - không cần API)
 * @param {Object} ticket - Phiếu sửa chữa
 */
export function calcCosts(ticket) {
  if (!ticket || !Array.isArray(ticket.items)) {
    return { material: 0, labor: 0, total: 0 };
  }

  const material = ticket.items.reduce((sum, item) => {
    return sum + (Number(item.material) || Number(item.materialCost) || 0);
  }, 0);

  const labor = ticket.items.reduce((sum, item) => {
    return sum + (Number(item.labor) || Number(item.laborCost) || 0);
  }, 0);

  return {
    material,
    labor,
    total: material + labor,
  };
}

// ========================================
// 4. INSPECTION (Biên bản kiểm tra)
// ========================================

/**
 * Lấy hoặc tạo mới biên bản kiểm tra
 * @param {string} recordId - ID record/booking
 */
export async function getOrCreateChecklist(recordId) {
  try {
    const data = await technicianApi.getOrCreateInspectionRecord(recordId);
    return data;
  } catch (error) {
    console.error('Error getting checklist:', error);
    throw error;
  }
}

/**
 * Lấy template checklist mặc định
 */
export async function fetchChecklistTemplate() {
  try {
    const data = await technicianApi.getChecklistTemplate();
    return data;
  } catch (error) {
    console.error('Error fetching checklist template:', error);
    throw error;
  }
}

/**
 * Cập nhật một mục trong checklist
 * @param {string} inspectionId - ID biên bản kiểm tra
 * @param {string} itemId - ID mục kiểm tra
 * @param {Object} patch - { action, note, partCost, laborCost }
 */
export async function updateChecklistItem(inspectionId, itemId, patch) {
  try {
    const data = await technicianApi.updateInspectionItem(inspectionId, itemId, patch);
    return data;
  } catch (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }
}

/**
 * Gửi biên bản cho khách hàng phê duyệt
 * @param {string} inspectionId - ID biên bản
 */
export async function submitForApproval(inspectionId) {
  try {
    const data = await technicianApi.submitForApproval(inspectionId);
    return data;
  } catch (error) {
    console.error('Error submitting for approval:', error);
    throw error;
  }
}

/**
 * Tạo mới biên bản kiểm tra
 * @param {Object} payload - Dữ liệu biên bản
 */
export async function createInspectionRecord(payload) {
  try {
    const data = await technicianApi.createInspectionRecord(payload);
    return data;
  } catch (error) {
    console.error('Error creating inspection record:', error);
    throw error;
  }
}

// ========================================
// 5. MAINTENANCE (Lịch sử bảo dưỡng)
// ========================================

/**
 * Lấy danh sách lịch sử bảo dưỡng
 * @param {Object} params - { fromDate, toDate, page, limit }
 */
export async function fetchMaintenanceList(params = {}) {
  try {
    const data = await technicianApi.getMaintenanceList(params);
    return data;
  } catch (error) {
    console.error('Error fetching maintenance list:', error);
    throw error;
  }
}

// ========================================
// 6. CERTIFICATES (Chứng chỉ)
// ========================================

/**
 * Lấy danh sách chứng chỉ
 */
export async function fetchCertificates() {
  try {
    const data = await technicianApi.getCertificates();
    return data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
}

/**
 * Thêm chứng chỉ mới
 * @param {Object} certificateData - Dữ liệu chứng chỉ
 */
export async function addCertificate(certificateData) {
  try {
    const data = await technicianApi.addCertificate(certificateData);
    return data;
  } catch (error) {
    console.error('Error adding certificate:', error);
    throw error;
  }
}

// ========================================
// 7. SHIFT MANAGEMENT (Quản lý ca làm việc)
// ========================================

/**
 * Check-in ca làm việc
 * @param {string} shiftId - ID ca làm việc
 */
export async function techCheckinShift(shiftId) {
  try {
    const data = await technicianApi.checkinShift(shiftId);
    return data;
  } catch (error) {
    console.error('Error checking in shift:', error);
    throw error;
  }
}

/**
 * Lấy lịch làm việc trong tuần
 */
export async function getWeeklyShifts() {
  try {
    const data = await technicianApi.getWeeklyShifts();
    return data;
  } catch (error) {
    console.error('Error fetching weekly shifts:', error);
    throw error;
  }
}

// ========================================
// 8. UTILITY FUNCTIONS (Không cần API)
// ========================================

/**
 * Format currency (VNĐ)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}

/**
 * Format date (DD/MM/YYYY)
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

/**
 * Format datetime (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
}

// ========================================
// 9. ERROR HANDLING UTILITIES
// ========================================

/**
 * Extract error message từ API response
 */
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Có lỗi xảy ra, vui lòng thử lại';
}

/**
 * Check if error is network error
 */
export function isNetworkError(error) {
  return !error.response && error.request;
}

/**
 * Check if error is auth error (401)
 */
export function isAuthError(error) {
  return error.response?.status === 401;
}
