import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingPage.css';
import XE01 from '/src/assets/img/XE01.png';
import XE02 from '/src/assets/img/XE02.png';
import mapImage from '/src/assets/img/map.png';
import lichImage from '/src/assets/img/lich.png';
import logoImage from '/src/assets/img/logo.png';

export default function BookingPage() {
  const navigate = useNavigate();
  
  // Giả lập user đã đăng nhập
  const [isLoggedIn] = useState(true);
  const [userInfo] = useState({
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@example.com'
  });

  // State cho dropdown
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    if (!showAuthDropdown) return;
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowAuthDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuthDropdown]);

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

  const handleSubmit = () => {
    const bookingData = {
      customer: userInfo,
      vehicle: selectedVehicle,
      center: selectedCenter,
      timeSlot: selectedTimeSlot,
      note: customerNote
    };
    console.log('Booking data:', bookingData);
    alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
    navigate('/');
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('accountId');
    localStorage.removeItem('token');
    setShowAuthDropdown(false);
    navigate('/', { replace: true });
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
            <a className="nav-item" style={{ cursor: 'pointer' }}>Lịch sử</a>
          </nav>

          <div className="hf-actions" style={{ position: 'relative' }}>
            <div className="icon-circle bell" title="Thông báo" />
            {isLoggedIn ? (
              <div 
                className="icon-circle avatar logged-in" 
                title={userInfo.name}
                ref={avatarRef}
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                style={{ cursor: 'pointer' }}
              >
                <span className="avatar-badge">C</span>
              </div>
            ) : (
              <div className="icon-circle avatar" title="Đăng nhập" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} />
            )}
            <div className="icon-circle menu" title="Menu" />

            {/* Dropdown */}
            {showAuthDropdown && isLoggedIn && (
              <div
                className="auth-dropdown-root"
                ref={dropdownRef}
                style={{ position: 'absolute', top: 56, right: 0, zIndex: 1000 }}
              >
                <div className="auth-dropdown-menu">
                  <div className="auth-dropdown-item user-info">
                    <strong>{userInfo.name}</strong>
                    <small>{userInfo.email}</small>
                    <span className="role-badge">CUSTOMER</span>
                  </div>
                  <hr style={{ margin: '8px 0', border: '1px solid #eee' }} />
                  <a href="/booking" className="auth-dropdown-item">
                    📅 Đặt lịch
                  </a>
                  <a href="/my-vehicles" className="auth-dropdown-item">
                    🚗 Xe của tôi
                  </a>
                  <a href="/history" className="auth-dropdown-item">
                    📋 Lịch sử
                  </a>
                  <hr style={{ margin: '8px 0', border: '1px solid #eee' }} />
                  <a 
                    className="auth-dropdown-item logout" 
                    onClick={handleLogout}
                    style={{ cursor: 'pointer', color: '#dc3545' }}
                  >
                    🚪 Đăng xuất
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}
