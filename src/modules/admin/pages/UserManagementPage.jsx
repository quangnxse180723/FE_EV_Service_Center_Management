import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer, getAllTechnicians, createTechnician, updateTechnician, deleteTechnician, getAllStaffs, createStaff, updateStaff, deleteStaff } from '../../../api/adminApi.js';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('accounts');
  const [activeTab, setActiveTab] = useState('customers');

  // State for data
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu nhân viên (lấy từ backend - staff)
  const [employees, setEmployees] = useState([]);

  // 🔄 API GET: Tải dữ liệu khi component mount lần đầu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 📞 Gọi 3 API GET cùng lúc để lấy danh sách Khách hàng, Kỹ thuật viên, Nhân viên
        const [customersData, techniciansData, staffsData] = await Promise.all([
          getAllCustomers(),    // 👉 GET /api/admin/customers - Lấy danh sách tất cả khách hàng
          getAllTechnicians(),  // 👉 GET /api/admin/technicians - Lấy danh sách tất cả kỹ thuật viên
          getAllStaffs()        // 👉 GET /api/admin/staffs - Lấy danh sách tất cả nhân viên
        ]);
        // 💾 Lưu dữ liệu vào state để hiển thị lên UI
        setCustomers(customersData);
        setTechnicians(techniciansData);
        setEmployees(Array.isArray(staffsData) ? staffsData : []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    }
  };

  // 🗑️ API DELETE: Xóa tài khoản (Khách hàng / Kỹ thuật viên / Nhân viên)
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        // 👉 Kiểm tra tab hiện tại để gọi đúng API xóa
        if (activeTab === 'customers') {
          // 📞 DELETE /api/admin/customers/{id} - Xóa khách hàng theo ID
          await deleteCustomer(id);
          // 💾 Cập nhật state: Loại bỏ khách hàng vừa xóa khỏi danh sách
          setCustomers(customers.filter(cust => cust.customerId !== id));
        } else if (activeTab === 'technicians') {
          // 📞 DELETE /api/admin/technicians/{id} - Xóa kỹ thuật viên theo ID
          await deleteTechnician(id);
          // 💾 Cập nhật state: Loại bỏ kỹ thuật viên vừa xóa khỏi danh sách
          setTechnicians(technicians.filter(tech => tech.technicianId !== id));
        } else if (activeTab === 'employees') {
          // 📞 DELETE /api/admin/staffs/{id} - Xóa nhân viên theo ID
          try {
            await deleteStaff(id);
            // 💾 Cập nhật state: Loại bỏ nhân viên vừa xóa khỏi danh sách
            setEmployees(employees.filter(emp => emp.staffId !== id && emp.id !== id));
          } catch (e) {
            console.warn('deleteStaff failed, falling back to client filter', e.message);
            setEmployees(employees.filter(emp => emp.staffId !== id && emp.id !== id));
          }
        }
        alert('Đã xóa tài khoản!');
      } catch (err) {
        alert('Lỗi khi xóa tài khoản');
        console.error('Error deleting:', err);
      }
    }
  };

  // Modal & form state for add/edit
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', address: '' });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || item.fullName || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || ''
    });
    setIsModalOpen(true);
  };

  // ✏️➕ API CREATE & UPDATE: Lưu dữ liệu (Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    try {
      // 👉 Kiểm tra tab hiện tại để gọi đúng API
      if (activeTab === 'customers') {
        if (editingItem) {
          // 📞 PUT /api/admin/customers/{id} - Cập nhật thông tin khách hàng
          const updated = await updateCustomer(editingItem.customerId, formData);
          // 💾 Cập nhật state: Thay thế khách hàng cũ bằng dữ liệu mới
          setCustomers(customers.map(c => (c.customerId === editingItem.customerId ? updated : c)));
        } else {
          // 📞 POST /api/admin/customers - Tạo khách hàng mới
          const created = await createCustomer(formData);
          // 💾 Cập nhật state: Thêm khách hàng mới vào danh sách
          setCustomers([...customers, created]);
        }
      } else if (activeTab === 'technicians') {
        if (editingItem) {
          // 📞 PUT /api/admin/technicians/{id} - Cập nhật thông tin kỹ thuật viên
          const updated = await updateTechnician(editingItem.technicianId, formData);
          // 💾 Cập nhật state: Thay thế kỹ thuật viên cũ bằng dữ liệu mới
          setTechnicians(technicians.map(t => (t.technicianId === editingItem.technicianId ? updated : t)));
        } else {
          // 📞 POST /api/admin/technicians - Tạo kỹ thuật viên mới
          const created = await createTechnician(formData);
          // 💾 Cập nhật state: Thêm kỹ thuật viên mới vào danh sách
          setTechnicians([...technicians, created]);
        }
      } else if (activeTab === 'employees') {
        // staff CRUD
        if (editingItem) {
          try {
            // 📞 PUT /api/admin/staffs/{id} - Cập nhật thông tin nhân viên
            const updated = await updateStaff(editingItem.staffId || editingItem.id, formData);
            // 💾 Cập nhật state: Thay thế nhân viên cũ bằng dữ liệu mới
            setEmployees(employees.map(e => ((e.staffId || e.id) === (editingItem.staffId || editingItem.id) ? updated : e)));
          } catch (e) {
            console.error('updateStaff failed', e);
            alert('Cập nhật nhân viên thất bại');
          }
        } else {
          try {
            // 📞 POST /api/admin/staffs - Tạo nhân viên mới
            const created = await createStaff(formData);
            // 💾 Cập nhật state: Thêm nhân viên mới vào danh sách
            setEmployees([...employees, created]);
          } catch (e) {
            console.error('createStaff failed', e);
            alert('Tạo nhân viên thất bại');
          }
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving item', err);
      alert('Lưu thất bại');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
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
          <h1 className="page-title">Quản lý tài khoản</h1>

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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Họ và tên</th>
                    <th>Id tài khoản</th>
                    <th>Tài khoản</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    currentData.map((user) => (
                      <tr key={user.customerId || user.technicianId || user.staffId || user.id}>
                        <td>{user.name || user.fullName || 'N/A'}</td>
                        <td>{user.customerId || user.technicianId || user.staffId || user.id || 'N/A'}</td>
                        <td>{user.username || user.email || 'N/A'}</td>
                        <td>{user.status || 'Hoạt động'}</td>
                        <td className="cell-actions">
                          <button className="btn-action btn-edit" onClick={() => handleEdit(user)}>Sửa</button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(user.customerId || user.technicianId || user.staffId || user.id)}
                            disabled={loading}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Action Buttons */}
          <div className="table-actions">
            <button className="btn-action btn-add" onClick={handleAdd}>
              Thêm
            </button>
          </div>
          </div>
        </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'customers' ? 'khách hàng' : activeTab === 'technicians' ? 'kỹ thuật viên' : 'nhân viên'}</h3>
            <div className="modal-form">
              <input type="text" placeholder="Họ và tên" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <input type="text" placeholder="Địa chỉ" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
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
