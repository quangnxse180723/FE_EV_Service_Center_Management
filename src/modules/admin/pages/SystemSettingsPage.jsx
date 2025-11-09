import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SystemSettingsPage.css';
import logoImage from '../../../assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('settings');
  const [activeTab, setActiveTab] = useState('general');
  const [lastBackupDate, setLastBackupDate] = useState(null);

  // General settings state
  const [centerName, setCenterName] = useState('EV Service Center');
  const [centerPhone, setCenterPhone] = useState('(024) 1234 5678');
  const [centerEmail, setCenterEmail] = useState('contact@evservice.vn');
  const [centerAddress, setCenterAddress] = useState('123 Đường ABC, Quận XYZ, Hà Nội');
  const [workingHours, setWorkingHours] = useState('08:00 - 18:00');
  const [workingDays, setWorkingDays] = useState('Thứ 2 - Thứ 7');

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    }
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const handleSaveGeneral = () => {
    alert('Đã lưu cài đặt chung!');
  };

  const handleBackup = () => {
    alert('Đang sao lưu dữ liệu...');
  };

  const handleRestore = () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu? Thao tác này sẽ ghi đè dữ liệu hiện tại.');
    if (confirmed) {
      alert('Đang khôi phục dữ liệu...');
    }
  };

  const handleClearLogs = () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa tất cả nhật ký hệ thống?');
    if (confirmed) {
      alert('Đã xóa nhật ký hệ thống!');
    }
  };

  const systemLogs = [
    { id: 1, time: '2025-01-15 14:30:25', user: 'admin@evservice.vn', action: 'Đăng nhập vào hệ thống', status: 'Thành công' },
    { id: 2, time: '2025-01-15 14:15:10', user: 'staff01@evservice.vn', action: 'Cập nhật thông tin khách hàng', status: 'Thành công' },
    { id: 3, time: '2025-01-15 13:45:00', user: 'admin@evservice.vn', action: 'Tạo tài khoản nhân viên mới', status: 'Thành công' },
    { id: 4, time: '2025-01-15 13:30:18', user: 'tech01@evservice.vn', action: 'Thất bại khi đăng nhập', status: 'Thất bại' },
    { id: 5, time: '2025-01-15 12:20:45', user: 'admin@evservice.vn', action: 'Sao lưu dữ liệu hệ thống', status: 'Thành công' },
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>⚙️ Cài Đặt Chung</h3>
      <div className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tên Trung Tâm</label>
            <input 
              type="text" 
              value={centerName} 
              onChange={(e) => setCenterName(e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="form-group">
            <label>Số Điện Thoại</label>
            <input 
              type="text" 
              value={centerPhone} 
              onChange={(e) => setCenterPhone(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email Liên Hệ</label>
            <input 
              type="email" 
              value={centerEmail} 
              onChange={(e) => setCenterEmail(e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="form-group">
            <label>Giờ Làm Việc</label>
            <input 
              type="text" 
              value={workingHours} 
              onChange={(e) => setWorkingHours(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Địa Chỉ</label>
            <input 
              type="text" 
              value={centerAddress} 
              onChange={(e) => setCenterAddress(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày Làm Việc</label>
            <input 
              type="text" 
              value={workingDays} 
              onChange={(e) => setWorkingDays(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>

        <button className="btn-save-settings" onClick={handleSaveGeneral}>
          💾 Lưu Cài Đặt
        </button>
      </div>
    </div>
  );

  const renderRoleSettings = () => (
    <div className="settings-section">
      <h3>👥 Quản Lý Vai Trò</h3>
      <div className="roles-container">
        <div className="role-card">
          <div className="role-header">
            <h4>🔐 Quản Trị Viên (Admin)</h4>
            <span className="role-count">2 người</span>
          </div>
          <div className="role-permissions">
            <p><strong>Quyền:</strong></p>
            <ul>
              <li>✅ Quản lý người dùng</li>
              <li>✅ Quản lý doanh thu</li>
              <li>✅ Quản lý dịch vụ</li>
              <li>✅ Quản lý phụ tùng</li>
              <li>✅ Quản lý xe</li>
              <li>✅ Cài đặt hệ thống</li>
            </ul>
          </div>
        </div>

        <div className="role-card">
          <div className="role-header">
            <h4>👔 Nhân Viên (Staff)</h4>
            <span className="role-count">5 người</span>
          </div>
          <div className="role-permissions">
            <p><strong>Quyền:</strong></p>
            <ul>
              <li>✅ Quản lý lịch hẹn</li>
              <li>✅ Quản lý phiếu check-in</li>
              <li>✅ Xem thông tin xe</li>
              <li>✅ Tạo hóa đơn</li>
              <li>❌ Không thể quản lý người dùng</li>
              <li>❌ Không thể cài đặt hệ thống</li>
            </ul>
          </div>
        </div>

        <div className="role-card">
          <div className="role-header">
            <h4>🔧 Kỹ Thuật Viên (Technician)</h4>
            <span className="role-count">8 người</span>
          </div>
          <div className="role-permissions">
            <p><strong>Quyền:</strong></p>
            <ul>
              <li>✅ Xem công việc được giao</li>
              <li>✅ Cập nhật tiến độ công việc</li>
              <li>✅ Điền phiếu kiểm tra</li>
              <li>✅ Xem thông tin xe và phụ tùng</li>
              <li>❌ Không thể quản lý lịch hẹn</li>
              <li>❌ Không thể xem doanh thu</li>
            </ul>
          </div>
        </div>

        <div className="role-card">
          <div className="role-header">
            <h4>👤 Khách Hàng (Customer)</h4>
            <span className="role-count">120 người</span>
          </div>
          <div className="role-permissions">
            <p><strong>Quyền:</strong></p>
            <ul>
              <li>✅ Đặt lịch bảo dưỡng</li>
              <li>✅ Quản lý xe của mình</li>
              <li>✅ Xem lịch sử bảo dưỡng</li>
              <li>✅ Xem chi tiết hóa đơn</li>
              <li>❌ Không thể truy cập Admin Panel</li>
              <li>❌ Không thể xem thông tin khách khác</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="settings-section">
      <h3>💾 Sao Lưu & Khôi Phục</h3>
      <div className="backup-container">
        <div className="backup-card">
          <div className="backup-icon">📦</div>
          <h4>Sao Lưu Dữ Liệu</h4>
          <p>Tạo bản sao lưu toàn bộ dữ liệu hệ thống</p>
          <button className="btn-backup" onClick={handleBackup}>
            ⬇️ Sao Lưu Ngay
          </button>
          <p className="backup-info">Lần sao lưu gần nhất: 15/01/2025 12:20</p>
        </div>

        <div className="backup-card">
          <div className="backup-icon">♻️</div>
          <h4>Khôi Phục Dữ Liệu</h4>
          <p>Khôi phục dữ liệu từ bản sao lưu</p>
          <button className="btn-restore" onClick={handleRestore}>
            ⬆️ Khôi Phục
          </button>
          <p className="backup-info warning">⚠️ Thao tác này sẽ ghi đè dữ liệu hiện tại</p>
        </div>

        <div className="backup-card">
          <div className="backup-icon">🗑️</div>
          <h4>Dọn Dẹp Hệ Thống</h4>
          <p>Xóa dữ liệu tạm và nhật ký cũ</p>
          <button className="btn-clear" onClick={handleClearLogs}>
            🧹 Dọn Dẹp
          </button>
          <p className="backup-info">Giải phóng không gian lưu trữ</p>
        </div>
      </div>
    </div>
  );

  const renderSystemLogs = () => (
    <div className="settings-section">
      <h3>📋 Nhật Ký Hệ Thống</h3>
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thời Gian</th>
              <th>Người Dùng</th>
              <th>Hành Động</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {systemLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.time}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>
                  <span className={`log-status ${log.status === 'Thành công' ? 'success' : 'failed'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-clear-logs" onClick={handleClearLogs}>
        🗑️ Xóa Tất Cả Nhật Ký
      </button>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logoImage} alt="EV Service Center" className="logo" />
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
        <AdminHeader />

        {/* Content */}
        <div className="admin-content">
          <h2 className="page-title">⚙️ Cài Đặt Hệ Thống</h2>

        {/* Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ Cài đặt chung
          </button>
          <button 
            className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            👥 Vai trò
          </button>
          <button 
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            💾 Sao lưu
          </button>
          <button 
            className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📋 Nhật ký
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'roles' && renderRoleSettings()}
          {activeTab === 'backup' && renderBackupSettings()}
          {activeTab === 'logs' && renderSystemLogs()}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
