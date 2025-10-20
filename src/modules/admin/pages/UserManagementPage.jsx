import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('accounts');
  const [activeTab, setActiveTab] = useState('employees');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu nhân viên
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      accountId: 'No.12345',
      username: 'nva123',
      status: 'Hoạt động'
    }
  ]);

  // Dữ liệu khách hàng (giả lập)
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Trần Thị B',
      accountId: 'No.12346',
      username: 'ttb456',
      status: 'Hoạt động'
    }
  ]);

  // Dữ liệu kỹ thuật viên (giả lập)
  const [technicians, setTechnicians] = useState([
    {
      id: 1,
      name: 'Lê Văn C',
      accountId: 'No.12347',
      username: 'lvc789',
      status: 'Hoạt động'
    }
  ]);

  const handleLogout = () => {
    alert('Đăng xuất thành công!');
    navigate('/');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    } else if (menu === 'settings') {
      navigate('/admin/settings');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      if (activeTab === 'employees') {
        setEmployees(employees.filter(emp => emp.id !== id));
      } else if (activeTab === 'customers') {
        setCustomers(customers.filter(cust => cust.id !== id));
      } else if (activeTab === 'technicians') {
        setTechnicians(technicians.filter(tech => tech.id !== id));
      }
      alert('Đã xóa tài khoản!');
    }
  };

  const handleAdd = () => {
    alert('Chức năng thêm tài khoản sẽ được phát triển!');
  };

  // Lấy dữ liệu theo tab hiện tại
  const getCurrentData = () => {
    if (activeTab === 'employees') return employees;
    if (activeTab === 'customers') return customers;
    if (activeTab === 'technicians') return technicians;
    return [];
  };

  const currentData = getCurrentData();

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
          <h1 className="page-title">Quản lý tài khoản nhân viên</h1>

          {/* Tabs */}
          <div className="user-tabs">
            <button
              className={`tab-item ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              Nhân viên
            </button>
            <button
              className={`tab-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              Khách hàng
            </button>
            <button
              className={`tab-item ${activeTab === 'technicians' ? 'active' : ''}`}
              onClick={() => setActiveTab('technicians')}
            >
              Kỹ thuật viên
            </button>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Id tài khoản</th>
                  <th>Tài khoản</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  currentData.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.accountId}</td>
                      <td>{user.username}</td>
                      <td>{user.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="table-actions">
            <button className="btn-action btn-add" onClick={handleAdd}>
              Thêm
            </button>
            <button 
              className="btn-action btn-delete" 
              onClick={() => currentData.length > 0 && handleDelete(currentData[0].id)}
              disabled={currentData.length === 0}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
