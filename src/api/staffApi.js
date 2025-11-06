import axiosClient from './axiosClient';

const staffApi = {
  /**
   * GET /api/staff/payments/{scheduleId}
   * Lấy chi tiết invoice + biên bản sửa chữa
   */
  getInvoiceDetail: (scheduleId) => {
    const url = `/staff/payments/${scheduleId}`;
    return axiosClient.get(url);
  },

  /**
   * POST /api/staff/payments/send-invoice
   * Gửi hóa đơn cho khách hàng
   * @param {Object} data - { scheduleId, paymentMethod }
   */
  sendInvoiceToCustomer: (data) => {
    const url = `/staff/payments/send-invoice`;
    return axiosClient.post(url, data);
  },

  /**
   * POST /api/staff/payments/customer-approve
   * Customer duyệt/chỉnh sửa checklist
   * @param {Object} data - { scheduleId, approvedItemIds }
   */
  customerApproveChecklist: (data) => {
    const url = `/staff/payments/customer-approve`;
    return axiosClient.post(url, data);
  },
};

export default staffApi;
