import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RevenueManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';
import { getRevenueSummary, getRevenueGroups } from '../../../api/adminApi.js';

export default function RevenueManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // 💾 State cho dữ liệu doanh thu từ API
  const [revenueData, setRevenueData] = useState({
    daily: { invoices: 0, revenue: 0, cost: 0, profit: 0 },
    monthly: { invoices: 0, revenue: 0, cost: 0, profit: 0 },
    yearly: { invoices: 0, revenue: 0, cost: 0, profit: 0 }
  });

  const [revenueGroups, setRevenueGroups] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày trước
    to: new Date().toISOString().split('T')[0] // Hôm nay
  });
  const [groupBy, setGroupBy] = useState('day'); // 'day' | 'week' | 'month'

  // 🔄 API GET: Tải dữ liệu doanh thu khi component mount hoặc filter thay đổi
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 📞 Lấy doanh thu theo ngày (hôm nay)
        const today = new Date().toISOString().split('T')[0];
        const dailySummary = await getRevenueSummary(today, today);
        console.log('✅ Daily revenue:', dailySummary);

        // 📞 Lấy doanh thu theo tháng (30 ngày qua)
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthlySummary = await getRevenueSummary(monthAgo, today);
        console.log('✅ Monthly revenue:', monthlySummary);

        // 📞 Lấy doanh thu theo năm (365 ngày qua)
        const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const yearlySummary = await getRevenueSummary(yearAgo, today);
        console.log('✅ Yearly revenue:', yearlySummary);

        // 📊 Cập nhật state với dữ liệu từ 3 khoảng thời gian
        setRevenueData({
          daily: {
            invoices: dailySummary?.invoiceCount || 0,
            revenue: dailySummary?.totalRevenue || 0,
            cost: dailySummary?.totalCost || 0,
            profit: dailySummary?.totalProfit || 0
          },
          monthly: {
            invoices: monthlySummary?.invoiceCount || 0,
            revenue: monthlySummary?.totalRevenue || 0,
            cost: monthlySummary?.totalCost || 0,
            profit: monthlySummary?.totalProfit || 0
          },
          yearly: {
            invoices: yearlySummary?.invoiceCount || 0,
            revenue: yearlySummary?.totalRevenue || 0,
            cost: yearlySummary?.totalCost || 0,
            profit: yearlySummary?.totalProfit || 0
          }
        });

        // 📞 GET /api/admin/revenue/groups - Lấy doanh thu theo nhóm (dùng cho chart)
        const groups = await getRevenueGroups(dateRange.from, dateRange.to, groupBy);
        console.log('✅ Revenue groups:', groups);
        setRevenueGroups(Array.isArray(groups) ? groups : []);
      } catch (err) {
        console.error('❌ Error loading revenue:', err);
        setError('Không thể tải dữ liệu doanh thu');
        // Fallback về dữ liệu mẫu
        setRevenueData({
          daily: { invoices: 0, revenue: 0, cost: 0, profit: 0 },
          monthly: { invoices: 0, revenue: 0, cost: 0, profit: 0 },
          yearly: { invoices: 0, revenue: 0, cost: 0, profit: 0 }
        });
        setRevenueGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [dateRange, groupBy]);

  const handleLogout = () => {
    alert('Đăng xuất thành công!');
    navigate('/');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'parts') {
      navigate('/admin/parts');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
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
            className={`nav-item ${activeMenu === 'vehicles' ? 'active' : ''}`}
            onClick={() => handleMenuClick('vehicles')}
          >
            Quản lý xe
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-user">
            <div className="user-avatar">
              <img src={adminAvatar} alt="Admin Avatar" className="avatar-image" />
            </div>
            <span className="user-name">{adminInfo.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Content */}
        <div className="admin-content">
          <h1 className="page-title">Quản lý doanh thu</h1>

          {/* Revenue Table */}
          <div className="revenue-table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Theo ngày</th>
                  <th>Theo tháng</th>
                  <th>Theo năm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Số Hóa Đơn</td>
                  <td>{revenueData.daily.invoices}</td>
                  <td>{revenueData.monthly.invoices}</td>
                  <td>{revenueData.yearly.invoices}</td>
                </tr>
                <tr>
                  <td className="row-label">Tổng Doanh thu</td>
                  <td>{revenueData.daily.revenue.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.monthly.revenue.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.yearly.revenue.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="row-label">Tổng Chi phí</td>
                  <td>{revenueData.daily.cost.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.monthly.cost.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.yearly.cost.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td className="row-label">Tổng Lợi nhuận</td>
                  <td>{revenueData.daily.profit.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.monthly.profit.toLocaleString('vi-VN')} đ</td>
                  <td>{revenueData.yearly.profit.toLocaleString('vi-VN')} đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
