import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingHistoryPage.css';
import logoImage from '/src/assets/img/logo.png';
import scheduleApi from '../../../api/scheduleApi';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  
  // Giả lập user đã đăng nhập
  const [userInfo] = useState({
    name: 'Nguyễn Văn A',
    id: 1,
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    avatar: '/src/assets/img/avtAdmin.jpg'
  });

  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false); // Đổi thành false để không tự động load
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);

  // Fetch booking history khi component mount
  useEffect(() => {
    // Comment out auto-fetch để tránh lỗi khi backend chưa sẵn sàng
    // fetchBookingHistory();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleApi.getByCustomer(userInfo.id);
      console.log('Booking history response:', response);
      
      // Transform dữ liệu từ BE sang format FE
      const transformedData = response.map(item => ({
        id: item.id || item.scheduleId,
        vehicle: item.vehicleName || 'N/A',
        licensePlate: item.vehiclePlate || 'N/A',
        service: item.serviceName || item.services?.join('\n') || 'N/A',
        center: item.centerName || 'N/A',
        date: item.scheduledDate || 'N/A',
        time: item.scheduledTime || 'N/A',
        status: item.status || 'Chờ xử lý'
      }));
      
      setBookingHistory(transformedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError(err.message || 'Không thể tải lịch sử đặt lịch');
      setLoading(false);
      
      // Fallback to mock data for development/demo
      setBookingHistory([
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
    }
  };

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
            <div className="user-menu-container">
              <div 
                className="icon-circle avatar" 
                title="Tài khoản" 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              />
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar-small">
                      <img src={userInfo.avatar} alt="Avatar" />
                    </div>
                    <div className="user-info-dropdown">
                      <div className="user-name">{userInfo.name}</div>
                      <div className="user-id-small">KH00{userInfo.id}</div>
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-menu">
                    <a className="user-dropdown-item" onClick={() => { setIsCustomerInfoModalOpen(true); setIsUserMenuOpen(false); }}>
                      <span className="dropdown-icon">👤</span>
                      Thông tin khách hàng
                    </a>
                    <a className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                      <span className="dropdown-icon">🔧</span>
                      Kiểm tra định kỳ
                    </a>
                    <a className="user-dropdown-item" onClick={() => { navigate('/my-vehicles'); setIsUserMenuOpen(false); }}>
                      <span className="dropdown-icon">🚗</span>
                      Quản lý xe
                    </a>
                    <a className="user-dropdown-item" onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/payment-history');
                    }}>
                      <span className="dropdown-icon">💳</span>
                      Lịch sử thanh toán
                    </a>
                    <div className="user-dropdown-divider"></div>
                    <a className="user-dropdown-item logout" onClick={() => setIsUserMenuOpen(false)}>
                      <span className="dropdown-icon">🚪</span>
                      Đăng xuất
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div 
              className="icon-circle menu mobile-menu-toggle" 
              title="Menu" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="mobile-menu-content">
              <a className="mobile-nav-item" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
                🏠 Trang chủ
              </a>
              <a className="mobile-nav-item" onClick={() => { navigate('/booking'); setIsMobileMenuOpen(false); }}>
                📅 Đặt lịch
              </a>
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                💰 Bảng giá
              </a>
              <a className="mobile-nav-item active">
                📋 Lịch sử
              </a>
              <div className="mobile-menu-divider" />
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                🔔 Thông báo
              </a>
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                👤 Tài khoản
              </a>
            </div>
          </div>
        )}
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
              <span className="user-id">KH00{userInfo.id}</span>
            </div>
          </div>

          {/* Booking History Table */}
          <div className="booking-table-container">
            {loading ? (
              <div className="loading-state">
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p className="error-message">⚠️ {error}</p>
                <button className="btn-retry" onClick={fetchBookingHistory}>
                  Thử lại
                </button>
              </div>
            ) : bookingHistory.length === 0 ? (
              <div className="empty-state">
                <p>Bạn chưa có lịch đặt nào</p>
                <button className="btn-load-data" onClick={fetchBookingHistory}>
                  📥 Tải dữ liệu từ server
                </button>
                <button className="btn-book-now" onClick={() => navigate('/booking')}>
                  Đặt lịch ngay
                </button>
              </div>
            ) : (
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
            )}
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

      {/* Customer Info Modal */}
      {isCustomerInfoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCustomerInfoModalOpen(false)}>
          <div className="modal-content customer-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin khách hàng</h2>
              <button className="modal-close-btn" onClick={() => setIsCustomerInfoModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="customer-info-grid">
                <div className="customer-avatar-section">
                  <div className="customer-avatar-large">
                    <img src={userInfo.avatar} alt="Customer Avatar" />
                  </div>
                  <div className="customer-status">
                    <span className="status-badge status-active">Hoạt động</span>
                  </div>
                </div>
                
                <div className="customer-details-section">
                  <div className="info-group">
                    <label>Họ và tên:</label>
                    <span>{userInfo.name}</span>
                  </div>
                  <div className="info-group">
                    <label>Mã khách hàng:</label>
                    <span>KH00{userInfo.id}</span>
                  </div>
                  <div className="info-group">
                    <label>Số điện thoại:</label>
                    <span>{userInfo.phone}</span>
                  </div>
                  <div className="info-group">
                    <label>Email:</label>
                    <span>{userInfo.email}</span>
                  </div>
                  <div className="info-group">
                    <label>Địa chỉ:</label>
                    <span>123 Đường ABC, Quận 1, TP.HCM</span>
                  </div>
                  <div className="info-group">
                    <label>Ngày đăng ký:</label>
                    <span>15/08/2024</span>
                  </div>
                  <div className="info-group">
                    <label>Loại tài khoản:</label>
                    <span>Khách hàng VIP</span>
                  </div>
                </div>
              </div>
              
              <div className="customer-stats">
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Lần bảo dưỡng</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Xe đang sở hữu</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15.5M</div>
                  <div className="stat-label">Tổng chi tiêu</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4.8★</div>
                  <div className="stat-label">Đánh giá TB</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCustomerInfoModalOpen(false)}>
                Đóng
              </button>
              <button className="btn-primary">
                Chỉnh sửa thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}