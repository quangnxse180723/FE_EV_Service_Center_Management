import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import logoImage from '/src/assets/img/logo.png';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState({
    name: 'Admin',
    role: 'Administrator',
    email: ''
  });

  // Lấy thông tin admin từ localStorage khi component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    // Kiểm tra nếu chưa đăng nhập hoặc không phải ADMIN thì redirect về login
    if (!isAuthenticated || role !== 'ADMIN') {
      navigate('/login', { replace: true });
      return;
    }

    // Cập nhật thông tin admin
    if (user) {
      setAdminInfo({
        name: user.fullName || 'Admin',
        role: 'Administrator',
        email: user.email || ''
      });
    }
  }, [navigate]);

  // Dữ liệu thống kê
  const stats = {
    customers: 1,
    employees: 6,
    services: 2
  };

  const handleLogout = () => {
    // Xóa toàn bộ thông tin đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('accountId');
    localStorage.removeItem('token');
    
    // Chuyển về trang chủ
    navigate('/', { replace: true });
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
    } else if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img 
            src={logoImage} 
            alt="VOLTFIX Logo" 
            className="logo" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard')}
          >
            📊 Bảng điều khiển
          </button>
          <button
            className={`nav-item ${activeMenu === 'accounts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('accounts')}
          >
            👥 Quản lý tài khoản
          </button>
          <button
            className={`nav-item ${activeMenu === 'revenue' ? 'active' : ''}`}
            onClick={() => handleMenuClick('revenue')}
          >
            💰 Quản lý doanh thu
          </button>
          <button
            className={`nav-item ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => handleMenuClick('services')}
          >
            🔧 Quản lý dịch vụ
          </button>
          <button
            className={`nav-item ${activeMenu === 'parts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('parts')}
          >
            🔩 Quản lý phụ tùng
          </button>
        </nav>
        
        {/* Logout button ở sidebar */}
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h2 className="header-title">Admin Panel</h2>
          <div className="header-user">
            <div className="user-info">
              <span className="user-name">{adminInfo.name}</span>
              <span className="user-role">{adminInfo.role}</span>
            </div>
            <div className="user-avatar">
              <div className="avatar-circle">A</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          <h1 className="page-title">Bảng điều khiển</h1>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-label">Khách hàng</div>
                <div className="stat-value">{stats.customers}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-info">
                <div className="stat-label">Nhân viên</div>
                <div className="stat-value">{stats.employees}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔧</div>
              <div className="stat-info">
                <div className="stat-label">Dịch vụ</div>
                <div className="stat-value">{stats.services}</div>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Biểu đồ doanh thu</h3>
              <div className="chart-placeholder">
                📈 Biểu đồ sẽ được hiển thị ở đây
              </div>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">Khách hàng mới</h3>
              <div className="chart-placeholder">
                📊 Biểu đồ sẽ được hiển thị ở đây
              </div>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">Dịch vụ phổ biến</h3>
              <div className="chart-placeholder">
                📉 Biểu đồ sẽ được hiển thị ở đây
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
