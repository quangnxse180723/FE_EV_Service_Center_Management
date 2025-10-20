import axiosClient from './axiosClient';

/**
 * =====================================================
 * TECHNICIAN API - Quản lý API cho module Kỹ thuật viên
 * =====================================================
 * 
 * File này chứa tất cả các API endpoints liên quan đến:
 * - Dashboard & Statistics
 * - Công việc được phân công (Assigned Jobs)
 * - Phiếu sửa chữa (Service Tickets)
 * - Biên bản kiểm tra (Inspection Records)
 * - Lịch sử bảo dưỡng (Maintenance History)
 * - Chứng chỉ kỹ thuật viên (Certificates)
 * - Check-in ca làm việc (Shift Check-in)
 */

const technicianApi = {
  // ========================================
  // 1. DASHBOARD & STATISTICS
  // ========================================
  
  /**
   * Lấy thống kê tổng quan cho dashboard kỹ thuật viên
   * @returns {Promise} { processingCount, todayTaskCount, shifts }
   */
  getDashboardStats: () => {
    return axiosClient.get('/technician/dashboard/stats');
  },

  /**
   * Lấy tổng quan ca làm việc trong tuần
   * @returns {Promise} Danh sách ca làm việc
   */
  getWeeklyShifts: () => {
    return axiosClient.get('/technician/dashboard/shifts');
  },

  // ========================================
  // 2. CÔNG VIỆC ĐƯỢC PHÂN CÔNG (Assigned Jobs)
  // ========================================

  /**
   * Lấy danh sách công việc được phân công
   * @param {Object} params - { status, page, limit }
   * @returns {Promise} Danh sách công việc
   */
  getAssignedJobs: (params = {}) => {
    return axiosClient.get('/technician/assigned-jobs', { params });
  },

  /**
   * Lấy chi tiết một công việc
   * @param {string} jobId - ID công việc
   * @returns {Promise} Chi tiết công việc
   */
  getJobById: (jobId) => {
    return axiosClient.get(`/technician/assigned-jobs/${jobId}`);
  },

  /**
   * Nhận công việc (chuyển từ "Chờ nhận" sang "Đang xử lý")
   * @param {string} jobId - ID công việc
   * @returns {Promise} Kết quả cập nhật
   */
  acceptJob: (jobId) => {
    return axiosClient.post(`/technician/assigned-jobs/${jobId}/accept`);
  },

  /**
   * Từ chối công việc
   * @param {string} jobId - ID công việc
   * @param {string} reason - Lý do từ chối
   * @returns {Promise} Kết quả
   */
  rejectJob: (jobId, reason) => {
    return axiosClient.post(`/technician/assigned-jobs/${jobId}/reject`, { reason });
  },

  // ========================================
  // 3. PHIẾU SỬA CHỮA (Service Tickets)
  // ========================================

  /**
   * Lấy danh sách phiếu sửa chữa
   * @param {Object} params - { status, fromDate, toDate, page, limit }
   * @returns {Promise} Danh sách phiếu sửa chữa
   */
  getServiceTickets: (params = {}) => {
    return axiosClient.get('/technician/service-tickets', { params });
  },

  /**
   * Lấy chi tiết phiếu sửa chữa
   * @param {string} ticketId - ID phiếu sửa chữa
   * @returns {Promise} Chi tiết phiếu sửa chữa với danh sách hạng mục
   */
  getServiceTicketById: (ticketId) => {
    return axiosClient.get(`/technician/service-tickets/${ticketId}`);
  },

  /**
   * Cập nhật trạng thái phiếu sửa chữa
   * @param {string} ticketId - ID phiếu
   * @param {string} status - Trạng thái mới (PENDING, APPROVED, PROCESSING, DONE)
   * @returns {Promise} Kết quả cập nhật
   */
  updateTicketStatus: (ticketId, status) => {
    return axiosClient.patch(`/technician/service-tickets/${ticketId}/status`, { status });
  },

  /**
   * Xác nhận hạng mục sửa chữa
   * @param {string} ticketId - ID phiếu
   * @param {string} itemId - ID hạng mục
   * @param {boolean} confirmed - true/false
   * @returns {Promise} Kết quả
   */
  confirmTicketItem: (ticketId, itemId, confirmed) => {
    return axiosClient.post(`/technician/service-tickets/${ticketId}/items/${itemId}/confirm`, {
      confirmed,
    });
  },

  /**
   * Cập nhật chi phí cho hạng mục
   * @param {string} ticketId - ID phiếu
   * @param {string} itemId - ID hạng mục
   * @param {Object} costs - { materialCost, laborCost }
   * @returns {Promise} Kết quả
   */
  updateItemCosts: (ticketId, itemId, costs) => {
    return axiosClient.patch(`/technician/service-tickets/${ticketId}/items/${itemId}/costs`, costs);
  },

  /**
   * Cập nhật tiến độ hạng mục
   * @param {string} ticketId - ID phiếu
   * @param {string} itemId - ID hạng mục
   * @param {string} progress - Tiến độ (Đang xử lý, Hoàn thành)
   * @returns {Promise} Kết quả
   */
  updateItemProgress: (ticketId, itemId, progress) => {
    return axiosClient.patch(`/technician/service-tickets/${ticketId}/items/${itemId}/progress`, {
      progress,
    });
  },

  /**
   * Hoàn thành phiếu sửa chữa (chuyển tất cả hạng mục sang Hoàn thành)
   * @param {string} ticketId - ID phiếu
   * @returns {Promise} Kết quả
   */
  finalizeTicket: (ticketId) => {
    return axiosClient.post(`/technician/service-tickets/${ticketId}/finalize`);
  },

  // ========================================
  // 4. BIÊN BẢN KIỂM TRA (Inspection Records)
  // ========================================

  /**
   * Lấy hoặc tạo mới biên bản kiểm tra cho một record
   * @param {string} recordId - ID record/booking
   * @returns {Promise} Biên bản kiểm tra
   */
  getOrCreateInspectionRecord: (recordId) => {
    return axiosClient.get(`/technician/inspection/${recordId}`);
  },

  /**
   * Tạo mới biên bản kiểm tra
   * @param {Object} data - { recordId, vehiclePlate, customerName, items }
   * @returns {Promise} Biên bản mới được tạo
   */
  createInspectionRecord: (data) => {
    return axiosClient.post('/technician/inspection', data);
  },

  /**
   * Cập nhật một mục trong biên bản kiểm tra
   * @param {string} inspectionId - ID biên bản
   * @param {string} itemId - ID mục kiểm tra
   * @param {Object} data - { action, note, partCost, laborCost }
   * @returns {Promise} Kết quả cập nhật
   */
  updateInspectionItem: (inspectionId, itemId, data) => {
    return axiosClient.patch(`/technician/inspection/${inspectionId}/items/${itemId}`, data);
  },

  /**
   * Gửi biên bản cho khách hàng phê duyệt
   * @param {string} inspectionId - ID biên bản
   * @returns {Promise} Kết quả
   */
  submitForApproval: (inspectionId) => {
    return axiosClient.post(`/technician/inspection/${inspectionId}/submit`);
  },

  /**
   * Lấy template checklist mặc định
   * @returns {Promise} Template checklist
   */
  getChecklistTemplate: () => {
    return axiosClient.get('/technician/inspection/template');
  },

  /**
   * Lấy danh sách biên bản kiểm tra
   * @param {Object} params - { status, page, limit }
   * @returns {Promise} Danh sách biên bản
   */
  getInspectionRecords: (params = {}) => {
    return axiosClient.get('/technician/inspection/records', { params });
  },

  // ========================================
  // 5. LỊCH SỬ BẢO DƯỠNG (Maintenance History)
  // ========================================

  /**
   * Lấy danh sách lịch sử bảo dưỡng
   * @param {Object} params - { fromDate, toDate, page, limit }
   * @returns {Promise} Danh sách bảo dưỡng
   */
  getMaintenanceList: (params = {}) => {
    return axiosClient.get('/technician/maintenance', { params });
  },

  /**
   * Lấy chi tiết một lần bảo dưỡng
   * @param {string} maintenanceId - ID bảo dưỡng
   * @returns {Promise} Chi tiết bảo dưỡng
   */
  getMaintenanceById: (maintenanceId) => {
    return axiosClient.get(`/technician/maintenance/${maintenanceId}`);
  },

  /**
   * Tạo ghi chú bảo dưỡng
   * @param {Object} data - { vehicleId, note, nextMaintenanceDate }
   * @returns {Promise} Kết quả
   */
  createMaintenanceNote: (data) => {
    return axiosClient.post('/technician/maintenance', data);
  },

  // ========================================
  // 6. CHỨNG CHỈ KỸ THUẬT VIÊN (Certificates)
  // ========================================

  /**
   * Lấy danh sách chứng chỉ của kỹ thuật viên
   * @returns {Promise} Danh sách chứng chỉ
   */
  getCertificates: () => {
    return axiosClient.get('/technician/certificates');
  },

  /**
   * Thêm chứng chỉ mới
   * @param {Object} data - { code, name, issuer, issuedDate, expiredDate }
   * @returns {Promise} Chứng chỉ mới
   */
  addCertificate: (data) => {
    return axiosClient.post('/technician/certificates', data);
  },

  /**
   * Cập nhật chứng chỉ
   * @param {string} certificateId - ID chứng chỉ
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise} Kết quả
   */
  updateCertificate: (certificateId, data) => {
    return axiosClient.patch(`/technician/certificates/${certificateId}`, data);
  },

  /**
   * Xóa chứng chỉ
   * @param {string} certificateId - ID chứng chỉ
   * @returns {Promise} Kết quả
   */
  deleteCertificate: (certificateId) => {
    return axiosClient.delete(`/technician/certificates/${certificateId}`);
  },

  // ========================================
  // 7. CHECK-IN CA LÀM VIỆC (Shift Management)
  // ========================================

  /**
   * Check-in ca làm việc
   * @param {string} shiftId - ID ca làm việc
   * @returns {Promise} Kết quả check-in
   */
  checkinShift: (shiftId) => {
    return axiosClient.post(`/technician/shifts/${shiftId}/checkin`);
  },

  /**
   * Check-out ca làm việc
   * @param {string} shiftId - ID ca làm việc
   * @returns {Promise} Kết quả check-out
   */
  checkoutShift: (shiftId) => {
    return axiosClient.post(`/technician/shifts/${shiftId}/checkout`);
  },

  /**
   * Lấy lịch làm việc của kỹ thuật viên
   * @param {Object} params - { fromDate, toDate }
   * @returns {Promise} Lịch làm việc
   */
  getWorkSchedule: (params = {}) => {
    return axiosClient.get('/technician/shifts/schedule', { params });
  },

  // ========================================
  // 8. THÔNG TIN KỸ THUẬT VIÊN (Technician Info)
  // ========================================

  /**
   * Lấy thông tin profile kỹ thuật viên
   * @returns {Promise} Thông tin kỹ thuật viên
   */
  getProfile: () => {
    return axiosClient.get('/technician/profile');
  },

  /**
   * Cập nhật thông tin profile
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise} Kết quả
   */
  updateProfile: (data) => {
    return axiosClient.patch('/technician/profile', data);
  },

  /**
   * Lấy tất cả kỹ thuật viên (cho admin/staff)
   * @returns {Promise} Danh sách kỹ thuật viên
   */
  getAllTechnicians: () => {
    return axiosClient.get('/technicians');
  },

  /**
   * Lấy thông tin một kỹ thuật viên cụ thể
   * @param {string} technicianId - ID kỹ thuật viên
   * @returns {Promise} Thông tin kỹ thuật viên
   */
  getTechnicianById: (technicianId) => {
    return axiosClient.get(`/technicians/${technicianId}`);
  },

  // ========================================
  // 9. BÁO CÁO & THỐNG KÊ (Reports & Analytics)
  // ========================================

  /**
   * Lấy báo cáo hiệu suất công việc
   * @param {Object} params - { fromDate, toDate }
   * @returns {Promise} Báo cáo hiệu suất
   */
  getPerformanceReport: (params = {}) => {
    return axiosClient.get('/technician/reports/performance', { params });
  },

  /**
   * Lấy thống kê công việc đã hoàn thành
   * @param {Object} params - { month, year }
   * @returns {Promise} Thống kê
   */
  getCompletedJobsStats: (params = {}) => {
    return axiosClient.get('/technician/reports/completed-jobs', { params });
  },

  // ========================================
  // 10. UPLOAD FILES (Nếu cần)
  // ========================================

  /**
   * Upload hình ảnh cho biên bản kiểm tra
   * @param {string} inspectionId - ID biên bản
   * @param {FormData} formData - File data
   * @returns {Promise} URL hình ảnh
   */
  uploadInspectionImage: (inspectionId, formData) => {
    return axiosClient.post(`/technician/inspection/${inspectionId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload chứng chỉ (PDF/Image)
   * @param {FormData} formData - File data
   * @returns {Promise} URL file
   */
  uploadCertificate: (formData) => {
    return axiosClient.post('/technician/certificates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default technicianApi;