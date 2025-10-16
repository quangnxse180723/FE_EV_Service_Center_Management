import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import logoImage from '/src/assets/img/logo.png';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu thống kê
  const stats = {
    customers: 1,
    employees: 6,
    services: 2
  };

  const handleLogout = () => {
    // Xử lý logout
    alert('Đăng xuất thành công!');
    navigate('/login');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'services') {
      navigate('/admin/services');
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logoImage} alt="VOLTFIX Logo" className="logo" />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard')}
          >
            Bảng điều khiển
          </button>
          <button
            className={`nav-item ${activeMenu === 'accounts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('accounts')}
          >
            Quản lý tài khoản
          </button>
          <button
            className={`nav-item ${activeMenu === 'revenue' ? 'active' : ''}`}
            onClick={() => handleMenuClick('revenue')}
          >
            Quản lý doanh thu
          </button>
          <button
            className={`nav-item ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => handleMenuClick('services')}
          >
            Quản lý dịch vụ
          </button>
          <button
            className={`nav-item ${activeMenu === 'parts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('parts')}
          >
            Quản lý phụ tùng
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-user">
            <div className="user-avatar">
              <div className="avatar-circle"></div>
            </div>
            <span className="user-name">{adminInfo.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Content */}
        <div className="admin-content">
          <h1 className="page-title">Bảng điều khiển</h1>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Khách hàng</div>
              <div className="stat-value">{stats.customers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Nhân viên</div>
              <div className="stat-value">{stats.employees}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Dịch vụ</div>
              <div className="stat-value">{stats.services}</div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-placeholder">Chart 1</div>
            </div>
            <div className="chart-card">
              <div className="chart-placeholder">Chart 2</div>
            </div>
            <div className="chart-card">
              <div className="chart-placeholder">Chart 3</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
