import axiosClient from './axiosClient';

const scheduleApi = {
  // Đặt lịch mới
  bookSchedule: (bookingData) => {
    // GIỮ LẠI customerId trong body vì backend cần nó (không lấy được từ token)
    console.log('📍 Booking endpoint:', '/customer/schedules/book');
    console.log('📦 Data sent (WITH customerId):', bookingData);
    return axiosClient.post('/customer/schedules/book', bookingData);
  },

  // Lấy danh sách time slots có sẵn theo ngày và trung tâm
  getAvailableTimeSlots: (centerId, date) => {
    console.log('🔍 Fetching time slots for:', { centerId, date });
    return axiosClient.get('/customer/schedules/available-slots', {
      params: { centerId, date }
    });
  },

  // Lấy danh sách lịch hẹn của khách hàng
  getByCustomer: (customerId) => {
    return axiosClient.get(`/customer/schedules/${customerId}`);
  },

  // ===== Staff/Admin API =====
  
  // Lấy tất cả lịch hẹn
  getAllSchedules: () => {
    return axiosClient.get('/schedules');
  },

  // Lấy chi tiết lịch hẹn
  getScheduleById: (scheduleId) => {
    return axiosClient.get(`/schedules/${scheduleId}`);
  },

  // Cập nhật trạng thái lịch hẹn (check-in, hoàn tất, hủy)
  updateScheduleStatus: (scheduleId, statusData) => {
    return axiosClient.put(`/schedules/${scheduleId}/status`, statusData);
  },

  // Gán kỹ thuật viên cho lịch hẹn
  assignTechnician: (scheduleId, technicianData) => {
    return axiosClient.put(`/schedules/${scheduleId}/assign-technician`, technicianData);
  },

  // Tìm kiếm lịch hẹn theo tên khách hàng
  searchByCustomerName: (name) => {
    return axiosClient.get('/schedules/search/customer', {
      params: { name }
    });
  },

  // Tìm kiếm lịch hẹn theo biển số xe
  searchByLicensePlate: (plate) => {
    return axiosClient.get('/schedules/search/vehicle', {
      params: { plate }
    });
  },

  // Tìm kiếm lịch hẹn theo trạng thái
  searchByStatus: (status) => {
    return axiosClient.get('/schedules/search/status', {
      params: { status }
    });
  },
};

export default scheduleApi;
