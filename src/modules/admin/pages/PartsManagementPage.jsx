import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PartsManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';

export default function PartsManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('parts');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu phụ tùng (19 items)
  const [parts, setParts] = useState([
    { id: 1, name: 'Phanh tay', price: 200000, quantity: 100 },
    { id: 2, name: 'Đèn / còi / hiển thị đồng hồ', price: 150000, quantity: 100 },
    { id: 3, name: 'Vỏ bọc, tay gas', price: 200000, quantity: 100 },
    { id: 4, name: 'Chân chống cạnh/ chân chống đứng', price: 150000, quantity: 100 },
    { id: 5, name: 'Cơ cấu khóa yên xe', price: 200000, quantity: 100 },
    { id: 6, name: 'Ắc quy Li-on', price: 1000000, quantity: 100 },
    { id: 7, name: 'Dầu phanh', price: 150000, quantity: 100 },
    { id: 8, name: 'Phanh trước', price: 200000, quantity: 100 },
    { id: 9, name: 'Ống dầu phanh trước', price: 150000, quantity: 100 },
    { id: 10, name: 'Vành xe trước', price: 300000, quantity: 100 },
    { id: 11, name: 'Lốp xe trước', price: 200000, quantity: 100 },
    { id: 12, name: 'Cổ phốt', price: 250000, quantity: 100 },
    { id: 13, name: 'Giảm xóc trước', price: 400000, quantity: 100 },
    { id: 14, name: 'Phanh sau', price: 200000, quantity: 100 },
    { id: 15, name: 'Ống dầu phanh sau', price: 150000, quantity: 100 },
    { id: 16, name: 'Vành xe sau', price: 300000, quantity: 100 },
    { id: 17, name: 'Lốp xe sau', price: 200000, quantity: 100 },
    { id: 18, name: 'Giảm xóc sau', price: 400000, quantity: 100 },
    { id: 19, name: 'Động cơ', price: 3000000, quantity: 100 }
  ]);

  const handleLogout = () => {
    alert('Đăng xuất thành công!');
    navigate('/login');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    } else if (menu === 'settings') {
      navigate('/admin/settings');
    }
  };

  const handleEdit = (id) => {
    alert(`Chỉnh sửa phụ tùng ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phụ tùng này?')) {
      setParts(parts.filter(part => part.id !== id));
      alert('Đã xóa phụ tùng!');
    }
  };

  const handleAdd = () => {
    alert('Chức năng thêm phụ tùng sẽ được phát triển!');
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
          <h1 className="page-title">Quản lý phụ tùng</h1>

          {/* Parts Table */}
          <div className="parts-table-container">
            <table className="parts-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên linh kiện</th>
                  <th>Giá linh kiện</th>
                  <th>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id}>
                    <td className="text-center">{part.id}</td>
                    <td>{part.name}</td>
                    <td className="text-right">{part.price.toLocaleString('vi-VN')} VND</td>
                    <td className="text-center">{part.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="table-actions">
            <button className="btn-action btn-add" onClick={handleAdd}>
              Thêm phụ tùng
            </button>
            <button className="btn-action btn-edit" onClick={() => handleEdit(parts[0]?.id)}>
              Chỉnh sửa
            </button>
            <button 
              className="btn-action btn-delete" 
              onClick={() => handleDelete(parts[parts.length - 1]?.id)}
              disabled={parts.length === 0}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
