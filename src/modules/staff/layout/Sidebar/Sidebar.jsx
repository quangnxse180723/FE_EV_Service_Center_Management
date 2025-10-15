import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPerson, 
  MdLogin,
  MdCalendarToday, 
  MdInventory, 
  MdReceipt,
  MdLogout
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/staff/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/staff/customers', icon: <MdPerson />, label: 'Quản lý khách hàng' },
    { path: '/staff/checkin', icon: <MdLogin />, label: 'Check-in' },
    { path: '/staff/schedules', icon: <MdCalendarToday />, label: 'Quản lý lịch hẹn' },
    { path: '/staff/inventory', icon: <MdInventory />, label: 'Kho phụ tùng' },
    { path: '/staff/invoices', icon: <MdReceipt />, label: 'Quản lý hóa đơn' },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <aside className="staff-sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="logo-volt">VØLT</span>
        <span className="logo-fix">FIX</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <MdLogout style={{ marginRight: '0.5rem' }} />
        Đăng xuất
      </button>
    </aside>
  );
};

export default Sidebar;