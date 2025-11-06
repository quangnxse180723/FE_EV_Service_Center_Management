import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './CustomerLayout.css';

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: '🏠',
      path: '/customer/dashboard'
    },
    {
      id: 'payment-history',
      label: 'Lịch sử thanh toán',
      icon: '💳',
      path: '/customer/payment-history'
    },
    {
      id: 'profile',
      label: 'Thông tin khách hàng',
      icon: '👤',
      path: '/customer/profile'
    },
    {
      id: 'vehicles',
      label: 'Quản lý xe',
      icon: '🚗',
      path: '/customer/vehicles'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="customer-layout">
      {/* Header with hamburger menu */}
      <header className="customer-header">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="header-title">EV Service Center</h1>
      </header>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`customer-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>×</button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="customer-main">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
