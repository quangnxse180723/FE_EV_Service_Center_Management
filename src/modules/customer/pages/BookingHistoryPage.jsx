import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingHistoryPage.css';
import logoImage from '/src/assets/img/logo.png';
import scheduleApi from '../../../api/scheduleApi';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  
  // Lấy customerId từ localStorage
  const customerId = localStorage.getItem('customerId');
  
  // Lấy user info từ localStorage
  const [userInfo] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return { name: 'Khách hàng', id: customerId };
      }
    }
    return { name: 'Khách hàng', id: customerId };
  });

  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);

  // Fetch booking history khi component mount
  useEffect(() => {
    fetchBookingHistory();
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
      
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }

      console.log('🔍 Fetching booking history for customerId:', customerId);
      const response = await scheduleApi.getByCustomer(customerId);
      const bookings = Array.isArray(response) ? response : response?.data || [];
      
      console.log('✅ Booking history loaded from database:', bookings);
      
      // Transform dữ liệu từ BE sang format FE
      const transformedData = bookings.map(item => ({
        id: item.scheduleId || item.id,
        vehicle: item.vehicleModel || item.vehicleName || 'N/A',
        licensePlate: item.vehicleLicensePlate || item.vehiclePlate || 'N/A',
        service: item.serviceName || item.services?.join('\n') || 'Dịch vụ',
        center: item.centerName || 'N/A',
        date: item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('vi-VN') : 'N/A',
        time: item.scheduledDate ? new Date(item.scheduledDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        status: item.status || 'PENDING',
        rawData: item // Giữ lại data gốc để dùng sau
      }));
      
      setBookingHistory(transformedData);
    } catch (err) {
      console.error('❌ Error fetching booking history:', err);
      setError(err.message || 'Không thể tải lịch sử đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
      case 'CHỜ XỬ LÝ':
        return 'status-pending';
      case 'COMPLETED':
      case 'HOÀN THÀNH':
        return 'status-completed';
      case 'CANCELLED':
      case 'ĐÃ HỦY':
      case 'CANCELED':
        return 'status-cancelled';
      case 'CONFIRMED':
      case 'ĐÃ XÁC NHẬN':
        return 'status-confirmed';
      case 'IN_PROGRESS':
      case 'ĐANG THỰC HIỆN':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    const statusUpper = (status || '').toUpperCase();
    const statusMap = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy'
    };
    return statusMap[statusUpper] || status || 'Chờ xử lý';
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
                          {getStatusText(booking.status)}
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