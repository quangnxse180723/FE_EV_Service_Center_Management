import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationModal.css';
import notificationApi from '../../api/notificationApi';
import CustomerPaymentModal from '../../modules/customer/pages/CustomerPaymentModal';
import { useAuth } from '../../contexts/AuthContext';
import MessageModal from '../common/MessageModal';

export default function NotificationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const showMessage = (title, message, type = 'info', onConfirm = null) => {
    setMessageModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeMessage = () => {
    setMessageModal({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  };

  useEffect(() => {
    if (isOpen) {
      // Kiểm tra đăng nhập trước khi load notifications
      if (!isLoggedIn) {
        showMessage(
          'Yêu cầu đăng nhập',
          'Vui lòng đăng nhập để xem thông báo!',
          'warning',
          () => {
            closeMessage();
            onClose(); // Đóng notification modal
            navigate('/login');
          }
        );
        return;
      }
      loadNotifications();
    }
  }, [isOpen, isLoggedIn]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Sử dụng notificationApi đã có sẵn - nó sẽ tự động lấy theo user đăng nhập
      const response = await notificationApi.getNotifications();
      console.log('✅ Notifications:', response);
      setNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      
      // Xử lý lỗi 403 - phiên đăng nhập hết hạn
      if (error.response?.status === 403 || error.message?.includes('403')) {
        showMessage(
          'Yêu cầu đăng nhập',
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
          'warning',
          () => {
            closeMessage();
            onClose(); // Đóng notification modal
            navigate('/login');
          }
        );
        return;
      }
      
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Kiểm tra nếu là link thanh toán -> mở modal thay vì chuyển trang
    if (notification.link && notification.link.includes('/customer/payment/')) {
      const scheduleId = notification.link.split('/').pop();
      setSelectedScheduleId(scheduleId);
      setPaymentModalOpen(true);
      return; // Không đóng notification modal và không navigate
    }
    
    // Đóng modal
    onClose();
    
    // Điều hướng đến link (cho các link khác)
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      // Cập nhật UI
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-modal-overlay" onClick={onClose}>
        <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
          <div className="notification-modal-header">
            <h3>🔔 Thông báo</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="notification-modal-body">
            {loading ? (
              <div className="notification-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <p>📭 Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
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
                    {!notification.isRead && <div className="notification-dot"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal - renders on top of notification modal */}
      <CustomerPaymentModal 
        scheduleId={selectedScheduleId}
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedScheduleId(null);
          onClose(); // Also close notification modal after payment modal closes
        }}
      />

      {/* Message Modal for authentication errors */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessage}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        onConfirm={messageModal.onConfirm}
      />
    </>
  );
}