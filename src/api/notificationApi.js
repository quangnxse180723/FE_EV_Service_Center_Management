import axiosClient from './axiosClient';

const notificationApi = {
  // Lấy danh sách thông báo (dùng cho cả customer và technician)
  getNotifications: () => {
    const accountId = localStorage.getItem('accountId');
    return axiosClient.get('/notifications', {
      params: { accountId }
    });
  },

  // Lấy danh sách thông báo của khách hàng (legacy - giữ để tương thích)
  getCustomerNotifications: (customerId) => {
    return axiosClient.get(`/notifications/customer/${customerId}`);
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: (notificationId) => {
    return axiosClient.put(`/notifications/${notificationId}/read`);
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: (customerId) => {
    return axiosClient.put(`/notifications/customer/${customerId}/read-all`);
  },

  // Xóa thông báo
  deleteNotification: (notificationId) => {
    return axiosClient.delete(`/notifications/${notificationId}`);
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: (customerId) => {
    return axiosClient.get(`/notifications/customer/${customerId}/unread-count`);
  },

  // Tạo thông báo bảo dưỡng tự động
  createMaintenanceNotification: (notificationData) => {
    // notificationData: { accountId, message, type, priority, vehicleId, link }
    return axiosClient.post('/notifications/maintenance', notificationData);
  },

  // Kiểm tra xem thông báo đã tồn tại chưa (để tránh duplicate)
  checkNotificationExists: (accountId, vehicleId, type) => {
    return axiosClient.get('/notifications/check', {
      params: { accountId, vehicleId, type }
    });
  }
};

export default notificationApi;