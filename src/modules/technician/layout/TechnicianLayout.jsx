import React from 'react';
import { Outlet } from 'react-router-dom';
import TechnicianSidebar from './Sidebar/Sidebar';
import TechnicianHeader from './Header/Header';
import './TechnicianLayout.css';

const TechnicianLayout = () => {
  return (
    <div className="technician-layout">
      <TechnicianSidebar />
      <div className="technician-main">
        <TechnicianHeader />
        <main className="technician-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TechnicianLayout;
