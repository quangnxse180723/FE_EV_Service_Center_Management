import React, { useEffect, useState } from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import './Header.css';

const TechnicianHeader = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('👤 Technician user loaded:', parsedUser);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <header className="technician-header">
      <div className="header-title">
        <h1>{user?.fullName || 'Tên kỹ thuật viên'}</h1>
        <span className="user-badge technician-badge">Technician</span>
      </div>

      <div className="header-actions">
        <button className="header-icon-btn notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>

        <div className="technician-profile">
          <div className="technician-avatar">
            <FaUser />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TechnicianHeader;
