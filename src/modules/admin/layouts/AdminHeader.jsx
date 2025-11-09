import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import NotificationModal from '../../../components/shared/NotificationModal';
import './AdminHeader.css';

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    fullName: 'Administrator',
    role: 'ADMIN'
  });

  useEffect(() => {
    // Lấy thông tin từ user object (đã có từ login)
    if (user) {
      setAdminInfo({
        fullName: user.fullName || user.name || user.username || 'Administrator',
        role: user.role || 'ADMIN'
      });
    } else {
      // Fallback: Lấy từ localStorage nếu AuthContext chưa load
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setAdminInfo({
            fullName: userData.fullName || userData.name || userData.username || 'Administrator',
            role: userData.role || 'ADMIN'
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

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Navigate đến trang logout
      navigate('/logout');
    }
  };

  return (
    <>
      <header className="admin-header">
        <div className="admin-user-info">
          <div className="admin-avatar">👨‍💼</div>
          <div className="admin-full-name">{adminInfo.fullName}</div>
          <span className="admin-badge">{adminInfo.role}</span>
        </div>
        
        <div className="admin-header-actions">
          <button 
            className="admin-bell-btn" 
            title="Thông báo"
            onClick={handleBellClick}
          >
            🔔
          </button>
          
          <button 
            className="admin-logout-btn" 
            title="Đăng xuất"
            onClick={handleLogout}
          >
            🚪
          </button>
        </div>
      </header>

      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)} 
      />
    </>
  );
}
