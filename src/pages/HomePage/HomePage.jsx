// src/pages/HomePage.jsx
import React from 'react';
import { FaBell, FaUser, FaBars, FaChevronDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  const handleUserIconClick = () => {
    navigate('/login');
  };

  return (
    <div className="homepage">
      {/* Header/Navigation */}
      <header className="header">
        <div className="logo">
          <span className="logo-volt">VØLT</span>
          <span className="logo-fix">FIX</span>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link active">TRANG CHỦ</Link>
          <Link to="/booking" className="nav-link">ĐẶT LỊCH</Link>
          <Link to="/pricing" className="nav-link">BẢNG GIÁ</Link>
          <Link to="/history" className="nav-link">LỊCH SỬ</Link>
        </nav>
        <div className="header-actions">
          <button className="icon-btn">
            <FaBell />
          </button>
          <button className="icon-btn" onClick={handleUserIconClick} title="Đăng nhập">
            <FaUser />
          </button>
          <button className="icon-btn menu-btn">
            <FaBars />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              DỊCH VỤ SỬA CHỮA XE ĐIỆN CHUYÊN NGHIỆP
            </h1>
            <p className="hero-description">
              An tâm trên mọi hành trình cùng Voltfix.
            </p>
            <p className="hero-subtitle">
              Đặt lịch chỉ trong 5 phút.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">
                ĐẶT LỊCH SỬA CHỮA NGAY
              </button>
              <button className="btn btn-secondary">
                XEM BẢNG GIÁ DỊCH VỤ
              </button>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <FaChevronDown className="scroll-arrow" />
        </div>
      </section>
    </div>
  );
}