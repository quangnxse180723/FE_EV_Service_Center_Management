import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationModal from '../shared/NotificationModal';
import voltfitLogo from '../../assets/img/log_voltfit.png';
import '../../pages/HomePage.css';

export default function HeaderHome({ activeMenu = 'home' }) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const menuDropdownRef = useRef(null);

  useEffect(() => {
    if (!showAuthDropdown) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuthDropdown]);

  useEffect(() => {
    if (!showMenuDropdown) return;

    const handleClickOutside = (e) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setShowMenuDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenuDropdown]);

  return (
    <>
      <header className="hf-header">
        <div className="hf-header-inner">
          <div className="hf-logo" onClick={() => navigate('/')}>
            <img 
              src={voltfitLogo} 
              alt="Voltfit Logo" 
              className="logo-image"
            />
          </div>

          <nav className="hf-nav">
            <a 
              className={`nav-item ${activeMenu === 'home' ? 'active' : ''}`} 
              onClick={() => navigate('/')}
            >
              Trang chủ
            </a>
            <a 
              className={`nav-item ${activeMenu === 'booking' ? 'active' : ''}`} 
              onClick={() => navigate('/booking')}
            >
              Đặt lịch
            </a>
            <a 
              className={`nav-item ${activeMenu === 'price' ? 'active' : ''}`}
              onClick={() => navigate('/price-list')}
            >
              Bảng giá
            </a>
            <a 
              className={`nav-item ${activeMenu === 'history' ? 'active' : ''}`} 
              onClick={() => navigate('/booking-history')}
            >
              Lịch sử
            </a>
          </nav>

          <div className="hf-actions">
            <div 
              className={`icon-circle bell ${activeMenu === 'notifications' ? 'active' : ''}`}
              title="Thông báo"
              onClick={() => setShowNotificationModal(true)}
            />
            <div
              className="icon-circle avatar"
              title="Tài khoản"
              ref={avatarRef}
              onClick={() => setShowAuthDropdown((prev) => !prev)}
            />
            <div 
              className="icon-circle menu" 
              title="Menu" 
              ref={menuRef}
              onClick={() => setShowMenuDropdown((prev) => !prev)}
            />
            {showAuthDropdown && (
              <div className="auth-dropdown-root" ref={dropdownRef}>
                <div className="auth-dropdown-menu">
                  {isLoggedIn ? (
                    <>
                      <div className="auth-dropdown-item user-info">
                        <strong>{user?.name || 'Người dùng'}</strong>
                      </div>
                      <a 
                        onClick={() => navigate('/my-vehicles')} 
                        className="auth-dropdown-item"
                      >
                        Quản lý xe
                      </a>
                      <a 
                        onClick={() => navigate('/booking-history')} 
                        className="auth-dropdown-item"
                      >
                        Lịch sử
                      </a>
                      <a 
                        onClick={() => navigate('/logout')} 
                        className="auth-dropdown-item"
                      >
                        Đăng xuất
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="auth-dropdown-item">
                        Đăng nhập
                      </a>
                      <a href="/register" className="auth-dropdown-item">
                        Đăng ký
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {showMenuDropdown && (
              <div className="auth-dropdown-root menu-dropdown-root" ref={menuDropdownRef}>
                <div className="auth-dropdown-menu">
                  {isLoggedIn ? (
                    <>
                      <div className="auth-dropdown-item dropdown-header">
                        <strong>📋 Menu</strong>
                      </div>
                      <a 
                        onClick={() => {
                          navigate('/customer/payment-history');
                          setShowMenuDropdown(false);
                        }} 
                        className="auth-dropdown-item"
                      >
                        💳 Lịch sử thanh toán
                      </a>
                      <a 
                        onClick={() => {
                          navigate('/customer/profile');
                          setShowMenuDropdown(false);
                        }} 
                        className="auth-dropdown-item"
                      >
                        👤 Thông tin khách hàng
                      </a>
                      <a 
                        onClick={() => {
                          navigate('/customer/vehicles');
                          setShowMenuDropdown(false);
                        }} 
                        className="auth-dropdown-item"
                      >
                        🚗 Quản lý xe
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="auth-dropdown-item dropdown-header">
                        <strong>Vui lòng đăng nhập</strong>
                      </div>
                      <a 
                        onClick={() => {
                          navigate('/login');
                          setShowMenuDropdown(false);
                        }} 
                        className="auth-dropdown-item"
                      >
                        Đăng nhập
                      </a>
                      <a 
                        onClick={() => {
                          navigate('/register');
                          setShowMenuDropdown(false);
                        }} 
                        className="auth-dropdown-item"
                      >
                        Đăng ký
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)} 
      />
    </>
  );
}
