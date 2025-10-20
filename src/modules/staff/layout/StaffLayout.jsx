import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';
import './StaffLayout.css';

const StaffLayout = () => {
  return (
    <div className="staff-layout">
      <Sidebar />
      <div className="staff-main">
        <Header />
        <main className="staff-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;