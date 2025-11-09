import React, { useState, useEffect } from 'react';
import scheduleApi from '../../../api/scheduleApi';
import paymentApi from '../../../api/paymentApi';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    scheduledToday: 0,
    overdue: 0,
    pending: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);
  
  // State cho card doanh thu
  const [revenueDate, setRevenueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [revenueType, setRevenueType] = useState('day'); // day, week, month, year
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  useEffect(() => {
    fetchRevenue();
  }, [revenueDate, revenueType]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Gọi API dashboard stats từ backend
      const data = await scheduleApi.getDashboardStats(today);
      
      console.log('📊 Dashboard stats:', data);
      
      if (data && typeof data === 'object' && 'scheduledCount' in data) {
        setStats({
          scheduledToday: data.scheduledCount || 0,
          overdue: data.overdueCount || 0,
          pending: data.pendingCount || 0,
          completedToday: data.completedCount || 0
        });
        console.log('✅ Dashboard stats loaded successfully');
      } else {
        console.warn('⚠️ Invalid data format from API:', data);
        throw new Error('Invalid data format from API');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.warn('⚠️ Dashboard API error, using fallback method');
      await fetchDashboardStatsClientSide();
    } finally {
      setLoading(false);
    }
  };

  // Fallback method: client-side filtering
  const fetchDashboardStatsClientSide = async () => {
    try {
      const schedules = await scheduleApi.getAllSchedules();
      
      console.log('📋 Fallback: Fetched schedules:', schedules?.length || 0);
      
      if (!Array.isArray(schedules)) {
        console.error('❌ Fallback: schedules is not an array:', schedules);
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Số lịch hẹn được ĐẶT hôm nay
      const scheduledToday = schedules.filter(schedule => {
        if (!schedule.bookingDate) return false;
        const bookingDate = new Date(schedule.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      }).length;

      // 2. Xe đang bảo dưỡng
      const completedStatuses = ['HOÀN_TẤT', 'ĐÃ_THANH_TOÁN'];
      const overdue = schedules.filter(schedule => 
        !completedStatuses.includes(schedule.status)
      ).length;

      // 3. Xe chờ nhận trả
      const pending = schedules.filter(schedule => 
        schedule.status === 'CHỜ_THANH_TOÁN'
      ).length;

      // 4. Thanh toán hoàn thành hôm nay
      const completedToday = schedules.filter(schedule => {
        if (!schedule.bookingDate) return false;
        const bookingDate = new Date(schedule.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime() && 
               completedStatuses.includes(schedule.status);
      }).length;

      setStats({
        scheduledToday,
        overdue,
        pending,
        completedToday
      });
      
      console.log('✅ Fallback stats calculated');
    } catch (error) {
      console.error('Error in fallback fetch:', error);
    }
  };

  // Fetch doanh thu theo ngày/tuần/tháng/năm
  const fetchRevenue = async () => {
    try {
      setRevenueLoading(true);
      
      // Gọi API backend để lấy tổng doanh thu
      const data = await paymentApi.getRevenue(revenueDate, revenueType);
      
      console.log('💰 Revenue fetched:', data);
      
      if (data && typeof data.totalRevenue !== 'undefined') {
        setTotalRevenue(data.totalRevenue);
      } else {
        console.warn('⚠️ Invalid revenue data:', data);
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setTotalRevenue(0);
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleRevenueDateChange = (e) => {
    setRevenueDate(e.target.value);
  };

  const handleRevenueTypeChange = (e) => {
    setRevenueType(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getRevenuePeriodLabel = () => {
    const date = new Date(revenueDate);
    switch (revenueType) {
      case 'day':
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'week':
        return `Tuần ${getWeekNumber(date)} - ${date.getFullYear()}`;
      case 'month':
        return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      case 'year':
        return `Năm ${date.getFullYear()}`;
      default:
        return '';
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-label">Số lịch hẹn hôm nay</div>
            <div className="stat-value">{stats.scheduledToday}</div>
            <div className="stat-icon">📅</div>
          </div>

          <div className="stat-card red">
            <div className="stat-label">Xe đang bảo dưỡng</div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-icon">🔧</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-label">Xe chờ nhận trả</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-icon">⏳</div>
          </div>

          <div className="stat-card yellow">
            <div className="stat-label">Thanh toán hoàn thành hôm nay</div>
            <div className="stat-value">{stats.completedToday}</div>
            <div className="stat-icon">✅</div>
          </div>

          {/* Card Tổng doanh thu với date picker */}
          <div className="stat-card blue revenue-card">
            <div className="stat-label">Tổng doanh thu</div>
            <div className="stat-value">
              {revenueLoading ? '...' : formatCurrency(totalRevenue)}
            </div>
            <div className="stat-icon">💰</div>
            
            <div className="revenue-filters">
              <div className="filter-group">
                <label htmlFor="revenue-type">Loại:</label>
                <select 
                  id="revenue-type"
                  value={revenueType} 
                  onChange={handleRevenueTypeChange}
                  className="revenue-type-select"
                >
                  <option value="day">Ngày</option>
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="revenue-date">Chọn:</label>
                <input
                  id="revenue-date"
                  type="date"
                  value={revenueDate}
                  onChange={handleRevenueDateChange}
                  className="revenue-date-input"
                />
              </div>
              
              <div className="revenue-period-display">
                {getRevenuePeriodLabel()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;