import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagementPage.css';
import logoImage from '/src/assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';
import { getAllCustomers, createCustomer, updateCustomer, toggleCustomerLock, getAllTechnicians, createTechnician, updateTechnician, deleteTechnician, getAllStaffs, createStaff, updateStaff, deleteStaff } from '../../../api/adminApi.js';

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
    } else if (menu === 'centers') {
      navigate('/admin/centers');
    }
  };

  // � Khóa/Mở khóa tài khoản
  const handleToggleLock = async (id, currentStatus) => {
    const action = currentStatus ? 'khóa' : 'mở khóa';
    if (window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) {
      try {
        // 👉 Chỉ hỗ trợ cho customer hiện tại
        if (activeTab === 'customers') {
          // 📞 PUT /api/admin/customers/{id}/toggle-lock - Toggle lock customer
          await toggleCustomerLock(id);
          // 💾 Cập nhật state: Refresh lại danh sách
          const data = await getAllCustomers();
          setCustomers(data);
          alert(`Đã ${action} tài khoản thành công!`);
        } else if (activeTab === 'technicians') {
          // TODO: Implement toggle lock for technicians
          alert('Chưa hỗ trợ khóa/mở khóa kỹ thuật viên');
        } else if (activeTab === 'employees') {
          // TODO: Implement toggle lock for staff
          alert('Chưa hỗ trợ khóa/mở khóa nhân viên');
        }
      } catch (err) {
        alert('Lỗi khi thay đổi trạng thái tài khoản');
        console.error('Error toggling lock:', err);
      }
    }
  };

  // Modal & form state for add/edit
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [formData, setFormData] = React.useState({ 
    role: 'CUSTOMER', 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '', 
    address: '' 
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ 
      role: 'CUSTOMER', 
      fullName: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      phone: '', 
      address: '' 
    });
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
    // Validation cho thêm mới
    if (!editingItem) {
      // Kiểm tra các trường bắt buộc
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      // Kiểm tra password khớp
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu và xác nhận mật khẩu không khớp!');
        return;
      }

      // Kiểm tra độ dài password
      if (formData.password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }

      // Kiểm tra email hợp lệ
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Email không hợp lệ!');
        return;
      }
    }

    try {
      // 👉 Thêm mới tài khoản
      if (!editingItem) {
        const newAccountData = {
          username: formData.email,
          password: formData.password,
          email: formData.email,
          role: formData.role,
          fullName: formData.fullName,
          phone: formData.phone || '',
          address: formData.address || ''
        };

        // Gọi API tạo tài khoản theo role
        if (formData.role === 'CUSTOMER') {
          const created = await createCustomer(newAccountData);
          setCustomers([...customers, created]);
        } else if (formData.role === 'TECHNICIAN') {
          const created = await createTechnician(newAccountData);
          setTechnicians([...technicians, created]);
        } else if (formData.role === 'STAFF') {
          const created = await createStaff(newAccountData);
          setEmployees([...employees, created]);
        }

        alert('Đã thêm tài khoản thành công!');
        setIsModalOpen(false);
        return;
      }

      // � Cập nhật tài khoản (code cũ)
      if (activeTab === 'customers') {
        // Chuyển đổi field name sang fullName cho Customer entity
        const customerData = {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        };
        
        if (editingItem) {
          // 📞 PUT /api/admin/customers/{id} - Cập nhật thông tin khách hàng
          const updated = await updateCustomer(editingItem.customerId, customerData);
          // 💾 Cập nhật state: Thay thế khách hàng cũ bằng dữ liệu mới
          setCustomers(customers.map(c => (c.customerId === editingItem.customerId ? updated : c)));
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
            className={`nav-item ${activeMenu === 'centers' ? 'active' : ''}`}
            onClick={() => handleMenuClick('centers')}
          >
            Quản lý trung tâm
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
                    currentData.map((user) => {
                      // Lấy trạng thái từ account.isActive
                      const isActive = user.account?.isActive !== false; // Default true nếu không có thông tin
                      const statusText = isActive ? 'Hoạt động' : 'Bị khóa';
                      const statusClass = isActive ? 'status-active' : 'status-locked';
                      
                      return (
                        <tr key={user.customerId || user.technicianId || user.staffId || user.id}>
                          <td>{user.name || user.fullName || 'N/A'}</td>
                          <td>{user.customerId || user.technicianId || user.staffId || user.id || 'N/A'}</td>
                          <td>{user.username || user.email || 'N/A'}</td>
                          <td><span className={statusClass}>{statusText}</span></td>
                          <td className="cell-actions">
                            <button className="btn-action btn-edit" onClick={() => handleEdit(user)}>Sửa</button>
                            <button
                              className={`btn-action ${isActive ? 'btn-lock' : 'btn-unlock'}`}
                              onClick={() => handleToggleLock(
                                user.customerId || user.technicianId || user.staffId || user.id,
                                isActive
                              )}
                              disabled={loading}
                            >
                              {isActive ? 'Khóa' : 'Mở khóa'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
            <h3>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} tài khoản</h3>
            <div className="modal-form">
              {/* Chỉ hiển thị role khi thêm mới */}
              {!editingItem && (
                <div className="form-group">
                  <label>Vai trò:</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="TECHNICIAN">Kỹ thuật viên</option>
                    <option value="STAFF">Nhân viên</option>
                  </select>
                </div>
              )}
              
              <input 
                type="text" 
                placeholder="Họ và tên *" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />
              <input 
                type="email" 
                placeholder="Email *" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
              
              {/* Chỉ hiển thị password khi thêm mới */}
              {!editingItem && (
                <>
                  <input 
                    type="password" 
                    placeholder="Mật khẩu * (ít nhất 6 ký tự)" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                  <input 
                    type="password" 
                    placeholder="Nhập lại mật khẩu *" 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                  />
                </>
              )}
              
              <input 
                type="tel" 
                placeholder="Số điện thoại" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Địa chỉ" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
              />
              
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
