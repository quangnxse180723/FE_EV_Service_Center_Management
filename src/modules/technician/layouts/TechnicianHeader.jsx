import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import NotificationModal from '../../../components/shared/NotificationModal';
import styles from './TechnicianHeader.module.css';

export default function TechnicianHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();  // ✅ Lấy user từ AuthContext
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [technicianInfo, setTechnicianInfo] = useState({
    fullName: 'Tên kỹ thuật viên',
    role: 'TECHNICIAN'
  });

  useEffect(() => {
    // Lấy thông tin từ user object (đã có từ login)
    if (user) {
      setTechnicianInfo({
        fullName: user.fullName || user.name || user.username || 'Tên kỹ thuật viên',
        role: user.role || 'TECHNICIAN'
      });
    } else {
      // Fallback: Lấy từ localStorage nếu AuthContext chưa load
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setTechnicianInfo({
            fullName: userData.fullName || userData.name || userData.username || 'Tên kỹ thuật viên',
            role: userData.role || 'TECHNICIAN'
          });
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      }
    }
  }, [user]);

  const handleBellClick = () => {
    // Có thể chọn 1 trong 2:
    // Option 1: Mở modal (quick view)
    setShowNotificationModal(true);
    
    // Option 2: Navigate đến trang notifications (full page)
    // navigate('/technician/notifications');
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>👨‍🔧</div>
          <div className={styles.fullName}>{technicianInfo.fullName}</div>
          <span className={styles.badge}>{technicianInfo.role}</span>
        </div>
        
        {/* Nút chuông - Click để xem thông báo */}
        <button 
          className={styles.bellBtn} 
          title="Thông báo"
          onClick={handleBellClick}
        >
          🔔
        </button>
      </header>

      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)} 
      />
    </>
  );
}
