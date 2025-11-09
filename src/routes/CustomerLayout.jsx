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
      path: '/'
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
      

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main content */}
      <main className="customer-main">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
