import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagementPage.css';
import logoImage from '/src/assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';
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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [customersData, techniciansData, staffsData] = await Promise.all([
          getAllCustomers(),
          getAllTechnicians(),
          getAllStaffs()
        ]);
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
    navigate('/logout');
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

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        if (activeTab === 'customers') {
          await deleteCustomer(id);
          setCustomers(customers.filter(cust => cust.customerId !== id));
        } else if (activeTab === 'technicians') {
          await deleteTechnician(id);
          setTechnicians(technicians.filter(tech => tech.technicianId !== id));
        } else if (activeTab === 'employees') {
          // call backend delete for staff
          try {
            await deleteStaff(id);
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

  const handleSave = async () => {
    try {
      if (activeTab === 'customers') {
        if (editingItem) {
          const updated = await updateCustomer(editingItem.customerId, formData);
          setCustomers(customers.map(c => (c.customerId === editingItem.customerId ? updated : c)));
        } else {
          const created = await createCustomer(formData);
          setCustomers([...customers, created]);
        }
      } else if (activeTab === 'technicians') {
        if (editingItem) {
          const updated = await updateTechnician(editingItem.technicianId, formData);
          setTechnicians(technicians.map(t => (t.technicianId === editingItem.technicianId ? updated : t)));
        } else {
          const created = await createTechnician(formData);
          setTechnicians([...technicians, created]);
        }
      } else if (activeTab === 'employees') {
        // staff CRUD
        if (editingItem) {
          try {
            const updated = await updateStaff(editingItem.staffId || editingItem.id, formData);
            setEmployees(employees.map(e => ((e.staffId || e.id) === (editingItem.staffId || editingItem.id) ? updated : e)));
          } catch (e) {
            console.error('updateStaff failed', e);
            alert('Cập nhật nhân viên thất bại');
          }
        } else {
          try {
            const created = await createStaff(formData);
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
                      <tr key={user.customerId || user.technicianId || user.id}>
                        <td>{user.name || user.fullName || 'N/A'}</td>
                        <td>{user.customerId || user.technicianId || user.id}</td>
                        <td>{user.username || user.email || 'N/A'}</td>
                        <td>{user.status || 'Hoạt động'}</td>
                        <td className="cell-actions">
                          <button className="btn-action btn-edit" onClick={() => handleEdit(user)} disabled={activeTab === 'employees'}>Sửa</button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(user.customerId || user.technicianId || user.id)}
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
