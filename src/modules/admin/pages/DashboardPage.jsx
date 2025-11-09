import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import logoImage from '/src/assets/img/log_voltfit.png';
import AdminHeader from '../layouts/AdminHeader';
import * as adminApi from '../../../api/adminApi.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // Live stats fetched from backend
  const [stats, setStats] = useState({ customers: 0, employees: 0, services: 0 });
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
        const servicesCount = Array.isArray(vehiclesRes) ? vehiclesRes.length : (vehiclesRes?.length || 0);

        setStats({ customers: customersCount, employees: staffCount, services: servicesCount });
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
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    } else if (menu === 'settings') {
      navigate('/admin/settings');
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
          <h1 className="page-title">Bảng điều khiển</h1>

          {/* Stats Cards */}
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
              <div className="stat-label">Dịch vụ</div>
              <div className="stat-value">{stats.services}</div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="charts-grid">
            <div className="chart-card stat-card">
              <div className="stat-label">Kỹ thuật viên</div>
              <div className="stat-value">{technicians.length}</div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 20, width: '100%' }}>Loading technicians...</div>
              ) : error ? (
                <div style={{ color: 'red', textAlign: 'center', padding: 20, width: '100%' }}>Error: {String(error)}</div>
              ) : (
                (() => {
                  const groups = groupTechniciansByCenter(technicians);
                  if (!groups.length) return <div style={{ textAlign: 'center', padding: 20, width: '100%' }}>Không có kỹ thuật viên</div>;
                  const max = Math.max(...groups.map(g => g.count));
                  return (
                    <div style={{ padding: '8px 16px', width: '100%', marginTop: 12 }}>
                      {groups.map((g) => (
                        <div key={g.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ width: 160, fontSize: 13, color: '#333' }}>{g.name}</div>
                          <div style={{ flex: 1, margin: '0 12px', background: '#eee', height: 16, borderRadius: 8 }}>
                            <div style={{ width: `${(g.count / (max || 1)) * 100}%`, height: '100%', background: '#6c8cff', borderRadius: 8 }} />
                          </div>
                          <div style={{ width: 36, textAlign: 'right', fontWeight: 600 }}>{g.count}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
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
  );
}
