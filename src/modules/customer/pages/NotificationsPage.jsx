import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderHome from '../../../components/layout/HeaderHome';
import axiosClient from '../../../api/axiosClient';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('accountId'); // Lấy user ID
      const response = await axiosClient.get(`/notifications/${userId}`);
      console.log('✅ Notifications:', response);
      setNotifications(response);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc
    markAsRead(notification.id);
    
    // Điều hướng đến link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosClient.put(`/notifications/${notificationId}/read`);
      // Cập nhật UI
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        {/* Header */}
        <HeaderHome activeMenu="notifications" />

        <div className="notifications-content">
          <div className="loading">Đang tải thông báo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <HeaderHome activeMenu="notifications" />

      {/* Content */}
      <div className="notifications-content">
        <div className="notifications-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h1>Thông báo</h1>
        </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>🔔 Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {notification.isRead ? '📭' : '📬'}
              </div>
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
              {!notification.isRead && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
      </div> {/* End notifications-content */}
    </div>
  );
}
