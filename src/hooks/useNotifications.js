import { useState, useEffect } from 'react';
import notificationApi from '../api/notificationApi';
import { MOCK_NOTIFICATIONS, getUnreadCount } from '../utils/mockNotifications';

export function useNotifications(customerId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchNotifications();
    }
  }, [customerId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Trong thực tế sẽ gọi API
      // const response = await notificationApi.getCustomerNotifications(customerId);
      // setNotifications(response.data);
      
      // Demo với mock data
      setTimeout(() => {
        setNotifications(MOCK_NOTIFICATIONS);
        const unread = getUnreadCount(MOCK_NOTIFICATIONS);
        setUnreadCount(unread);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
