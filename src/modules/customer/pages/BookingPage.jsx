import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './BookingPage.css';
import mapImage from '/src/assets/img/map.png';
import lichImage from '/src/assets/img/lich.png';
import logoImage from '/src/assets/img/logo.png';
import defaultAvatar from '/src/assets/img/user-avatar.jpg';
import scheduleApi from '../../../api/scheduleApi';
import vehicleApi from '../../../api/vehicleApi';
import serviceApi from '../../../api/serviceApi';
import centerApi from '../../../api/centerApi';
import customerApi from '../../../api/customerApi';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  
  // State cho customer data từ database
  const [customerData, setCustomerData] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  
  // User info - sẽ cập nhật từ customerData
  const userInfo = customerData ? {
    id: customerData.customerId,
    name: customerData.fullName || 'Khách hàng',
    phone: customerData.phone || 'Chưa cập nhật',
    email: customerData.email || 'Chưa cập nhật',
    avatar: defaultAvatar // Sử dụng avatar mặc định
  } : {
    name: user?.fullName || 'Khách hàng',
    phone: user?.phone || 'Chưa cập nhật',
    email: user?.email || 'Chưa cập nhật',
    avatar: defaultAvatar // Sử dụng avatar mặc định
  };

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

  // State cho data từ API
  const [userVehicles, setUserVehicles] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data từ API khi component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Lấy customerId từ localStorage
        const customerId = localStorage.getItem('customerId');
        
        if (!customerId || customerId === 'null' || customerId === 'undefined') {
          throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
        }

        // Fetch tất cả data song song
        const [vehiclesRes, centersRes, servicesRes, customerRes] = await Promise.all([
          vehicleApi.getCustomerVehicles(customerId).catch(err => {
            console.error('Error fetching customer vehicles:', err);
            throw err;
          }),
          centerApi.getAllCenters().catch(err => {
            console.error('Error fetching centers:', err);
            return [];
          }),
          serviceApi.getAllServices().catch(err => {
            console.error('Error fetching services:', err);
            return [];
          }),
          customerApi.getCustomerById(customerId).catch(err => {
            console.error('Error fetching customer data:', err);
            return null;
          })
        ]);

        // Set data (backend trả về trực tiếp array hoặc object với data field)
        const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : vehiclesRes?.data || [];
        const centers = Array.isArray(centersRes) ? centersRes : centersRes?.data || [];
        const services = Array.isArray(servicesRes) ? servicesRes : servicesRes?.data || [];
        
        setUserVehicles(vehicles);
        setServiceCenters(centers);
        setServices(services);
        setCustomerData(customerRes); // Set customer data

        console.log('✅ Data loaded:', {
          customerId,
          vehicles: vehicles,
          vehicleCount: vehicles.length,
          centers: centers,
          centerCount: centers.length,
          services: services,
          serviceCount: services.length,
          customer: customerRes
        });
      } catch (err) {
        console.error('❌ Error fetching initial data:', err);
        setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleUpdatePhone = async () => {
    try {
      // Validate phone number
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(editPhone)) {
        alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng!');
        return;
      }

      setLoading(true);
      const customerId = localStorage.getItem('customerId');
      
      const updateData = {
        ...customerData,
        phone: editPhone.trim()
      };
      
      console.log('📤 Updating customer phone:', editPhone);
      const response = await customerApi.updateCustomer(customerId, updateData);
      
      console.log('✅ Phone updated successfully:', response);
      setCustomerData(response);
      setIsEditingPhone(false);
      alert('✅ Cập nhật số điện thoại thành công!');
      
    } catch (err) {
      console.error('❌ Error updating phone:', err);
      alert('Không thể cập nhật số điện thoại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
  };

  // Fetch time slots khi thay đổi ngày hoặc trung tâm
  const fetchTimeSlots = async () => {
    if (!selectedCenter || !bookingDate) {
      console.log('⏭️ Skipping time slots fetch - missing center or date');
      setTimeSlots({ morning: [], afternoon: [] });
      return;
    }

    // Clear selected time slot khi thay đổi ngày hoặc trung tâm
    setSelectedTimeSlot(null);
    setLoadingSlots(true);
    setError(null);

    try {
      console.log('🔍 Fetching time slots for:', {
        centerId: selectedCenter.centerId,
        date: bookingDate
      });

      const response = await scheduleApi.getAvailableTimeSlots(
        selectedCenter.centerId,
        bookingDate
      );

      console.log('✅ Time slots response:', response);

      // Transform API response to match UI format
      const slots = response.data || response;
      
      // Check if slots is an array
      if (!Array.isArray(slots)) {
        console.error('❌ Invalid response format:', slots);
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }

      // Separate morning (8:00-11:30) and afternoon (12:00-17:00) slots
      const morning = [];
      const afternoon = [];

      slots.forEach((slot) => {
        const hour = parseInt(slot.time.split(':')[0]);
        
        // Determine status based on available count
        let status = 'available';
        if (slot.available === 0) {
          status = 'full';
        } else if (slot.available <= 3) {
          status = 'few';
        }

        const formattedSlot = {
          id: slot.slotId || slot.id,
          time: slot.time,
          available: slot.available,
          total: slot.total || 12,
          status: status
        };

        if (hour < 12) {
          morning.push(formattedSlot);
        } else {
          afternoon.push(formattedSlot);
        }
      });

      setTimeSlots({ morning, afternoon });
      console.log('✅ Time slots loaded:', { 
        morning: morning.length, 
        afternoon: afternoon.length,
        total: slots.length 
      });

    } catch (err) {
      console.error('❌ Error fetching time slots:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách thời gian';
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
      
      // Use empty arrays on error
      setTimeSlots({ morning: [], afternoon: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch time slots when center or date changes
  useEffect(() => {
    if (currentStep === 3) {
      fetchTimeSlots();
    }
  }, [selectedCenter, bookingDate, currentStep]);

  // Set default date to today when entering Step 3
  useEffect(() => {
    if (currentStep === 3 && !bookingDate) {
      const today = new Date().toISOString().split('T')[0];
      setBookingDate(today);
    }
  }, [currentStep]);

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
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        alert('Vui lòng đăng nhập để đặt lịch!');
        navigate('/login');
        return;
      }

      // Get customerId from localStorage
      const customerId = localStorage.getItem('customerId');
      
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        alert('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Get IDs với fallback
      const vehicleId = selectedVehicle?.vehicleId || selectedVehicle?.id;
      const centerId = selectedCenter?.centerId || selectedCenter?.id;

      console.log('🔍 DEBUG - Extracted IDs:', {
        vehicleId,
        centerId,
        selectedTimeSlot: selectedTimeSlot
      });

      // Validation - CHỈ CẦN vehicle, center và time slot (không cần slotId)
      if (!vehicleId || !centerId || !selectedTimeSlot) {
        const missingFields = [];
        if (!vehicleId) missingFields.push('Vehicle');
        if (!centerId) missingFields.push('Center');
        if (!selectedTimeSlot) missingFields.push('Time Slot');
        
        alert(`Vui lòng chọn đầy đủ thông tin!\nThiếu: ${missingFields.join(', ')}`);
        console.error('❌ Missing data:', { 
          vehicleId, 
          centerId, 
          selectedTimeSlot,
          selectedVehicle,
          selectedCenter
        });
        return;
      }

      // Lấy ngày hiện tại nếu bookingDate rỗng
      const dateToUse = bookingDate || new Date().toISOString().split('T')[0];
      
      // Format time to HH:mm:ss (ensure proper format)
      let timeFormatted = selectedTimeSlot.time;
      // Ensure time is in HH:mm format
      if (timeFormatted.length === 4) {
        // "9:00" -> "09:00"
        timeFormatted = '0' + timeFormatted;
      }
      
      // Create full ISO datetime string (without timezone)
      const scheduledDateTime = `${dateToUse}T${timeFormatted}:00`;
      
      // Chuẩn bị dữ liệu theo format BookScheduleRequest của Backend
      // KHÔNG GỬI slotId - Backend sẽ tự tạo TimeSlot
      const bookingData = {
        customerId: parseInt(customerId),
        vehicleId: parseInt(vehicleId),
        centerId: parseInt(centerId),
        scheduledDate: dateToUse, // Date: YYYY-MM-DD
        scheduledTime: timeFormatted, // Time: HH:mm
        serviceId: selectedService?.serviceId || null,
        notes: customerNote || ''
      };

      console.log('═══════════════════════════════════════');
      console.log('📤 SENDING BOOKING DATA');
      console.log('═══════════════════════════════════════');
      console.log(JSON.stringify(bookingData, null, 2));
      console.log('═══════════════════════════════════════');
      console.log('📅 VALIDATION CHECK:', {
        'customerId (number)': typeof bookingData.customerId === 'number' ? `✅ ${bookingData.customerId}` : `❌ ${bookingData.customerId}`,
        'vehicleId (number)': typeof bookingData.vehicleId === 'number' ? `✅ ${bookingData.vehicleId}` : `❌ ${bookingData.vehicleId}`,
        'centerId (number)': typeof bookingData.centerId === 'number' ? `✅ ${bookingData.centerId}` : `❌ ${bookingData.centerId}`,
        'scheduledDate': bookingData.scheduledDate,
        'scheduledTime': bookingData.scheduledTime
      });
      console.log('═══════════════════════════════════════');

      // Gọi API (Backend sẽ tự tạo TimeSlot)
      const response = await scheduleApi.bookSchedule(bookingData);
      
      console.log('✅ Booking response:', response);
      
      // Hiển thị thông báo thành công
      alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      
      // Chuyển hướng đến trang lịch sử đặt lịch
      navigate('/booking-history');
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error:', JSON.stringify(error.response, null, 2));
      
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Đặt lịch thất bại. Vui lòng thử lại!';
      
      if (error.response?.data) {
        const data = error.response.data;
        // Backend có thể trả về nhiều format khác nhau
        errorMessage = data.message || data.error || data.errors?.[0]?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
                        <img src={userInfo.avatar || defaultAvatar} alt="User Avatar" />
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p>Đang tải danh sách xe...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#f44336' }}>
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
                    Thử lại
                  </button>
                </div>
              ) : userVehicles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p>Bạn chưa có xe nào. Vui lòng thêm xe để đặt lịch.</p>
                  <button onClick={() => navigate('/my-vehicles')} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
                    Thêm xe
                  </button>
                </div>
              ) : (
                <div className="vehicle-grid">
                  {userVehicles.map((vehicle) => (
                    <div 
                      key={vehicle.vehicleId || vehicle.id}
                      className={`vehicle-card ${selectedVehicle?.vehicleId === vehicle.vehicleId || selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div className="vehicle-header">Xe máy điện</div>
                      <div className="vehicle-image">
                        <img 
                          src={vehicle.imageUrl || 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=EV+Vehicle'} 
                          alt={vehicle.model || 'Xe điện'}
                          onError={(e) => { 
                            e.target.src = 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=EV+Vehicle';
                          }}
                        />
                      </div>
                      <div className="vehicle-info">
                        <div className="vehicle-name">
                          {vehicle.model || 'Xe điện'}
                        </div>
                        <div className="vehicle-plate">
                          Biển số: {vehicle.licensePlate || 'N/A'}
                        </div>
                        <div className="vehicle-vin">
                          Số VIN: {vehicle.vin || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <button className="btn-select-vehicle">Chọn</button>
                    </div>
                  ))}
                </div>
              )}
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
                    <img 
                      src={selectedVehicle.imageUrl || 'https://via.placeholder.com/100x75/4CAF50/ffffff?text=EV'} 
                      alt={selectedVehicle.model} 
                      className="vehicle-thumb" 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x75/4CAF50/ffffff?text=EV';
                      }}
                    />
                    <div className="vehicle-details">
                      <div className="vehicle-name">{selectedVehicle.model}</div>
                      <div className="vehicle-license">{selectedVehicle.licensePlate}</div>
                      <div className="vehicle-specs">
                        {selectedVehicle.vin ? `VIN: ${selectedVehicle.vin}` : 'Xe điện'}
                        {selectedVehicle.currentMileage ? ` • ${selectedVehicle.currentMileage.toLocaleString()} km` : ''}
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
                    {loading ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
                    ) : serviceCenters.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <p>Không tìm thấy trung tâm dịch vụ</p>
                        <small>Vui lòng liên hệ admin để được hỗ trợ</small>
                      </div>
                    ) : (
                      serviceCenters
                        .filter(center => {
                          if (!searchCenter) return true;
                          const searchLower = searchCenter.toLowerCase();
                          const name = (center.name || center.centerName || '').toLowerCase();
                          const address = (center.address || '').toLowerCase();
                          return name.includes(searchLower) || address.includes(searchLower);
                        })
                        .map((center, index) => {
                          const centerId = center.centerId || center.id || index;
                          return (
                            <div 
                              key={centerId}
                              className={`center-item ${(selectedCenter?.centerId === center.centerId || selectedCenter?.id === center.id) ? 'selected' : ''}`}
                            >
                              <div className="center-info">
                                <div className="center-name">
                                  {center.name || center.centerName || 'Trung tâm dịch vụ'}
                                </div>
                                <div className="center-distance">
                                  {center.address || center.location || 'Địa chỉ chưa cập nhật'}
                                </div>
                              </div>
                              <button 
                                className="btn-select-center"
                                onClick={() => handleCenterSelect(center)}
                              >
                                Chọn
                              </button>
                            </div>
                          );
                        })
                    )}
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
                      <span>{selectedCenter?.name || 'Voltfix Quận 1'}</span>
                      <span> - </span>
                      <span>{selectedCenter?.distance || '1.2 km'}</span>
                    </div>
                  </div>
                  <img src={lichImage} alt="Calendar" className="calendar-image" />
                </div>
                <div className="timeslots-section">
                  {/* Date Picker */}
                  <div className="date-picker-section" style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px'}}>
                    <label htmlFor="booking-date" style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333'}}>
                      Chọn ngày đặt lịch:
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      <p>Đang tải danh sách thời gian...</p>
                    </div>
                  ) : !bookingDate ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                      <p>Vui lòng chọn ngày để xem các khung giờ có sẵn</p>
                    </div>
                  ) : timeSlots.morning.length === 0 && timeSlots.afternoon.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
                      <p>Không có khung giờ nào khả dụng cho ngày này</p>
                    </div>
                  ) : (
                    <div className="timeslots-container">
                      {timeSlots.morning.length > 0 && (
                        <div className="timeslot-period">
                          <h4>Sáng</h4>
                          <div className="timeslot-grid">
                            {timeSlots.morning.map((slot) => (
                              <button
                                key={slot.id}
                                className={`timeslot-btn ${slot.status} ${selectedTimeSlot?.id === slot.id ? 'selected' : ''}`}
                                onClick={() => slot.status !== 'full' && setSelectedTimeSlot(slot)}
                                disabled={slot.status === 'full'}
                              >
                                {slot.time}<br />
                                <span className="slot-available">({slot.total - slot.available}/{slot.total})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {timeSlots.afternoon.length > 0 && (
                        <div className="timeslot-period">
                          <h4>Chiều</h4>
                          <div className="timeslot-grid">
                            {timeSlots.afternoon.map((slot) => (
                              <button
                                key={slot.id}
                                className={`timeslot-btn ${slot.status} ${selectedTimeSlot?.id === slot.id ? 'selected' : ''}`}
                                onClick={() => slot.status !== 'full' && setSelectedTimeSlot(slot)}
                                disabled={slot.status === 'full'}
                              >
                                {slot.time}<br />
                                <span className="slot-available">({slot.total - slot.available}/{slot.total})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Xác nhận */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="booking-summary">
                <div className="summary-header">
                  <h3>Thông tin đặt lịch</h3>
                  <button 
                    className="edit-profile-btn"
                    onClick={() => navigate('/customer-profile')}
                    type="button"
                  >
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </div>

                <div className="customer-info-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="summary-item">
                    <span>Mã khách hàng:</span>
                    <strong>KH{String(customerData?.customerId || '').padStart(3, '0')}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Họ và tên:</span>
                    <strong>{userInfo.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Số điện thoại:</span>
                    <strong>{userInfo.phone}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Email:</span>
                    <strong>{userInfo.email}</strong>
                  </div>
                  {customerData?.address && (
                    <div className="summary-item">
                      <span>Địa chỉ:</span>
                      <strong>{customerData.address}</strong>
                    </div>
                  )}
                </div>

                <div className="booking-info-section">
                  <h4>Chi tiết đặt lịch</h4>
                  <div className="summary-item">
                    <span>Xe:</span>
                    <strong>
                      <span>{selectedVehicle?.model || 'N/A'}</span>
                      <span> - </span>
                      <span>{selectedVehicle?.licensePlate || 'N/A'}</span>
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>Trung tâm:</span>
                    <strong>{selectedCenter?.name || selectedCenter?.centerName || 'N/A'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Ngày:</span>
                    <strong>{new Date(bookingDate || new Date().toISOString().split('T')[0]).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Giờ:</span>
                    <strong>{selectedTimeSlot?.time}</strong>
                  </div>
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
