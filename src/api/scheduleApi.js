import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const scheduleApi = {
  // Lấy tất cả lịch hẹn
  getAllSchedules: async () => {
    const response = await axios.get(`${API_BASE_URL}/schedules`);
    return response.data;
  },

  // Lấy chi tiết lịch hẹn
  getScheduleById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/schedules/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái lịch hẹn
  updateScheduleStatus: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/schedules/${id}/status`, data);
    return response.data;
  },

  // ✅ Gán kỹ thuật viên - sử dụng updateScheduleStatus
  assignTechnician: async (scheduleId, data) => {
    // Dùng API updateScheduleStatus thay vì endpoint riêng
    const response = await axios.put(
      `${API_BASE_URL}/schedules/${scheduleId}/status`,
      data
    );
    return response.data;
  },

  // Tìm kiếm theo tên khách hàng
  searchByCustomerName: async (name) => {
    const response = await axios.get(`${API_BASE_URL}/schedules/search/customer?name=${name}`);
    return response.data;
  },

  // Tìm kiếm theo biển số xe
  searchByLicensePlate: async (plate) => {
    const response = await axios.get(`${API_BASE_URL}/schedules/search/vehicle?plate=${plate}`);
    return response.data;
  },

  // Tìm kiếm theo trạng thái
  searchByStatus: async (status) => {
    const response = await axios.get(`${API_BASE_URL}/schedules/search/status?status=${status}`);
    return response.data;
  }
};

export default scheduleApi;