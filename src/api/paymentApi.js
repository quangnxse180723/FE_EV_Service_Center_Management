import axiosClient from './axiosClient';

const paymentApi = {
  // Lấy lịch sử thanh toán của khách hàng
  getCustomerPaymentHistory: (customerId) => {
    return axiosClient.get(`/api/payments/customer/${customerId}`);
  },

  // Lấy chi tiết thanh toán
  getPaymentById: (paymentId) => {
    return axiosClient.get(`/api/payments/${paymentId}`);
  },

  // Tạo thanh toán mới
  createPayment: (paymentData) => {
    return axiosClient.post('/api/payments', paymentData);
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: (paymentId, status) => {
    return axiosClient.put(`/api/payments/${paymentId}/status`, { status });
  },

  // Lấy thống kê thanh toán theo năm
  getPaymentStatistics: (customerId, year) => {
    return axiosClient.get(`/api/payments/statistics/${customerId}/${year}`);
  }
};

export default paymentApi;