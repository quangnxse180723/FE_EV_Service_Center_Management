import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationModal.css';
import notificationApi from '../../api/notificationApi';
import { usePartsPriceContext } from '../../contexts/PartsPriceContext';
import { MOCK_NOTIFICATIONS } from '../../utils/mockNotifications';

export default function NotificationModal({ isOpen, onClose, customerId }) {
  const navigate = useNavigate();
  const { setProposalParts } = usePartsPriceContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, maintenance

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
        setNotifications(MOCK_NOTIFICATIONS);
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

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Nếu là thông báo đề xuất phụ tùng
    if (notification.type === 'parts_proposal' && notification.proposedParts) {
      // Set parts vào context
      setProposalParts(notification.proposedParts, notification.id);
      // Đóng modal
      onClose();
      // Navigate đến trang bảng giá
      navigate('/price-list');
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
      'parts_proposal': '🔧',
      'maintenance_due': '⏰',
      'maintenance_overdue': '⚠️',
      'maintenance_reminder': '🔔',
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
                  className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)} ${notification.type === 'parts_proposal' ? 'clickable' : ''}`}
                  onClick={() => notification.type === 'parts_proposal' && handleNotificationClick(notification)}
                  style={notification.type === 'parts_proposal' ? { cursor: 'pointer' } : {}}
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
                      {notification.type === 'parts_proposal' && notification.proposedParts && (
                        <div className="parts-preview">
                          <small>📋 {notification.proposedParts.length} phụ tùng được đề xuất</small>
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