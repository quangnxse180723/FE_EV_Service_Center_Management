import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehicleManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle, getAllCustomers } from '../../../api/adminApi.js';

export default function VehicleManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for data
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Derived dashboard stats from vehicles (keep in sync with backend data)
  const stats = React.useMemo(() => {
    const total = (vehicles || []).length;

    const normalize = (s) => {
      if (s === null || s === undefined) return '';
      if (typeof s === 'boolean') return s ? 'true' : 'false';
      // remove diacritics, lower-case and trim
      try {
        return s.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
      } catch (e) {
        // fallback for environments without Unicode property escapes
        return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      }
    };

    // sets of normalized status values we consider equivalent
    const ACTIVE_SET = new Set(['hoat dong', 'hoatdong', 'active', '1', 'true']);
    const MAINT_SET = new Set(['bao tri', 'baotri', 'maintenance']);

    const active = (vehicles || []).filter(v => {
      const s = normalize(v?.status || v?.state || v?.statusName || '');
      return ACTIVE_SET.has(s);
    }).length;

    const maintenance = (vehicles || []).filter(v => {
      const s = normalize(v?.status || v?.state || v?.statusName || '');
      return MAINT_SET.has(s);
    }).length;
    const upcoming = (vehicles || []).filter(v => {
      if (!v || !v.nextService) return false;
      try {
        // assume nextService is dd/mm/yyyy or ISO; try both
        const parts = v.nextService.split ? v.nextService.split('/') : null;
        const nextDate = parts && parts.length === 3 ? new Date(parts.slice().reverse().join('-')) : new Date(v.nextService);
        const today = new Date();
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      } catch (e) {
        return false;
      }
    }).length;

    // debug: list unique normalized statuses (once) to help diagnose mismatches
    try {
      const uniq = Array.from(new Set((vehicles || []).map(v => normalize(v?.status || v?.state || v?.statusName || '')))).slice(0,20);
      console.debug('VehicleStatusDebug unique normalized statuses:', uniq);
    } catch (e) {}

    return { total, active, maintenance, upcoming };
  }, [vehicles]);

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  const handleLogout = () => {
    alert('Đăng xuất thành công!');
    navigate('/');
  };

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehiclesAndOwners = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch vehicles and customers in parallel
        const [vehiclesData, customersData] = await Promise.all([
          getAllVehicles(),
          // getAllCustomers may fail or be empty; allow graceful fallback
          getAllCustomers().catch((e) => {
            console.warn('getAllCustomers failed, continuing without owner enrichment', e);
            return [];
          })
        ]);

        // Debug: print samples so we can see shapes returned by backend
        try {
          console.group('VehicleOwnersDebug');
          console.debug('vehicles count:', (vehiclesData || []).length, 'sample:', (vehiclesData || [])[0]);
          console.debug('customers count:', (customersData || []).length, 'sample:', (customersData || [])[0]);
          console.debug('vehicle keys sample:', (vehiclesData || []).slice(0,3).map(v => Object.keys(v)));
          console.debug('customer keys sample:', (customersData || []).slice(0,3).map(c => Object.keys(c)));
          console.groupEnd();
        } catch (e) {
          // ignore console errors in older browsers
        }

        // build lookup map for customers by common id fields
        const custMap = new Map();
        (customersData || []).forEach((c) => {
          const key = c?.id ?? c?.customerId ?? c?._id ?? c?.customerId;
          if (key) custMap.set(String(key), c);
        });

        const cleanPhone = (p) => (p || '').toString().replace(/[^0-9]+/g, '');
        const normalize = (s) => (s || '').toString().trim().toLowerCase();

        // enrich vehicles with owner name/phone if possible; try multiple matching strategies
        const enriched = (vehiclesData || []).map((v) => {
          const custKey = v?.customerId ?? v?.customer?.id ?? v?.customer?.customerId ?? v?.customer?._id ?? v?.ownerId;
          let cust = custKey ? custMap.get(String(custKey)) : null;

          // fallback: match by phone
          if (!cust && v?.phone) {
            const p = cleanPhone(v.phone);
            cust = (customersData || []).find(c => cleanPhone(c?.phone) === p) || null;
            if (cust) console.debug('Matched customer by phone for vehicle', v?.licensePlate, cust?.id ?? cust?._id);
          }

          // fallback: match by owner name
          if (!cust && v?.owner) {
            const n = normalize(v.owner);
            cust = (customersData || []).find(c => normalize(c?.name) === n) || null;
            if (cust) console.debug('Matched customer by name for vehicle', v?.licensePlate, cust?.id ?? cust?._id);
          }

          return {
            ...v,
            owner: v.owner || cust?.name || v.owner,
            phone: v.phone || cust?.phone || v.phone,
            customer: v.customer || cust || v.customer,
          };
        });

        setVehicles(enriched);
      } catch (err) {
        setError('Failed to fetch vehicles');
        console.error('Error fetching vehicles or customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclesAndOwners();
  }, []);

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

  // Modal & form state for add/edit vehicle
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ licensePlate: '', brand: '', model: '', year: '', color: '', mileage: '' });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      licensePlate: item.licensePlate || '',
      brand: item.brand || '',
      model: item.model || '',
      year: item.year || '',
      color: item.color || '',
      mileage: item.mileage || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      try {
        await deleteVehicle(id);
        setVehicles(vehicles.filter(vehicle => vehicle.vehicleId !== id));
        alert('Đã xóa xe!');
      } catch (err) {
        alert('Lỗi khi xóa xe');
        console.error('Error deleting vehicle:', err);
      }
    }
  };

  const handleAddVehicle = () => {
    setEditingItem(null);
    setFormData({ licensePlate: '', brand: '', model: '', year: '', color: '', mileage: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        const updated = await updateVehicle(editingItem.vehicleId, formData);
        setVehicles(vehicles.map(v => (v.vehicleId === editingItem.vehicleId ? updated : v)));
      } else {
        const created = await createVehicle(formData);
        setVehicles([...vehicles, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving vehicle', err);
      alert('Lưu thất bại');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Filter vehicles (defensive - guard missing fields)
  const filteredVehicles = vehicles.filter(vehicle => {
    const q = (searchTerm || '').toLowerCase();
    const matchSearch = (
      (vehicle.licensePlate || '').toString().toLowerCase().includes(q) ||
      (vehicle.owner || vehicle.customer?.name || '').toString().toLowerCase().includes(q) ||
      (vehicle.brand || '').toString().toLowerCase().includes(q) ||
      (vehicle.model || '').toString().toLowerCase().includes(q)
    );

    const matchStatus = filterStatus === 'all' || ((vehicle.status || 'Hoạt động') === filterStatus);

    return matchSearch && matchStatus;
  });

  // Helper to display owner name/phone with many fallbacks
  const getOwnerName = (v) => {
    return (
      v?.owner ||
      v?.customer?.name ||
      v?.ownerName ||
      v?.customerName ||
      v?.owner_name ||
      v?.customer?.fullName ||
      'N/A'
    );
  };

  const getOwnerPhone = (v) => {
    return (
      v?.phone ||
      v?.customer?.phone ||
      v?.customerPhone ||
      v?.ownerPhone ||
      v?.owner_phone ||
      'N/A'
    );
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
          <h2 className="page-title">🚗 Quản lý xe</h2>

          {/* Stats Overview */}
          <div className="vehicle-stats">
            <div className="stat-box">
              <div className="stat-icon">🚗</div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Tổng số xe</div>
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
            {/* Add button moved below table per UI spec */}
          </div>

          {/* Vehicles Table */}
          <div className="vehicles-table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
            ) : (
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
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                        Không tìm thấy xe nào
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => {
                      const idKey = (vehicle.vehicleId || vehicle.id);
                      const stringId = idKey ? String(idKey) : null;
                      const selected = selectedVehicleId === stringId;
                      return (
                        <tr
                          key={stringId}
                          className={selected ? 'selected' : ''}
                          onClick={() => setSelectedVehicleId(selected ? null : stringId)}
                        >
                          <td className="license-plate"><span className="plate-pill">{vehicle.licensePlate || 'N/A'}</span></td>
                          <td>{vehicle.brand || 'N/A'} {vehicle.model || ''}</td>
                          <td>{vehicle.year || 'N/A'}</td>
                          <td>{vehicle.color || 'N/A'}</td>
                          <td>{getOwnerName(vehicle)}</td>
                          <td>{getOwnerPhone(vehicle)}</td>
                          <td>{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : 'N/A'}</td>
                          <td>{vehicle.lastService || 'N/A'}</td>
                          <td>{vehicle.nextService || 'N/A'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
            {/* Table-level actions: Add / Edit / Delete moved here. Edit/Delete require a row selection. */}
            <div className="table-actions">
              <button className="btn-add-vehicle" onClick={handleAddVehicle}>➕ Thêm</button>
              <button
                className="btn-edit-plain"
                onClick={() => {
                  if (!selectedVehicleId) return;
                  const sel = vehicles.find(v => String(v.vehicleId || v.id) === selectedVehicleId);
                  if (sel) handleEdit(sel);
                }}
                disabled={!selectedVehicleId}
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                className="btn-delete-plain"
                onClick={async () => {
                  if (!selectedVehicleId) return;
                  if (!window.confirm('Bạn có chắc muốn xóa xe được chọn?')) return;
                  try {
                    await deleteVehicle(selectedVehicleId);
                    setVehicles(vehicles.filter(v => String(v.vehicleId || v.id) !== selectedVehicleId));
                    setSelectedVehicleId(null);
                    alert('Đã xóa xe!');
                  } catch (err) {
                    console.error('Error deleting vehicle:', err);
                    alert('Lỗi khi xóa xe');
                  }
                }}
                disabled={!selectedVehicleId}
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for add/edit vehicle */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} xe</h3>
            <div className="modal-form">
              <input type="text" placeholder="Biển số xe" value={formData.licensePlate} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})} />
              <input type="text" placeholder="Hãng" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
              <input type="text" placeholder="Model" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
              <input type="number" placeholder="Năm" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
              <input type="text" placeholder="Màu" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
              <input type="number" placeholder="Số km" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} />
              <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px'}}>
                <button onClick={handleCloseModal}>Hủy</button>
                <button onClick={handleSave}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
