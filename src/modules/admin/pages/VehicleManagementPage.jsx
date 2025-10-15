import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehicleManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';

export default function VehicleManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu xe (giả lập)
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      licensePlate: '29A-123.45',
      brand: 'VinFast',
      model: 'Feliz S',
      year: 2023,
      color: 'Trắng',
      owner: 'Nguyễn Văn A',
      phone: '0901234567',
      lastService: '15/09/2025',
      nextService: '15/12/2025',
      status: 'Hoạt động',
      mileage: 15000
    },
    {
      id: 2,
      licensePlate: '30B-456.78',
      brand: 'Yadea',
      model: 'Ulike',
      year: 2022,
      color: 'Đen',
      owner: 'Trần Thị B',
      phone: '0912345678',
      lastService: '10/09/2025',
      nextService: '10/12/2025',
      status: 'Hoạt động',
      mileage: 12000
    },
    {
      id: 3,
      licensePlate: '51C-789.01',
      brand: 'VinFast',
      model: 'Klara S',
      year: 2024,
      color: 'Xanh',
      owner: 'Lê Văn C',
      phone: '0923456789',
      lastService: '20/08/2025',
      nextService: '20/11/2025',
      status: 'Bảo trì',
      mileage: 8000
    },
    {
      id: 4,
      licensePlate: '92D-234.56',
      brand: 'Pega',
      model: 'Cap A',
      year: 2023,
      color: 'Đỏ',
      owner: 'Phạm Thị D',
      phone: '0934567890',
      lastService: '05/09/2025',
      nextService: '05/12/2025',
      status: 'Hoạt động',
      mileage: 18000
    }
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
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    } else if (menu === 'settings') {
      navigate('/admin/settings');
    }
  };

  const handleViewDetail = (id) => {
    alert(`Xem chi tiết xe ID: ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Chỉnh sửa thông tin xe ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
      alert('Đã xóa xe!');
    }
  };

  const handleAddVehicle = () => {
    alert('Chức năng thêm xe mới sẽ được phát triển!');
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchSearch = 
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

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
          <h2 className="page-title">🚗 Quản lý xe</h2>

          {/* Stats Overview */}
          <div className="vehicle-stats">
            <div className="stat-box">
              <div className="stat-icon">🚗</div>
              <div className="stat-info">
                <div className="stat-value">{vehicles.length}</div>
                <div className="stat-label">Tổng số xe</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">
                  {vehicles.filter(v => v.status === 'Hoạt động').length}
                </div>
                <div className="stat-label">Đang hoạt động</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🔧</div>
              <div className="stat-info">
                <div className="stat-value">
                  {vehicles.filter(v => v.status === 'Bảo trì').length}
                </div>
                <div className="stat-label">Đang bảo trì</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-value">
                  {vehicles.filter(v => {
                    const nextDate = new Date(v.nextService.split('/').reverse().join('-'));
                    const today = new Date();
                    const diffTime = nextDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30 && diffDays > 0;
                  }).length}
                </div>
                <div className="stat-label">Sắp bảo dưỡng</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="vehicle-filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo biển số, chủ xe, hãng, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bảo trì">Bảo trì</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
            </div>
            <button className="btn-add-vehicle" onClick={handleAddVehicle}>
              ➕ Thêm xe mới
            </button>
          </div>

          {/* Vehicles Table */}
          <div className="vehicles-table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Biển số</th>
                  <th>Hãng / Model</th>
                  <th>Năm</th>
                  <th>Màu</th>
                  <th>Chủ xe</th>
                  <th>SĐT</th>
                  <th>Km đã đi</th>
                  <th>Bảo dưỡng gần nhất</th>
                  <th>Bảo dưỡng tiếp theo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>
                      Không tìm thấy xe nào
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="license-plate">{vehicle.licensePlate}</td>
                      <td>{vehicle.brand} {vehicle.model}</td>
                      <td>{vehicle.year}</td>
                      <td>{vehicle.color}</td>
                      <td>{vehicle.owner}</td>
                      <td>{vehicle.phone}</td>
                      <td>{vehicle.mileage.toLocaleString()} km</td>
                      <td>{vehicle.lastService}</td>
                      <td>{vehicle.nextService}</td>
                      <td>
                        <span className={`status-badge status-${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon btn-view" 
                            onClick={() => handleViewDetail(vehicle.id)}
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-icon btn-edit" 
                            onClick={() => handleEdit(vehicle.id)}
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon btn-delete" 
                            onClick={() => handleDelete(vehicle.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
