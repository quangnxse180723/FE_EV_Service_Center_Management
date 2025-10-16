import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import heroImg from '../assets/img/hero_img.png';
import logoImage from '../assets/img/logo.png';

export default function HomePage() {
  const navigate = useNavigate();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
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

  return (
            <div className="homepage-root">
              <header className="hf-header">
                <div className="hf-header-inner">
                  <div className="hf-logo"> 
                    <img src={logoImage} alt="VOLTFIX Logo" className="logo-image" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
                  </div>

                  <nav className="hf-nav">
                    <a className="nav-item active" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Trang chủ</a>
                    <a className="nav-item" onClick={() => navigate('/booking')} style={{ cursor: 'pointer' }}>Đặt lịch</a>
                    <a className="nav-item" style={{ cursor: 'pointer' }}>Bảng giá</a>
                    <a className="nav-item" style={{ cursor: 'pointer' }}>Lịch sử</a>
                  </nav>

                  <div className="hf-actions" style={{ position: 'relative' }}>
                    <div className="icon-circle bell" title="Thông báo" />
                    <div
                      className="icon-circle avatar"
                      title="Tài khoản"
                      ref={avatarRef}
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowAuthDropdown((v) => !v)}
                    />
                    <div className="icon-circle menu" title="Menu" />
                    {showAuthDropdown && (
                      <div
                        className="auth-dropdown-root"
                        ref={dropdownRef}
                        style={{ position: 'absolute', top: 56, right: 0, zIndex: 1000 }}
                      >
                        <div className="auth-dropdown-menu">
                          <a href="/login" className="auth-dropdown-item">Đăng nhập</a>
                          <a href="/register" className="auth-dropdown-item">Đăng ký</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </header>

      <main className="hf-hero">
        <div className="hf-hero-inner">
          <div className="hero-image" style={{ backgroundImage: `url(${heroImg})` }} />
        </div>
      </main>

      {/* Section: Why Choose Us */}
      <section className="why-choose-us">
        <h2 className="wcu-title">Tại Sao Chọn Chúng Tôi?</h2>
        <div className="wcu-list">
          <div className="wcu-item">
            <div className="wcu-icon">
              {/* Wrench icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.7 19.3l-3.4-3.4a2 2 0 0 0-2.8 0l-1.1 1.1a2 2 0 0 0 0 2.8l3.4 3.4a2 2 0 0 0 2.8 0l1.1-1.1a2 2 0 0 0 0-2.8z"></path><path d="M17.5 17.5l-5-5"></path><path d="M8.5 8.5a5 5 0 1 1 7.1-7.1l-2.1 2.1"></path></svg>
            </div>
            <div className="wcu-label">Kỹ Thuật Viên</div>
            <div className="wcu-desc">Đội trạm Viện Chuyên nghiệp, dày dạn kinh nghiệm.</div>
          </div>
          <div className="wcu-item">
            <div className="wcu-icon">
              {/* Plug icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v6"></path><path d="M18 3v6"></path><rect x="3" y="9" width="18" height="6" rx="2"></rect><path d="M6 21v-3"></path><path d="M18 21v-3"></path></svg>
            </div>
            <div className="wcu-label">Thiết Bị Hiện Đại</div>
            <div className="wcu-desc">Trang thiết bị tiên tiến, hỗ trợ kiểm tra và sửa chữa tối ưu.</div>
          </div>
          <div className="wcu-item">
            <div className="wcu-icon">
              {/* Shield icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="wcu-label">Bảo Hành Toàn Diện</div>
            <div className="wcu-desc">Chính sách bảo hành rõ ràng, minh bạch, an tâm tuyệt đối.</div>
          </div>
        </div>
      </section>
    </div>
  );
}