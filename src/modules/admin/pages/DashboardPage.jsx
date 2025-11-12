import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import logoImage from '/src/assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';
import * as adminApi from '../../../api/adminApi.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');


  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Live stats fetched from backend
  const [stats, setStats] = useState({ customers: 0, employees: 0, technicians: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [customersRes, staffsRes, techniciansRes, vehiclesRes] = await Promise.all([
          adminApi.getAllCustomers(),
          adminApi.getAllStaffs(),
          adminApi.getAllTechnicians(),
          adminApi.getAllVehicles()
        ]);

        if (!mounted) return;

        const customersCount = Array.isArray(customersRes) ? customersRes.length : (customersRes?.length || 0);
        const staffCount = Array.isArray(staffsRes) ? staffsRes.length : (staffsRes?.length || 0);
        const techniciansCount = Array.isArray(techniciansRes) ? techniciansRes.length : (techniciansRes?.length || 0);

        setStats({ customers: customersCount, employees: staffCount, technicians: techniciansCount });
        setStaffs(Array.isArray(staffsRes) ? staffsRes : []);
        setTechnicians(Array.isArray(techniciansRes) ? techniciansRes : []);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        // try to surface HTTP status if available
        const status = err?.response?.status;
        setError(status || err.message || 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, []);

  // staffs state
  const [staffs, setStaffs] = useState([]);

  const groupStaffByCenter = (items) => {
    const map = {};
    (items || []).forEach((i) => {
      const centerName = i?.serviceCenter?.name || 'Unknown';
      map[centerName] = (map[centerName] || 0) + 1;
    });
    return Object.keys(map).map((name) => ({ name, count: map[name] }));
  };

  // technicians state (used for Chart 1)
  const [technicians, setTechnicians] = useState([]);

  const groupTechniciansByCenter = (items) => {
    const map = {};
    (items || []).forEach((t) => {
      const centerName = t?.serviceCenter?.name || 'Unknown';
      map[centerName] = (map[centerName] || 0) + 1;
    });
    return Object.keys(map).map((name) => ({ name, count: map[name] }));
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    } else if (menu === 'centers') {
      navigate('/admin/centers');
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
          <h1 className="page-title">Bảng điều khiển</h1>

          <div className="dashboard-grid">
            {/* Stats Cards (row 1) */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Khách hàng</div>
                <div className="stat-value">{stats.customers}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Nhân viên</div>
                <div className="stat-value">{stats.employees}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Kỹ thuật viên</div>
                <div className="stat-value">{stats.technicians}</div>
              </div>
            </div>

            {/* Charts Placeholder (row 2) */}
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-placeholder">Chart 1</div>
              </div>
              <div className="chart-card">
                <div className="chart-placeholder">Chart 2</div>
              </div>
              <div className="chart-card">
                <div className="chart-placeholder">Chart 3</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
