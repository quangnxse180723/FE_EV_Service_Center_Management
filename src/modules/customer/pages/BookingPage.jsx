import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookingPage.css';
import XE01 from '/src/assets/img/XE01.png';
import XE02 from '/src/assets/img/XE02.png';
import mapImage from '/src/assets/img/map.png';
import lichImage from '/src/assets/img/lich.png';
import logoImage from '/src/assets/img/logo.png';
import avtAdmin from '/src/assets/img/avtAdmin.jpg';
import scheduleApi from '../../../api/scheduleApi';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Giả lập user đã đăng nhập
  const [isLoggedIn] = useState(true); // Đặt lại thành true để hiển thị menu user
  const [userInfo] = useState({
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    avatar: avtAdmin
  });

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // State cho các bước
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [searchCenter, setSearchCenter] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Danh sách slot thời gian với trạng thái
  const morningSlots = [
    { time: '8:00', available: 0, total: 12, status: 'full' },
    { time: '8:30', available: 8, total: 12, status: 'available' },
    { time: '9:00', available: 9, total: 12, status: 'available' },
    { time: '9:30', available: 9, total: 12, status: 'available' },
    { time: '10:00', available: 0, total: 12, status: 'full' },
    { time: '10:30', available: 8, total: 12, status: 'available' },
    { time: '11:00', available: 9, total: 12, status: 'available' },
    { time: '11:30', available: 9, total: 12, status: 'available' }
  ];

  const afternoonSlots = [
    { time: '12:00', available: 0, total: 12, status: 'full' },
    { time: '12:30', available: 9, total: 12, status: 'available' },
    { time: '13:00', available: 10, total: 12, status: 'few' },
    { time: '13:30', available: 10, total: 12, status: 'few' },
    { time: '14:00', available: 0, total: 12, status: 'full' },
    { time: '14:30', available: 9, total: 12, status: 'available' },
    { time: '15:00', available: 10, total: 12, status: 'few' },
    { time: '15:30', available: 10, total: 12, status: 'few' },
    { time: '16:00', available: 0, total: 12, status: 'full' },
    { time: '16:30', available: 9, total: 12, status: 'available' },
    { time: '17:00', available: 10, total: 12, status: 'few' }
  ];

  // Danh sách xe của người dùng (giả lập)
  const userVehicles = [
    {
      id: 1,
      name: 'VinFast Feliz S',
      plate: '29A-123.45',
      image: XE01
    },
    {
      id: 2,
      name: 'Yadea Ulike',
      plate: '30B-456.78',
      image: XE02
    }
  ];

  // Danh sách trung tâm dịch vụ
  const serviceCenters = [
    { id: 1, name: 'Voltfix Quận 1', distance: '1.2 km' },
    { id: 2, name: 'Voltfix Cầu giấy', distance: '3.5 km' },
    { id: 3, name: 'Voltfix Quận 9', distance: '7.5 km' },
    { id: 4, name: 'Voltfix Thủ Đức', distance: '8.5 km' }
  ];

  const services = [
    { id: 1, name: 'Bảo dưỡng định kỳ', price: '300.000đ' },
    { id: 2, name: 'Kiểm tra/Thay pin', price: '500.000đ' },
    { id: 3, name: 'Kiểm tra phanh', price: '200.000đ' },
    { id: 4, name: 'Thay lốp', price: '400.000đ' }
  ];

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  // Handle navigation state from MyVehiclesPage
  useEffect(() => {
    if (location.state) {
      const { selectedVehicle: vehicleFromState, skipToStep } = location.state;
      
      if (vehicleFromState) {
        setSelectedVehicle(vehicleFromState);
      }
      
      if (skipToStep) {
        setCurrentStep(skipToStep);
      }
      
      // Clear the state to prevent issues on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async () => {
    try {
      // Chuẩn bị dữ liệu theo format BookingRequest của Backend
      const bookingData = {
        customerId: userInfo.id || 1, // Lấy từ AuthContext hoặc localStorage
        vehicleId: selectedVehicle?.id,
        centerId: selectedCenter?.id,
        serviceIds: selectedService ? [selectedService.id] : [], // Có thể chọn nhiều dịch vụ
        scheduledDate: bookingDate || new Date().toISOString().split('T')[0],
        scheduledTime: selectedTimeSlot,
        notes: customerNote,
      };

      console.log('Sending booking data:', bookingData);

      // Gọi API
      const response = await scheduleApi.bookSchedule(bookingData);
      
      console.log('Booking response:', response);
      
      // Hiển thị thông báo thành công
      alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      
      // Chuyển hướng đến trang lịch sử đặt lịch
      navigate('/booking-history');
      
    } catch (error) {
      console.error('Booking error:', error);
      
      // Hiển thị thông báo lỗi
      const errorMessage = error.message || 'Đặt lịch thất bại. Vui lòng thử lại!';
      alert(errorMessage);
    }
  };

  return (
    <div className="booking-page">
      <header className="hf-header">
        <div className="hf-header-inner">
          <div className="hf-logo"> 
            <img src={logoImage} alt="VOLTFIX Logo" className="logo-image" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          </div>

          <nav className="hf-nav">
            <a className="nav-item" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Trang chủ</a>
            <a className="nav-item active">Đặt lịch</a>
            <a className="nav-item" style={{ cursor: 'pointer' }}>Bảng giá</a>
            <a className="nav-item" onClick={() => navigate('/booking-history')} style={{ cursor: 'pointer' }}>Lịch sử</a>
          </nav>

          <div className="hf-actions">
            <div 
              className="icon-circle bell" 
              title="Thông báo"
              onClick={() => setIsNotificationModalOpen(true)}
            >
              🔔
              <span className="notification-badge">3</span>
            </div>
            <div className="user-menu-container">
              <div 
                className="icon-circle avatar" 
                title={isLoggedIn ? userInfo.name : "Tài khoản"}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              />
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  {isLoggedIn ? (
                    <>
                    <div className="user-dropdown-header">
                      <div className="user-avatar-small">
                        {userInfo.avatar ? (
                          <img src={userInfo.avatar} alt="User Avatar" onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }} />
                        ) : null}
                        <div className="avatar-placeholder" style={{ display: userInfo.avatar ? 'none' : 'flex' }}>👤</div>
                      </div>
                      <div className="user-info-dropdown">
                        <div className="user-name">{userInfo.name}</div>
                        <div className="user-id-small">{userInfo.phone}</div>
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
                        <a className="user-dropdown-item" onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/my-vehicles');
                        }}>
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
                    </>
                  ) : (
                    <div className="auth-dropdown-menu">
                      <a className="auth-dropdown-item" onClick={() => { navigate('/login'); setIsUserMenuOpen(false); }}>
                        Đăng nhập
                      </a>
                      <a className="auth-dropdown-item" onClick={() => { navigate('/register'); setIsUserMenuOpen(false); }}>
                        Đăng ký
                      </a>
                    </div>
                  )}
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
              <a className="mobile-nav-item active">
                📅 Đặt lịch
              </a>
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                💰 Bảng giá
              </a>
              <a className="mobile-nav-item" onClick={() => { navigate('/booking-history'); setIsMobileMenuOpen(false); }}>
                📋 Lịch sử
              </a>
              <div className="mobile-menu-divider" />
              <a className="mobile-nav-item" onClick={() => {
                setIsMobileMenuOpen(false);
                setIsNotificationModalOpen(true);
              }}>
                🔔 Thông báo
              </a>
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                👤 Tài khoản
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="booking-main">
        <div className="booking-container">
          <h1 className="booking-title">Đặt lịch bảo dưỡng</h1>
          
          {/* Progress Bar */}
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
              <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
            </div>
            <div className="progress-label">Bước {currentStep}/4: {
              currentStep === 1 ? 'Chọn xe' :
              currentStep === 2 ? 'Chọn trung tâm dịch vụ' :
              currentStep === 3 ? 'Chọn thời gian' : 'Xác nhận'
            }</div>
          </div>

          {/* Step 1: Chọn xe */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="vehicle-grid">
                {userVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id}
                    className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                    onClick={() => handleVehicleSelect(vehicle)}
                  >
                    <div className="vehicle-header">Xe máy điện {vehicle.id}</div>
                    <div className="vehicle-image">
                      <img src={vehicle.image} alt={vehicle.name} />
                    </div>
                    <div className="vehicle-info">
                      <div className="vehicle-name">Thể xe {vehicle.id}: {vehicle.name}</div>
                      <div className="vehicle-plate">Biển số: {vehicle.plate}</div>
                      <div className="vehicle-vin">Số VIN: ...</div>
                    </div>
                    <button className="btn-select-vehicle">Chọn</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Chọn trung tâm dịch vụ */}
          {currentStep === 2 && (
            <div className="step-content">
              {/* Selected Vehicle Info */}
              {selectedVehicle && (
                <div className="selected-vehicle-info">
                  <h3>Xe đã chọn:</h3>
                  <div className="vehicle-summary">
                    <img src={selectedVehicle.image} alt={selectedVehicle.model} className="vehicle-thumb" />
                    <div className="vehicle-details">
                      <div className="vehicle-name">{selectedVehicle.model}</div>
                      <div className="vehicle-license">{selectedVehicle.licensePlate}</div>
                      <div className="vehicle-specs">
                        {selectedVehicle.year} • {selectedVehicle.color} • {selectedVehicle.batteryCapacity}
                      </div>
                    </div>
                    <button 
                      className="change-vehicle-btn"
                      onClick={() => setCurrentStep(1)}
                    >
                      Đổi xe
                    </button>
                  </div>
                </div>
              )}
              
              <div className="center-selection">
                <div className="map-container">
                  <img src={mapImage} alt="Map" className="map-image" />
                </div>
                <div className="center-list-container">
                  <div className="search-box">
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm trung tâm ..."
                      value={searchCenter}
                      onChange={(e) => setSearchCenter(e.target.value)}
                      className="search-input"
                    />
                    <button className="btn-search">Tìm</button>
                  </div>
                  <div className="center-list">
                    {serviceCenters.map((center) => (
                      <div 
                        key={center.id}
                        className={`center-item ${selectedCenter?.id === center.id ? 'selected' : ''}`}
                      >
                        <div className="center-info">
                          <div className="center-name">{center.name}</div>
                          <div className="center-distance">| {center.distance}</div>
                        </div>
                        <button 
                          className="btn-select-center"
                          onClick={() => handleCenterSelect(center)}
                        >
                          Chọn
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Chọn thời gian */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="time-selection">
                <div className="calendar-section">
                  <div className="selected-center-info">
                    <div className="center-name-display">
                      {selectedCenter?.name || 'Voltfix Quận 1'} | {selectedCenter?.distance || '1.2 km'}
                    </div>
                  </div>
                  <img src={lichImage} alt="Calendar" className="calendar-image" />
                </div>
                <div className="timeslots-section">
                  <div className="timeslots-container">
                    <div className="timeslot-period">
                      <h4>Sáng</h4>
                      <div className="timeslot-grid">
                        {morningSlots.map((slot, index) => (
                          <button
                            key={index}
                            className={`timeslot-btn ${slot.status} ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                            onClick={() => slot.status !== 'full' && setSelectedTimeSlot(slot.time)}
                            disabled={slot.status === 'full'}
                          >
                            {slot.time}<br />
                            <span className="slot-available">({slot.total - slot.available}/{slot.total})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="timeslot-period">
                      <h4>Chiều</h4>
                      <div className="timeslot-grid">
                        {afternoonSlots.map((slot, index) => (
                          <button
                            key={index}
                            className={`timeslot-btn ${slot.status} ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                            onClick={() => slot.status !== 'full' && setSelectedTimeSlot(slot.time)}
                            disabled={slot.status === 'full'}
                          >
                            {slot.time}<br />
                            <span className="slot-available">({slot.total - slot.available}/{slot.total})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Xác nhận */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="booking-summary">
                <h3>Thông tin đặt lịch</h3>
                <div className="summary-item">
                  <span>Khách hàng:</span>
                  <strong>{userInfo.name}</strong>
                </div>
                <div className="summary-item">
                  <span>Số điện thoại:</span>
                  <strong>{userInfo.phone}</strong>
                </div>
                <div className="summary-item">
                  <span>Xe:</span>
                  <strong>{selectedVehicle?.name} - {selectedVehicle?.plate}</strong>
                </div>
                <div className="summary-item">
                  <span>Trung tâm:</span>
                  <strong>{selectedCenter?.name}</strong>
                </div>
                <div className="summary-item">
                  <span>Thời gian:</span>
                  <strong>{selectedTimeSlot}</strong>
                </div>
              </div>
              
              <div className="customer-note-section">
                <h3>Ghi chú</h3>
                <textarea
                  className="note-textarea"
                  placeholder="Nhập ghi chú của bạn (nếu có)..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows="5"
                ></textarea>
                <div className="note-hint">
                  Vui lòng ghi rõ các yêu cầu đặc biệt hoặc vấn đề cần xử lý
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="step-actions">
            {currentStep > 1 && (
              <button className="btn-back" onClick={handlePrevStep}>
                Trở lại
              </button>
            )}
            {currentStep < 4 ? (
              <button 
                className="btn-next" 
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !selectedVehicle) ||
                  (currentStep === 2 && !selectedCenter) ||
                  (currentStep === 3 && !selectedTimeSlot)
                }
              >
                Tiếp tục
              </button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit}>
                Xác nhận đặt lịch
              </button>
            )}
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
                    <span>KH00{userInfo.id || 1}</span>
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

      {/* Notification Modal */}
      {isNotificationModalOpen && (
        <div className="notification-modal-overlay" onClick={() => setIsNotificationModalOpen(false)}>
          <div className="notification-modal" onClick={e => e.stopPropagation()}>
            <div className="notification-header">
              <h2>Thông báo bảo dưỡng</h2>
              <button onClick={() => setIsNotificationModalOpen(false)} className="close-btn">×</button>
            </div>
            
            <div className="notification-content">
              <div className="notification-item">
                <div className="notification-icon">⚠️</div>
                <div className="notification-body">
                  <h4>Quá hạn bảo dưỡng</h4>
                  <p>Xe Yadea Ulike (30B-456.78) đã quá hạn bảo dưỡng từ ngày 10/10/2024. Vui lòng đặt lịch ngay!</p>
                  <span className="notification-time">2 ngày trước</span>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notification-icon">🔧</div>
                <div className="notification-body">
                  <h4>Sắp đến hạn bảo dưỡng</h4>
                  <p>Xe VinFast Feliz S (29A-123.45) sắp đến hạn bảo dưỡng vào ngày 15/11/2024</p>
                  <span className="notification-time">1 ngày trước</span>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notification-icon">📅</div>
                <div className="notification-body">
                  <h4>Xác nhận lịch hẹn</h4>
                  <p>Lịch hẹn bảo dưỡng xe Yadea Ulike (30B-456.78) đã được xác nhận vào 20/10/2024 lúc 9:00</p>
                  <span className="notification-time">5 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
