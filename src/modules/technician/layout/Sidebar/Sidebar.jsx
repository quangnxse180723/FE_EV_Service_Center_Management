import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdDashboard,
  MdBuild,
  MdAssignment,
  MdHistory,
  MdLogout
} from 'react-icons/md';
import { FaCar, FaWrench } from 'react-icons/fa';
import './Sidebar.css';
import authApi from '../../../../api/authApi';

const TechnicianSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      path: '/technician/dashboard', 
      icon: <MdDashboard />, 
      label: 'Dashboard' 
    },
    { 
      path: '/technician/assigned-vehicles', 
      icon: <FaCar />, 
      label: 'Xe được phân công' 
    },
    { 
      path: '/technician/services', 
      icon: <FaWrench />, 
      label: 'Phiếu dịch vụ' 
    },
    { 
      path: '/technician/inspection', 
      icon: <MdAssignment />, 
      label: 'Biên bản kiểm tra' 
    },
    { 
      path: '/technician/maintenance-list', 
      icon: <MdBuild />, 
      label: 'Danh sách bảo dưỡng' 
    },
  ];

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await authApi.logout();
      navigate('/login');
    }
  };

  return (
    <aside className="technician-sidebar">
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

export default TechnicianSidebar;
