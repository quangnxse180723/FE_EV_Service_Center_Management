import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import './HomePage.css';
import heroImg from '../assets/img/hero_img.png';
import logoImage from '../assets/img/logo.png';
import NotificationModal from '../components/shared/NotificationModal';

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const { unreadCount } = useNotifications(user?.id || 'guest');
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showAuthDropdown) return;
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowAuthDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuthDropdown]);

  // Hàm xử lý khi click "Quản lý xe"
  const handleManageVehicles = () => {
    if (isLoggedIn) {
      navigate('/my-vehicles');
    } else {
      navigate('/login', { state: { from: '/my-vehicles' } });
    }
  };

  // Hàm xử lý khi click "Đặt lịch"
  const handleBooking = () => {
    if (isLoggedIn) {
      navigate('/booking');
    } else {
      navigate('/login', { state: { from: '/booking' } });
    }
  };

  return (
    <div className="homepage-root">
      {/* Header */}
      <header className="hf-header">
        <div className="hf-header-inner">
          <div className="hf-logo"> 
            <img src={logoImage} alt="VOLTFIX Logo" className="logo-image" onClick={() => navigate('/')} />
          </div>

          <nav className="hf-nav">
            <a className="nav-item active" onClick={() => navigate('/')}>Trang chủ</a>
            <a className="nav-item" onClick={() => navigate('/booking')}>Đặt lịch</a>
            <a className="nav-item" onClick={() => navigate('/price-list')}>Bảng giá</a>
            <a className="nav-item" onClick={() => navigate('/booking-history')}>Lịch sử</a>
          </nav>

          <div className="hf-actions">
            <div className="notification-bell-wrapper">
              <div 
                className="icon-circle bell" 
                title="Thông báo" 
                onClick={() => setShowNotificationModal(true)} 
                style={{ cursor: 'pointer' }} 
              />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <div
              className="icon-circle avatar"
              title="Tài khoản"
              ref={avatarRef}
              onClick={() => setShowAuthDropdown((v) => !v)}
            />
            <div className="icon-circle menu" title="Menu" />
            {showAuthDropdown && (
              <div className="auth-dropdown-root" ref={dropdownRef}>
                <div className="auth-dropdown-menu">
                  {isLoggedIn ? (
                    <>
                      <div className="auth-dropdown-item user-info">
                        <strong>{user?.name || 'Người dùng'}</strong>
                      </div>
                      <a onClick={() => navigate('/my-vehicles')} className="auth-dropdown-item">Quản lý xe</a>
                      <a onClick={() => navigate('/booking-history')} className="auth-dropdown-item">Lịch sử</a>
                      <a onClick={logout} className="auth-dropdown-item">Đăng xuất</a>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="auth-dropdown-item">Đăng nhập</a>
                      <a href="/register" className="auth-dropdown-item">Đăng ký</a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hf-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Dịch Vụ Bảo Dưỡng Xe Điện</h1>
            <h2 className="hero-subtitle">Toàn Diện - An Tâm Trên Mọi Hành Trình</h2>
            <p className="hero-description">
              Chuyên nghiệp, nhanh chóng, tin cậy - Đội ngũ kỹ thuật viên giàu kinh nghiệm 
              với trang thiết bị hiện đại, mang đến dịch vụ chất lượng cao nhất.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleBooking}>
                Đặt lịch ngay
              </button>
              <button className="btn-secondary" onClick={handleManageVehicles}>
                Quản lý xe
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroImg} alt="Electric Vehicle Service" />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <h3 className="feature-title">Kỹ Thuật Viên Chuyên Nghiệp</h3>
              <p className="feature-description">
                Đội ngũ kỹ thuật viên được đào tạo bài bản, có nhiều năm kinh nghiệm trong lĩnh vực xe điện
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3v6"/>
                  <path d="M18 3v6"/>
                  <rect x="3" y="9" width="18" height="6" rx="2"/>
                  <path d="M6 21v-3"/>
                  <path d="M18 21v-3"/>
                </svg>
              </div>
              <h3 className="feature-title">Thiết Bị Hiện Đại</h3>
              <p className="feature-description">
                Trang bị máy móc, thiết bị kiểm tra và bảo dưỡng tiên tiến nhất hiện nay
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="feature-title">Bảo Hành Toàn Diện</h3>
              <p className="feature-description">
                Chính sách bảo hành rõ ràng, minh bạch. Hỗ trợ khách hàng 24/7
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3 className="feature-title">Nhanh Chóng</h3>
              <p className="feature-description">
                Thời gian bảo dưỡng nhanh chóng, đúng hẹn. Không để khách hàng chờ đợi lâu
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5L22 7l-10-5z"/>
                  <path d="M2 17l10 5L22 17"/>
                  <path d="M2 12l10 5L22 12"/>
                </svg>
              </div>
              <h3 className="feature-title">Phụ Tùng Chính Hãng</h3>
              <p className="feature-description">
                100% phụ tùng chính hãng, đảm bảo chất lượng và độ bền cao
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-1s-1-2-2-2-1-3-1-3-2-1-2-1-3-1-3-1-1-2-2-2-3-1-3-1-2-1-2-1-1-3-1-3"/>
                </svg>
              </div>
              <h3 className="feature-title">Giá Cả Hợp Lý</h3>
              <p className="feature-description">
                Báo giá minh bạch, cạnh tranh. Không phát sinh chi phí ẩn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Dịch Vụ Của Chúng Tôi</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-number">01</div>
              <h3 className="service-title">Bảo Dưỡng Định Kỳ</h3>
              <p className="service-description">
                Kiểm tra, bảo dưỡng định kỳ để xe luôn hoạt động tốt nhất
              </p>
            </div>
            <div className="service-card">
              <div className="service-number">02</div>
              <h3 className="service-title">Bảo Dưỡng Pin</h3>
              <p className="service-description">
                Chẩn đoán và bảo dưỡng hệ thống pin, tăng tuổi thọ pin
              </p>
            </div>
            <div className="service-card">
              <div className="service-number">03</div>
              <h3 className="service-title">Thay Thế Phụ Tùng</h3>
              <p className="service-description">
                Thay thế phụ tùng chính hãng với quy trình chuẩn
              </p>
            </div>
            <div className="service-card">
              <div className="service-number">04</div>
              <h3 className="service-title">Kiểm Tra Tổng Quát</h3>
              <p className="service-description">
                Kiểm tra toàn diện các hệ thống của xe điện
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn Sàng Bắt Đầu?</h2>
            <p className="cta-description">
              Đặt lịch ngay hôm nay để trải nghiệm dịch vụ chất lượng cao
            </p>
            <button className="btn-cta" onClick={() => navigate('/booking')}>
              Đặt lịch ngay
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hf-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src={logoImage} alt="VOLTFIX Logo" className="footer-logo" />
              <p className="footer-description">
                Trung tâm bảo dưỡng xe điện hàng đầu, mang đến dịch vụ chuyên nghiệp và tin cậy.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Liên Hệ</h4>
              <p>📍 123 Đường ABC, Quận 1, TP.HCM</p>
              <p>📞 0901 234 567</p>
              <p>✉️ info@voltfix.com</p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Giờ Làm Việc</h4>
              <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
              <p>Thứ 7: 8:00 - 17:00</p>
              <p>Chủ nhật: 9:00 - 16:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 VOLTFIX. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        customerId={user?.id}
      />
    </div>
  );
}