import React, { useEffect, useState } from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="staff-header">
      <div className="header-title">
        <h1>{document.title || 'Dashboard'}</h1>
      </div>

      <div className="header-actions">
        <button className="header-icon-btn">
          <FaBell />
        </button>

        <div className="staff-profile">
          <div className="staff-avatar">
            <FaUser />
          </div>
          <div className="staff-info">
            <span className="staff-name">{user?.fullName || 'Nhân viên'}</span>
            <span className="staff-role">{user?.role || 'Staff'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;