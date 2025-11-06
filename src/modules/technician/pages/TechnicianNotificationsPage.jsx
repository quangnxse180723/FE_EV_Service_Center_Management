import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../../api/notificationApi';
import styles from './TechnicianNotificationsPage.module.css';

export default function TechnicianNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications();
      console.log('✅ Notifications loaded:', response);
      setNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Đánh dấu đã đọc nếu chưa đọc
      if (!notification.isRead) {
        await notificationApi.markAsRead(notification.id);
        // Cập nhật UI
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
      }
      
      // Điều hướng đến link
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'APPROVAL_REQUEST': return '✅';
      case 'SYSTEM': return '🔔';
      case 'WARNING': return '⚠️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <div className={styles['notifications-page']}>
        <div className={styles['page-header']}>
          <button className={styles['back-btn']} onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h1>Thông báo</h1>
        </div>
        <div className={styles['loading']}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={styles['notifications-page']}>
      {/* Header */}
      <div className={styles['page-header']}>
        <button className={styles['back-btn']} onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <h1>Thông báo</h1>
      </div>

      {/* Content */}
      <div className={styles['notifications-container']}>
        {notifications.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-icon']}>🔔</div>
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className={styles['notifications-list']}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles['notification-item']} ${
                  notification.isRead ? styles['read'] : styles['unread']
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={styles['notification-icon']}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className={styles['notification-content']}>
                  <div className={styles['notification-message']}>
                    {notification.message}
                  </div>
                  <div className={styles['notification-time']}>
                    {formatDateTime(notification.createdAt)}
                  </div>
                </div>

                {!notification.isRead && (
                  <div className={styles['unread-dot']}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
