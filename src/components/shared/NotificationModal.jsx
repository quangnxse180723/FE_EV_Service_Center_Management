import React, { useState, useEffect } from 'react';
import './NotificationModal.css';
import notificationApi from '../../../api/notificationApi';

export default function NotificationModal({ isOpen, onClose, customerId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, maintenance

  // Mock data cho demo
  const mockNotifications = [
    {
      id: 1,
      type: 'maintenance_due',
      title: 'Lịch bảo dưỡng định kỳ',
      message: 'Xe VinFast Feliz S (29A-123.45) sắp đến hạn bảo dưỡng định kỳ vào ngày 15/11/2024',
      vehicleLicense: '29A-123.45',
      dueDate: '2024-11-15',
      isRead: false,
      createdAt: '2024-10-18T10:00:00Z',
      priority: 'high'
    },
    {
      id: 2,
      type: 'maintenance_overdue',
      title: 'Quá hạn bảo dưỡng',
      message: 'Xe Yadea Ulike (30B-456.78) đã quá hạn bảo dưỡng từ ngày 10/10/2024. Vui lòng đặt lịch ngay!',
      vehicleLicense: '30B-456.78',
      dueDate: '2024-10-10',
      isRead: false,
      createdAt: '2024-10-17T14:30:00Z',
      priority: 'urgent'
    },
    {
      id: 3,
      type: 'maintenance_reminder',
      title: 'Nhắc nhở bảo dưỡng',
      message: 'Xe VinFast Feliz S (29A-123.45) sẽ đến hạn bảo dưỡng trong 7 ngày tới',
      vehicleLicense: '29A-123.45',
      dueDate: '2024-11-15',
      isRead: true,
      createdAt: '2024-10-16T09:15:00Z',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'service_completed',
      title: 'Hoàn thành bảo dưỡng',
      message: 'Xe VinFast Feliz S (29A-123.45) đã hoàn thành bảo dưỡng định kỳ. Lần bảo dưỡng tiếp theo: 15/05/2025',
      vehicleLicense: '29A-123.45',
      dueDate: '2025-05-15',
      isRead: true,
      createdAt: '2024-10-15T16:45:00Z',
      priority: 'low'
    },
    {
      id: 5,
      type: 'appointment_confirmed',
      title: 'Xác nhận lịch hẹn',
      message: 'Lịch hẹn bảo dưỡng xe Yadea Ulike (30B-456.78) đã được xác nhận vào 20/10/2024 lúc 9:00',
      vehicleLicense: '30B-456.78',
      dueDate: '2024-10-20',
      isRead: false,
      createdAt: '2024-10-14T11:20:00Z',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, customerId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Trong thực tế sẽ gọi API
      // const response = await notificationApi.getCustomerNotifications(customerId);
      // setNotifications(response.data);
      
      // Demo với mock data
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // await notificationApi.markAllAsRead(customerId);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notif => !notif.isRead);
      case 'maintenance':
        return notifications.filter(notif => 
          ['maintenance_due', 'maintenance_overdue', 'maintenance_reminder'].includes(notif.type)
        );
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'maintenance_due': '🔧',
      'maintenance_overdue': '⚠️',
      'maintenance_reminder': '⏰',
      'service_completed': '✅',
      'appointment_confirmed': '📅'
    };
    return iconMap[type] || '📢';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.isRead).length;
  };

  if (!isOpen) return null;

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <div className="header-title">
            <h2>Thông báo</h2>
            {getUnreadCount() > 0 && (
              <span className="unread-badge">{getUnreadCount()} chưa đọc</span>
            )}
          </div>
          <div className="header-actions">
            {getUnreadCount() > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button onClick={onClose} className="close-btn">×</button>
          </div>
        </div>

        <div className="notification-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({getUnreadCount()})
          </button>
          <button 
            className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
            onClick={() => setFilter('maintenance')}
          >
            Bảo dưỡng ({notifications.filter(n => ['maintenance_due', 'maintenance_overdue', 'maintenance_reminder'].includes(n.type)).length})
          </button>
        </div>

        <div className="notification-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-notifications">
              <span className="empty-icon">📭</span>
              <h3>Không có thông báo</h3>
              <p>Bạn chưa có thông báo nào {filter !== 'all' ? `trong danh mục ${filter === 'unread' ? 'chưa đọc' : 'bảo dưỡng'}` : ''}</p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-body">
                    <div className="notification-main">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      {notification.vehicleLicense && (
                        <div className="vehicle-tag">
                          🚗 {notification.vehicleLicense}
                        </div>
                      )}
                    </div>
                    
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.dueDate && (
                        <span className="due-date">
                          Hạn: {new Date(notification.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        className="mark-read-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Đánh dấu đã đọc"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Xóa thông báo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}