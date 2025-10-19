import axiosClient from './axiosClient';

const notificationApi = {
  // Lấy danh sách thông báo của khách hàng
  getCustomerNotifications: (customerId) => {
    return axiosClient.get(`/api/notifications/customer/${customerId}`);
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: (notificationId) => {
    return axiosClient.put(`/api/notifications/${notificationId}/read`);
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: (customerId) => {
    return axiosClient.put(`/api/notifications/customer/${customerId}/read-all`);
  },

  // Xóa thông báo
  deleteNotification: (notificationId) => {
    return axiosClient.delete(`/api/notifications/${notificationId}`);
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: (customerId) => {
    return axiosClient.get(`/api/notifications/customer/${customerId}/unread-count`);
  }
};

export default notificationApi;