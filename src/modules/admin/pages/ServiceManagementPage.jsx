import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceManagementPage.css';
import logoImage from '/src/assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';

export default function ServiceManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('services');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Dữ liệu lịch hẹn (giả lập)
  const [appointments, setAppointments] = useState([
    {
      id: 'DV01',
      customer: 'Nguyễn Văn A',
      phone: '09xx',
      serviceType: 'Bảo dưỡng định kỳ',
      vehicle: '',
      receptionist: 'Lê Văn B',
      technician: 'Trần Văn C',
      appointmentTime: '20/09 - 09:00',
      status: 'Chờ duyệt'
    },
    {
      id: 'DV02',
      customer: 'Trần Thị B',
      phone: '09xx',
      serviceType: 'Thay pin EV',
      vehicle: '',
      receptionist: 'Nguyễn Thị E',
      technician: 'Phạm Văn F',
      appointmentTime: '20/09 - 10:30',
      status: 'Đang làm'
    }
  ]);

  const handleLogout = () => {
    navigate('/logout');
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
    } else if (menu === 'centers') {
      navigate('/admin/centers');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    } else if (menu === 'settings') {
      navigate('/admin/settings');
    }
  };

  const handleEdit = (id) => {
    alert(`Sửa lịch hẹn ${id}`);
  };

  const handleApprove = (id) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'Đã duyệt' } : apt
    ));
    alert(`Đã duyệt lịch hẹn ${id}`);
  };

  const handleCancel = (id) => {
    if (window.confirm(`Bạn có chắc muốn hủy lịch hẹn ${id}?`)) {
      setAppointments(appointments.filter(apt => apt.id !== id));
      alert(`Đã hủy lịch hẹn ${id}`);
    }
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
            className={`nav-item ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => handleMenuClick('services')}
          >
            Quản lý dịch vụ
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
          <h1 className="page-title">Bảng chi tiết lịch hẹn & dịch vụ</h1>

          {/* Service Appointments Table */}
          <div className="service-table-container">
            <table className="service-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DV01</th>
                  <th>DV02</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Khách Hàng</td>
                  <td>
                    {appointments[0]?.customer} ({appointments[0]?.phone})
                  </td>
                  <td>
                    {appointments[1]?.customer} ({appointments[1]?.phone})
                  </td>
                </tr>
                <tr>
                  <td className="row-label">Loại dịch vụ</td>
                  <td>{appointments[0]?.serviceType}</td>
                  <td>{appointments[1]?.serviceType}</td>
                </tr>
                <tr>
                  <td className="row-label">Xe</td>
                  <td>{appointments[0]?.vehicle || ''}</td>
                  <td>{appointments[1]?.vehicle || ''}</td>
                </tr>
                <tr>
                  <td className="row-label">Nhân viên tiếp nhận</td>
                  <td>{appointments[0]?.receptionist}</td>
                  <td>{appointments[1]?.receptionist}</td>
                </tr>
                <tr>
                  <td className="row-label">Kỹ thuật viên</td>
                  <td>{appointments[0]?.technician}</td>
                  <td>{appointments[1]?.technician}</td>
                </tr>
                <tr>
                  <td className="row-label">Ngày hẹn – Giờ hẹn</td>
                  <td>{appointments[0]?.appointmentTime}</td>
                  <td>{appointments[1]?.appointmentTime}</td>
                </tr>
                <tr>
                  <td className="row-label">Trạng thái</td>
                  <td>
                    <span className={`status-badge status-${appointments[0]?.status.toLowerCase().replace(' ', '-')}`}>
                      {appointments[0]?.status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${appointments[1]?.status.toLowerCase().replace(' ', '-')}`}>
                      {appointments[1]?.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="row-label">Hành động</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action-sm btn-edit" 
                        onClick={() => handleEdit(appointments[0]?.id)}
                        title="Sửa"
                      >
                        🔧 Sửa
                      </button>
                      <button 
                        className="btn-action-sm btn-approve" 
                        onClick={() => handleApprove(appointments[0]?.id)}
                        title="Duyệt"
                      >
                        ✓ Duyệt
                      </button>
                      <button 
                        className="btn-action-sm btn-cancel" 
                        onClick={() => handleCancel(appointments[0]?.id)}
                        title="Hủy"
                      >
                        ✕ Hủy
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action-sm btn-edit" 
                        onClick={() => handleEdit(appointments[1]?.id)}
                        title="Sửa"
                      >
                        🔧 Sửa
                      </button>
                      <button 
                        className="btn-action-sm btn-cancel" 
                        onClick={() => handleCancel(appointments[1]?.id)}
                        title="Hủy"
                      >
                        ✕ Hủy
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
