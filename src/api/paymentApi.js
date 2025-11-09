import axiosClient from './axiosClient';

const paymentApi = {
  // Lấy lịch sử thanh toán của khách hàng
  getCustomerPaymentHistory: (customerId) => {
    return axiosClient.get(`/payments/customer/${customerId}`);
  },

  // Lấy chi tiết thanh toán
  getPaymentById: (paymentId) => {
    return axiosClient.get(`/payments/${paymentId}`);
  },

  // Tạo thanh toán mới
  // paymentData nên là một object, ví dụ: { amount, method, invoiceId, transactionReference }
  createPayment: (paymentData) => {
    return axiosClient.post('/payments', paymentData);
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: (paymentId, status) => {
    // Backend mong đợi một object có key "status"
    return axiosClient.put(`/payments/${paymentId}/status`, { status });
  },

  // Lấy thống kê thanh toán theo năm
  getPaymentStatistics: (customerId, year) => {
    return axiosClient.get(`/payments/statistics/${customerId}/${year}`);
  },

  // Thanh toán hóa đơn
  // paymentData nên là một object, ví dụ: { amount, method, transactionReference }
  payInvoice: (invoiceId, paymentData) => {
    return axiosClient.put(`/payments/${invoiceId}/pay`, paymentData);
  },

  // Lấy tất cả thanh toán cho trang quản lý
  getAllPaymentsForManagement: () => {
    return axiosClient.get('/payments/management');
  },

  // Tạo VNPay payment URL
  createVNPayPayment: (paymentData) => {
    return axiosClient.post('/payment/vnpay/create', paymentData);
  },
  
  // Lấy tổng doanh thu theo ngày/tuần/tháng/năm
  getRevenue: (date, type) => {
    return axiosClient.get('/payments/revenue', {
      params: { 
        date, // Format: YYYY-MM-DD
        type  // day, week, month, year
      }
    });
  },
};

export default paymentApi;