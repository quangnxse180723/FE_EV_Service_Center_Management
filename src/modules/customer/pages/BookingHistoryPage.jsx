import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../hooks/useNotifications';
import './BookingHistoryPage.css';
import logoImage from '/src/assets/img/logo.png';
import defaultAvatar from '/src/assets/img/user-avatar.jpg'; // Ảnh của bạn
import scheduleApi from '../../../api/scheduleApi';
import centerApi from '../../../api/centerApi';
import customerApi from '../../../api/customerApi';
import NotificationModal from '../../../components/shared/NotificationModal';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  
  // Lấy customerId từ localStorage
  const customerId = localStorage.getItem('customerId');
  const { unreadCount } = useNotifications(customerId || 'guest');
  
  // User info state
  const [userInfo, setUserInfo] = useState({
    name: 'Đang tải...',
    id: customerId,
    avatar: defaultAvatar,
    phone: '',
    email: '',
    address: '',
    accountType: ''
  });

  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Chế độ chỉnh sửa
  const [editedUserInfo, setEditedUserInfo] = useState({}); // Data đang chỉnh sửa
  const [centersCache, setCentersCache] = useState(null); // Cache centers để tránh gọi API nhiều lần

  // Fetch booking history khi component mount
  useEffect(() => {
    fetchBookingHistory();
    fetchCustomerInfo();
  }, []);

  // Fetch customer info từ API
  const fetchCustomerInfo = async () => {
    if (!customerId) return;
    
    try {
      console.log('📥 Fetching customer info for ID:', customerId);
      const response = await customerApi.getCustomerById(customerId);
      console.log('✅ Customer info:', response);
      
      setUserInfo({
        name: response.name || response.fullName || 'Khách hàng',
        id: customerId,
        avatar: defaultAvatar,
        phone: response.phone || response.phoneNumber || '',
        email: response.email || '',
        address: response.address || '',
        accountType: response.accountType || 'VIP'
      });
    } catch (error) {
      console.error('❌ Error fetching customer info:', error);
      // Fallback về localStorage nếu API lỗi
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserInfo({
            name: user.name || user.fullName || 'Khách hàng',
            id: customerId,
            avatar: defaultAvatar,
            phone: user.phone || '',
            email: user.email || '',
            address: user.address || '',
            accountType: user.accountType || ''
          });
        } catch (e) {
          console.error('Error parsing localStorage user:', e);
        }
      }
    }
  };

  // Bật chế độ chỉnh sửa
  const handleEditMode = () => {
    setIsEditMode(true);
    setEditedUserInfo({ ...userInfo }); // Copy data hiện tại
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedUserInfo({});
  };

  // Lưu thông tin đã chỉnh sửa
  const handleSaveEdit = async () => {
    try {
      console.log('💾 Saving customer info:', editedUserInfo);
      
      const updateData = {
        name: editedUserInfo.name,
        phone: editedUserInfo.phone,
        email: editedUserInfo.email,
        address: editedUserInfo.address
      };
      
      await customerApi.updateCustomer(customerId, updateData);
      
      // Cập nhật state
      setUserInfo({ ...editedUserInfo });
      setIsEditMode(false);
      
      alert('✅ Cập nhật thông tin thành công!');
      console.log('✅ Customer info updated successfully');
    } catch (error) {
      console.error('❌ Error updating customer info:', error);
      alert('❌ Lỗi khi cập nhật thông tin. Vui lòng thử lại!');
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setEditedUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch booking history khi component mount

  // Force refresh khi quay lại trang (sau khi đặt lịch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible again, refreshing booking history...');
        fetchBookingHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on window focus
    window.addEventListener('focus', () => {
      console.log('🔄 Window focused, refreshing booking history...');
      fetchBookingHistory();
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchBookingHistory);
    };
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

      console.log('═══════════════════════════════════════');
      console.log('📚 FETCHING BOOKING HISTORY');
      console.log('═══════════════════════════════════════');
      console.log('🆔 Customer ID:', customerId);
      console.log('🔗 API Endpoint: /customer/schedules/' + customerId);
      console.log('═══════════════════════════════════════');
      
      // Fetch tất cả centers một lần để cache
      if (!centersCache) {
        try {
          console.log('🏢 Fetching all centers for cache...');
          const allCenters = await centerApi.getAllCenters();
          setCentersCache(Array.isArray(allCenters) ? allCenters : allCenters?.data || []);
          console.log('✅ Cached centers:', centersCache);
        } catch (centerErr) {
          console.warn('⚠️ Could not fetch centers cache:', centerErr);
        }
      }
      
      let response;
      try {
        response = await scheduleApi.getByCustomer(customerId);
      } catch (apiError) {
        console.error('❌ All API endpoints failed:', apiError);
        console.warn('⚠️ BACKEND ISSUE: Endpoint /api/customer/schedules/{id} không tồn tại');
        console.warn('⚠️ Backend cần implement một trong các endpoint:');
        console.warn('   1. GET /api/schedules/customer/{customerId}');
        console.warn('   2. GET /api/customer/schedules/{customerId}');
        console.warn('   3. GET /api/schedules?customerId={customerId}');
        
        // Nếu backend chưa có endpoint, hiển thị thông báo thân thiện
        throw new Error(
          'Backend chưa có API để lấy lịch sử đặt lịch. ' +
          'Vui lòng liên hệ admin để implement endpoint: GET /api/schedules/customer/{customerId}'
        );
      }
      
      console.log('📦 Raw API Response:', response);
      console.log('📦 Response Type:', typeof response);
      console.log('📦 Is Array:', Array.isArray(response));
      
      const bookings = Array.isArray(response) ? response : response?.data || [];
      
      console.log('✅ Extracted Bookings:', bookings);
      console.log('✅ Number of bookings:', bookings.length);
      console.log('═══════════════════════════════════════');
      
      // Transform dữ liệu từ BE sang format FE
      const transformedData = await Promise.all(bookings.map(async (item, index) => {
        console.log(`🔄 Transforming booking #${index + 1}:`, item);
        console.log(`   📋 Available fields:`, Object.keys(item));
        console.log(`   � Full item data:`, JSON.stringify(item, null, 2));
        console.log(`   �🔍 centerName:`, item.centerName);
        console.log(`   🔍 center:`, item.center);
        console.log(`   🔍 serviceCenter:`, item.serviceCenter);
        console.log(`   🔍 centerId:`, item.centerId);
        console.log(`   🔍 center_id:`, item.center_id);
        
        // Nếu không có thông tin center, fetch từ API
        let centerName = item.centerName || item.center?.name || item.serviceCenter?.name;
        
        // Check tất cả các tên field có thể (including nested và snake_case)
        const centerId = item.centerId || item.center_id || item.center?.id || item.center?.centerId || 
                        item.serviceCenter?.id || item.serviceCenter?.centerId ||
                        item.centerid || item.centerID; // thử thêm các variant
        
        console.log(`   🆔 Extracted centerId:`, centerId);
        
        if (!centerName && centerId) {
          try {
            console.log(`   🏢 Fetching center info for centerId: ${centerId}`);
            
            // Thử tìm trong cache trước
            if (centersCache && centersCache.length > 0) {
              const cachedCenter = centersCache.find(c => 
                c.id === centerId || c.centerId === centerId || 
                c.center_id === centerId || String(c.id) === String(centerId)
              );
              if (cachedCenter) {
                centerName = cachedCenter.name || cachedCenter.centerName || 'N/A';
                console.log(`   ✅ Found in cache: ${centerName}`);
              }
            }
            
            // Nếu không có trong cache, gọi API
            if (!centerName || centerName === 'N/A') {
              const centerResponse = await centerApi.getCenterById(centerId);
              console.log(`   📦 Center API response:`, centerResponse);
              centerName = centerResponse?.name || centerResponse?.centerName || 'N/A';
              console.log(`   ✅ Fetched from API: ${centerName}`);
            }
          } catch (centerError) {
            console.error(`   ❌ Failed to fetch center ${centerId}:`, centerError);
            console.error(`   ❌ Error details:`, centerError.response?.data);
            centerName = 'Trung tâm #' + centerId; // Fallback hiển thị ID
          }
        } else if (!centerName) {
          console.warn(`   ⚠️ No centerName AND no centerId found!`);
          console.warn(`   ⚠️ Backend cần trả về centerName hoặc centerId`);
          
          // WORKAROUND: Nếu có centers cache, dùng center đầu tiên
          if (centersCache && centersCache.length > 0) {
            centerName = centersCache[0]?.name || centersCache[0]?.centerName || 'EV Center';
            console.warn(`   🔧 FALLBACK: Using first center from cache: ${centerName}`);
          } else {
            centerName = 'Chưa xác định'; // Better than N/A
          }
        }
        
        // Format time từ backend
        // scheduledTime có thể là "HH:mm:ss" hoặc "YYYY-MM-DD HH:mm:ss.ffffff"
        console.log(`   🔍 RAW TIME DATA:`, {
          scheduledTime: item.scheduledTime,
          type: typeof item.scheduledTime,
          isNull: item.scheduledTime === null,
          isUndefined: item.scheduledTime === undefined
        });
        
        let formattedTime = 'N/A';
        if (item.scheduledTime) {
          const timeStr = String(item.scheduledTime);
          let hours = '00';
          let minutes = '00';
          
          // Nếu là full timestamp "YYYY-MM-DD HH:mm:ss"
          if (timeStr.includes(' ')) {
            const timePart = timeStr.split(' ')[1]; // Lấy phần "HH:mm:ss.ffffff"
            [hours, minutes] = timePart.split(':');
          } 
          // Nếu chỉ là "HH:mm:ss" hoặc "HH:mm"
          else if (timeStr.includes(':')) {
            const timeParts = timeStr.split(':');
            hours = timeParts[0];
            minutes = timeParts[1] || '00';
          }
          // Nếu là số thuần (giây hoặc timestamp)
          else if (!isNaN(timeStr)) {
            console.warn(`   ⚠️ Received numeric time: ${timeStr}`);
            // Có thể là seconds hoặc milliseconds
            const date = new Date(parseInt(timeStr));
            hours = date.getHours().toString();
            minutes = date.getMinutes().toString();
          }
          
          // Chuyển sang số để xử lý
          let hoursNum = parseInt(hours);
          let minutesNum = parseInt(minutes);
          
          // Validate
          if (isNaN(hoursNum)) hoursNum = 0;
          if (isNaN(minutesNum)) minutesNum = 0;
          
          formattedTime = `${hoursNum.toString().padStart(2, '0')}:${minutesNum.toString().padStart(2, '0')}`;
          
          console.log(`   ⏰ Time format: "${item.scheduledTime}" → "${formattedTime}"`);
        } else {
          console.error(`   ❌ scheduledTime is NULL/UNDEFINED for booking ID ${item.scheduleId || item.id}`);
        }
        
        const transformed = {
          id: item.scheduleId || item.id,
          vehicle: item.vehicleModel || item.vehicleName || item.vehicle?.model || 'N/A',
          licensePlate: item.vehicleLicensePlate || item.vehiclePlate || item.vehicle?.licensePlate || 'N/A',
          service: item.serviceName || item.service?.name || item.services?.join('\n') || 'Dịch vụ',
          center: centerName || 'N/A',
          date: item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('vi-VN') : 'N/A',
          time: formattedTime,
          status: item.status || 'PENDING',
          rawData: item // Giữ lại data gốc để dùng sau
        };
        
        console.log(`✅ Transformed:`, transformed);
        return transformed;
      }));
      
      console.log('═══════════════════════════════════════');
      console.log('📊 FINAL TRANSFORMED DATA:', transformedData);
      console.log('═══════════════════════════════════════');
      
      // Debug: Log IDs before sorting
      console.log('🆔 BOOKING IDs BEFORE SORT:');
      transformedData.forEach((item, i) => {
        console.log(`  ${i + 1}. ID=${item.id}, Date=${item.rawData.scheduledDate}, Time=${item.rawData.scheduledTime}`);
      });
      
      // Sắp xếp theo ID GIẢM DẦN (lịch mới đặt có ID cao hơn → lên đầu)
      // ID càng cao = đặt sau = lịch mới nhất
      const sortedData = transformedData.sort((a, b) => {
        // So sánh theo ID - giảm dần (ID cao = mới = lên trước)
        const result = b.id - a.id;
        console.log(`  Compare: ID ${a.id} vs ID ${b.id} → ${result > 0 ? `${b.id} (newer) first` : `${a.id} (newer) first`}`);
        return result;
      });
      
      console.log('🆔 BOOKING IDs AFTER SORT (newest first):');
      sortedData.forEach((item, i) => {
        console.log(`  ${i + 1}. ID=${item.id}, Date=${item.rawData.scheduledDate}, Time=${item.rawData.scheduledTime}`);
      });
      console.log('✅ Sorted by ID descending (newest bookings first)');
      
      // Thêm số thứ tự (STT) sau khi sort
      const dataWithSTT = sortedData.map((item, index) => ({
        ...item,
        stt: index + 1, // Số thứ tự từ 1
        originalId: item.id // Giữ lại ID gốc nếu cần
      }));
      
      setBookingHistory(dataWithSTT);
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
            <a className="nav-item" onClick={() => navigate('/price-list')} style={{ cursor: 'pointer' }}>Bảng giá</a>
            <a className="nav-item active" style={{ cursor: 'pointer' }}>Lịch sử</a>
          </nav>

          <div className="hf-actions">
            <div className="notification-bell-wrapper">
              <div 
                className="icon-circle bell" 
                title="Thông báo" 
                onClick={() => setIsNotificationModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
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
              <a className="mobile-nav-item" onClick={() => { navigate('/price-list'); setIsMobileMenuOpen(false); }}>
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
                          {booking.time !== 'N/A' ? (
                            <div className="time">{booking.time}</div>
                          ) : (
                            <div className="time" style={{color: '#999', fontStyle: 'italic'}}>
                              Đang cập nhật
                            </div>
                          )}
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
                    {isEditMode ? (
                      <input 
                        type="text" 
                        value={editedUserInfo.name || ''} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.name || 'Đang tải...'}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Mã khách hàng:</label>
                    <span>KH00{userInfo.id}</span>
                  </div>
                  <div className="info-group">
                    <label>Số điện thoại:</label>
                    {isEditMode ? (
                      <input 
                        type="tel" 
                        value={editedUserInfo.phone || ''} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="edit-input"
                        placeholder="0912345678"
                      />
                    ) : (
                      <span>{userInfo.phone || 'Chưa cập nhật'}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Email:</label>
                    {isEditMode ? (
                      <input 
                        type="email" 
                        value={editedUserInfo.email || ''} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="edit-input"
                        placeholder="customer@evcenter.com"
                      />
                    ) : (
                      <span>{userInfo.email || 'customer@evcenter.com'}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Địa chỉ:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        value={editedUserInfo.address || ''} 
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="edit-input"
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    ) : (
                      <span>{userInfo.address || '123 Đường ABC, Quận 1, TP.HCM'}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Ngày đăng ký:</label>
                    <span>15/08/2024</span>
                  </div>
                  <div className="info-group">
                    <label>Loại tài khoản:</label>
                    <span>{userInfo.accountType || 'Khách hàng VIP'}</span>
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
              {isEditMode ? (
                <>
                  <button className="btn-secondary" onClick={handleCancelEdit}>
                    ❌ Hủy
                  </button>
                  <button className="btn-primary" onClick={handleSaveEdit}>
                    💾 Lưu thay đổi
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setIsCustomerInfoModalOpen(false)}>
                    Đóng
                  </button>
                  <button className="btn-primary" onClick={handleEditMode}>
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        customerId={customerId}
      />
    </div>
  );
}