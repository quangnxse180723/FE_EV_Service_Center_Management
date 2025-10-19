import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingHistoryPage.css';
import logoImage from '/src/assets/img/logo.png';
import authApi from '../../../api/authApi';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  
  // Giả lập user đã đăng nhập
  const [userInfo] = useState({
    name: 'Khách Hàng 1',
    id: 'id001',
    avatar: '/src/assets/img/avtAdmin.jpg'
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Giả lập dữ liệu lịch sử đặt lịch
  const [bookingHistory] = useState([
    {
      id: 'B01',
      vehicle: 'VinFast Feliz S',
      licensePlate: '29A-123.45',
      service: 'Bảo dưỡng định kỳ\nKiểm tra tổng quát',
      center: 'Voltfix Quận 1',
      date: '26/9/2025',
      time: '08:00',
      status: 'Chờ xử lý'
    },
    {
      id: 'B02',
      vehicle: 'Yadea Ulike',
      licensePlate: '30B-456.78',
      service: 'Thay thế pin\nKiểm tra hệ thống điện',
      center: 'Voltfix Quận 2',
      date: '20/9/2025',
      time: '14:30',
      status: 'Hoàn thành'
    },
    {
      id: 'B03',
      vehicle: 'VinFast Klara S',
      licensePlate: '51C-789.01',
      service: 'Sửa chữa phanh\nKiểm tra an toàn',
      center: 'Voltfix Quận 3',
      date: '15/9/2025',
      time: '10:00',
      status: 'Đã hủy'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'status-pending';
      case 'Hoàn thành':
        return 'status-completed';
      case 'Đã hủy':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await authApi.logout();
      navigate('/login');
    }
  };

  return (
    <div className="booking-history-page">
      <header className="hf-header">
        <div className="hf-header-inner">
          <div className="hf-logo"> 
            <img src={logoImage} alt="VOLTFIX Logo" className="logo-image" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          </div>

          <nav className="hf-nav">
            <a className="nav-item" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Trang chủ</a>
            <a className="nav-item" onClick={() => navigate('/booking')} style={{ cursor: 'pointer' }}>Đặt lịch</a>
            <a className="nav-item" style={{ cursor: 'pointer' }}>Bảng giá</a>
            <a className="nav-item active" style={{ cursor: 'pointer' }}>Lịch sử</a>
          </nav>

          <div className="hf-actions">
            <div className="icon-circle bell" title="Thông báo" />
            <div style={{ position: 'relative' }}>
              <div 
                className="icon-circle avatar" 
                title="Tài khoản"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ cursor: 'pointer' }}
              />
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  minWidth: '150px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{userInfo.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{userInfo.id}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: 'none',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="booking-history-main">
        <div className="booking-history-container">
          <h1 className="page-title">Lịch sử đặt lịch</h1>
          
          {/* User Info */}
          <div className="user-info-section">
            <div className="user-avatar">
              <img src={userInfo.avatar} alt="User Avatar" />
            </div>
            <div className="user-details">
              <h2>{userInfo.name}</h2>
              <span className="user-id">{userInfo.id}</span>
            </div>
          </div>

          {/* Booking History Table */}
          <div className="booking-table-container">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Xe</th>
                  <th>Biển số</th>
                  <th>Loại dịch vụ</th>
                  <th>Trung tâm đặt lịch</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistory.map((booking) => (
                  <tr key={booking.id}>
                    <td className="booking-id">{booking.id}</td>
                    <td>{booking.vehicle}</td>
                    <td className="license-plate">{booking.licensePlate}</td>
                    <td className="service-info">
                      {booking.service.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </td>
                    <td>{booking.center}</td>
                    <td>
                      <div className="datetime">
                        <div className="date">{booking.date}</div>
                        <div className="time">{booking.time}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate('/booking')}>
              📅 Đặt lịch mới
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              🏠 Về trang chủ
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}