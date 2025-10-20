import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RevenueManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';

export default function RevenueManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('revenue');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu doanh thu (giả lập - có thể fetch từ API)
  const [revenueData] = useState({
    daily: {
      invoices: 0,
      revenue: 0,
      cost: 0,
      profit: 0
    },
    monthly: {
      invoices: 0,
      revenue: 0,
      cost: 0,
      profit: 0
    },
    yearly: {
      invoices: 0,
      revenue: 0,
      cost: 0,
      profit: 0
    }
  });

  const handleLogout = () => {
    alert('Đăng xuất thành công!');
    navigate('/');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    } else if (menu === 'settings') {
      navigate('/admin/settings');
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
            className={`nav-item ${activeMenu === 'parts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('parts')}
          >
            Quản lý phụ tùng
          </button>
          <button
            className={`nav-item ${activeMenu === 'vehicles' ? 'active' : ''}`}
            onClick={() => handleMenuClick('vehicles')}
          >
            Quản lý xe
          </button>
          <button
            className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => handleMenuClick('settings')}
          >
            Cài đặt hệ thống
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-user">
            <div className="user-avatar">
              <img src={adminAvatar} alt="Admin Avatar" className="avatar-image" />
            </div>
            <span className="user-name">{adminInfo.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Content */}
        <div className="admin-content">
          <h1 className="page-title">Quản lý doanh thu</h1>

          {/* Revenue Table */}
          <div className="revenue-table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Theo ngày</th>
                  <th>Theo tháng</th>
                  <th>Theo năm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Số Hóa Đơn</td>
                  <td>{revenueData.daily.invoices}</td>
                  <td>{revenueData.monthly.invoices}</td>
                  <td>{revenueData.yearly.invoices}</td>
                </tr>
                <tr>
                  <td className="row-label">Tổng Doanh thu</td>
                  <td>{revenueData.daily.revenue.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.monthly.revenue.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.yearly.revenue.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="row-label">Tổng Chi phí</td>
                  <td>{revenueData.daily.cost.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.monthly.cost.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.yearly.cost.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="row-label">Tổng Lợi nhuận</td>
                  <td>{revenueData.daily.profit.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.monthly.profit.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.yearly.profit.toLocaleString('vi-VN')} đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
