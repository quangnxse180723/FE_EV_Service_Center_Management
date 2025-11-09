import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import NotificationModal from '../../../../components/shared/NotificationModal';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [staffInfo, setStaffInfo] = useState({
    fullName: 'Nhân viên',
    role: 'STAFF'
  });

  useEffect(() => {
    // Lấy thông tin từ user object (đã có từ login)
    if (user) {
      setStaffInfo({
        fullName: user.fullName || user.name || user.username || 'Nhân viên',
        role: user.role || 'STAFF'
      });
    } else {
      // Fallback: Lấy từ localStorage nếu AuthContext chưa load
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setStaffInfo({
            fullName: userData.fullName || userData.name || userData.username || 'Nhân viên',
            role: userData.role || 'STAFF'
          });
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      }
    }
  }, [user]);

  const handleBellClick = () => {
    setShowNotificationModal(true);
  };

  return (
    <>
      <header className="staff-header">
        <div className="staff-user-info">
          <div className="staff-avatar">👨‍💼</div>
          <div className="staff-full-name">{staffInfo.fullName}</div>
          <span className="staff-badge">{staffInfo.role}</span>
        </div>
        
        <button 
          className="staff-bell-btn" 
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
};

export default Header;