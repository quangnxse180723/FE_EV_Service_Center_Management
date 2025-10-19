import axiosClient from './axiosClient';

const scheduleApi = {
  // Đặt lịch mới
  bookSchedule: (bookingData) => {
    return axiosClient.post('/customer/schedules/book', bookingData);
  },

  // Lấy danh sách lịch hẹn của khách hàng
  getByCustomer: (customerId) => {
    return axiosClient.get(`/customer/schedules/${customerId}`);
  },

  // Lấy tất cả lịch hẹn
  getAllSchedules: () => {
    return axiosClient.get('/schedules');
  },

  // Lấy lịch hẹn theo ID
  getScheduleById: (scheduleId) => {
    return axiosClient.get(`/schedules/${scheduleId}`);
  },

  // Cập nhật lịch hẹn
  updateSchedule: (scheduleId, data) => {
    return axiosClient.put(`/schedules/${scheduleId}`, data);
  },

  // Hủy lịch hẹn
  cancelSchedule: (scheduleId) => {
    return axiosClient.delete(`/schedules/${scheduleId}`);
  },
};

export default scheduleApi;
