import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyVehiclesPage.css';
import vehicleApi from '../../../api/vehicleApi';
import customerApi from '../../../api/customerApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function MyVehiclesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // State cho customer data
  const [customerData, setCustomerData] = useState(null);

  // Helper functions cho logic bảo dưỡng
  const calculateMonthsSinceLastService = (lastServiceDate) => {
    if (!lastServiceDate) return 0;
    const lastDate = new Date(lastServiceDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - lastDate.getFullYear()) * 12 + 
                       (today.getMonth() - lastDate.getMonth());
    return monthsDiff;
  };

  const calculateMaintenanceLevel = (km, lastServiceDate) => {
    const kmPerMaintenance = 1000;
    const monthsPerMaintenance = 3;
    
    const levelByKm = km ? Math.floor(km / kmPerMaintenance) : 0;
    const monthsPassed = calculateMonthsSinceLastService(lastServiceDate);
    const levelByTime = Math.floor(monthsPassed / monthsPerMaintenance);
    
    const maintenanceLevel = Math.max(levelByKm, levelByTime);
    return maintenanceLevel > 0 ? maintenanceLevel : null;
  };

  // Hàm tính toán thông tin bảo dưỡng tiếp theo
  const calculateNextMaintenance = (km, lastServiceDate) => {
    const kmPerMaintenance = 1000;
    const monthsPerMaintenance = 3;
    
    // Tính km còn lại đến lần bảo dưỡng tiếp theo
    const currentLevel = Math.floor(km / kmPerMaintenance);
    const nextKmMilestone = (currentLevel + 1) * kmPerMaintenance;
    const kmRemaining = nextKmMilestone - km;
    
    // Tính thời gian còn lại đến lần bảo dưỡng tiếp theo
    let monthsRemaining = null;
    let nextMaintenanceDate = null;
    
    if (lastServiceDate) {
      const monthsPassed = calculateMonthsSinceLastService(lastServiceDate);
      const currentTimeLevel = Math.floor(monthsPassed / monthsPerMaintenance);
      const nextMonthMilestone = (currentTimeLevel + 1) * monthsPerMaintenance;
      monthsRemaining = nextMonthMilestone - monthsPassed;
      
      // Tính ngày bảo dưỡng tiếp theo
      const lastDate = new Date(lastServiceDate);
      nextMaintenanceDate = new Date(lastDate);
      nextMaintenanceDate.setMonth(lastDate.getMonth() + nextMonthMilestone);
    }
    
    return {
      kmRemaining,
      nextKmMilestone,
      monthsRemaining,
      nextMaintenanceDate
    };
  };

  // State cho form thêm xe - Match với CreateVehicleRequest Backend
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '',
    model: '',
    vin: '',
    currentMileage: '',
    lastServiceDate: '',
    imageFile: null,
    imagePreview: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // User info từ API
  const [userInfo, setUserInfo] = useState({
    id: user?.customerId || 'KH001',
    name: user?.fullName || 'Khách hàng'
  });

  useEffect(() => {
    fetchCustomerData();
    fetchVehicles();
  }, []);

  const fetchCustomerData = async () => {
    try {
      let customerId = localStorage.getItem('customerId');
      
      // Tìm bằng email nếu không có customerId
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const userEmail = user?.email;
          
          if (userEmail) {
            const allCustomers = await customerApi.getAllCustomers();
            const customers = Array.isArray(allCustomers) ? allCustomers : allCustomers?.data || [];
            const foundCustomer = customers.find(c => 
              c.email?.toLowerCase() === userEmail?.toLowerCase()
            );
            
            if (foundCustomer) {
              customerId = foundCustomer.customerId || foundCustomer.id;
              localStorage.setItem('customerId', customerId);
            } else if (customers.length === 1 && user?.role === 'CUSTOMER') {
              customerId = customers[0].customerId || customers[0].id;
              localStorage.setItem('customerId', customerId);
            }
          }
        }
      }
      
      if (customerId && customerId !== 'null' && customerId !== 'undefined') {
        const data = await customerApi.getCustomerById(customerId);
        setCustomerData(data);
        setUserInfo({
          id: `KH${String(data.customerId || customerId).padStart(3, '0')}`,
          name: data.fullName || user?.fullName || 'Khách hàng'
        });
        console.log('✅ Customer data loaded:', data);
      } else {
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }
    } catch (err) {
      console.error('❌ Error fetching customer data:', err);
      setError(err.message || 'Không thể tải thông tin khách hàng');
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy customerId từ localStorage
      let customerId = localStorage.getItem('customerId');
      
      // Nếu không có customerId, thử lấy từ user object hoặc accountId
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        console.warn('⚠️ No customerId in localStorage, trying alternative sources...');
        
        const userStr = localStorage.getItem('user');
        const accountId = localStorage.getItem('accountId');
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            customerId = user.customerId || user.accountId || accountId;
            if (customerId) {
              console.log('✅ Found customerId from user object:', customerId);
              localStorage.setItem('customerId', customerId);
            }
          } catch (e) {
            console.error('Error parsing user:', e);
          }
        } else if (accountId) {
          customerId = accountId;
          console.log('✅ Using accountId as customerId:', customerId);
          localStorage.setItem('customerId', customerId);
        }
      }
      
      // Nếu vẫn không có customerId, báo lỗi
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }
      
      // Gọi API lấy xe của khách hàng
      console.log('🔍 Fetching vehicles for customerId:', customerId);
      const response = await vehicleApi.getCustomerVehicles(customerId);
      const vehiclesData = Array.isArray(response) ? response : response?.data || [];
      
      console.log('✅ Vehicles loaded from database:', vehiclesData);
      setVehicles(vehiclesData);
      
    } catch (err) {
      console.error('❌ Error loading vehicles:', err);
      setError(err.message || 'Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setNewVehicle({
      licensePlate: '',
      model: '',
      vin: '',
      currentMileage: '',
      imageFile: null,
      imagePreview: null
    });
    setShowAddModal(true);
  };

  const handleFormChange = (field, value) => {
    setNewVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image upload with compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 2MB!');
        return;
      }

      // Compress and convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize image to max 800x600
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          
          setNewVehicle(prev => ({
            ...prev,
            imageFile: null, // Clear file object
            imagePreview: compressedBase64,
            imageBase64: compressedBase64
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newVehicle.licensePlate || !newVehicle.model || !newVehicle.vin) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Biển số, Model và VIN)');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Lấy customerId
      const customerId = localStorage.getItem('customerId');
      console.log('🔍 CustomerId from localStorage:', customerId);
      
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        console.error('❌ No valid customerId found');
        alert('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
        return;
      }

      // Tạo vehicle object theo format CreateVehicleRequest của Backend
      const vehicleData = {
        customerId: parseInt(customerId),
        licensePlate: newVehicle.licensePlate.trim(),
        model: newVehicle.model.trim(),
        vin: newVehicle.vin.trim(),
        currentMileage: newVehicle.currentMileage ? parseInt(newVehicle.currentMileage) : 0,
        imageUrl: null, // ✅ TẠM THỜI BỎ ẢNH - Backend cần fix database column
        lastServiceDate: newVehicle.lastServiceDate ? newVehicle.lastServiceDate : null
      };

      console.log('📤 Adding vehicle (WITHOUT IMAGE):');
      console.log('  - customerId:', vehicleData.customerId);
      console.log('  - licensePlate:', vehicleData.licensePlate);
      console.log('  - model:', vehicleData.model);
      console.log('  - vin:', vehicleData.vin);
      console.log('  - currentMileage:', vehicleData.currentMileage);
      console.log('  - lastServiceDate:', vehicleData.lastServiceDate);
      console.log('⚠️ Image upload disabled temporarily');
      
      // Gọi API để lưu vào database - Gửi JSON object trực tiếp
      const response = await vehicleApi.createVehicle(vehicleData);
      
      console.log('✅ Vehicle added successfully:', response);
      
      // Reload danh sách xe từ server
      await fetchVehicles();
      
      // Đóng modal và reset form
      setShowAddModal(false);
      setNewVehicle({
        licensePlate: '',
        model: '',
        vin: '',
        currentMileage: '',
        imageFile: null,
        imagePreview: null
      });
      
      // Hiển thị thông báo thành công
      setSuccessMessage(`✅ Thêm xe ${vehicleData.licensePlate} thành công!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('❌ Error adding vehicle:', err);
      alert('Lỗi khi thêm xe: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      try {
        await vehicleApi.deleteVehicle(vehicleId);
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        setSuccessMessage('✅ Xóa xe thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('❌ Error deleting vehicle:', err);
        alert('Lỗi khi xóa xe: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { text: 'Hoạt động', class: 'status-active' },
      'active': { text: 'Hoạt động', class: 'status-active' },
      'MAINTENANCE': { text: 'Bảo trì', class: 'status-maintenance' },
      'maintenance': { text: 'Bảo trì', class: 'status-maintenance' },
      'INACTIVE': { text: 'Ngưng hoạt động', class: 'status-inactive' },
      'inactive': { text: 'Ngưng hoạt động', class: 'status-inactive' }
    };
    const statusInfo = statusMap[status] || { text: 'Hoạt động', class: 'status-active' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  // Helper function để hiển thị ảnh xe với fallback
  const getVehicleImage = (vehicle) => {
    if (vehicle.imageUrl) {
      return vehicle.imageUrl;
    }
    // Placeholder image nếu không có ảnh
    return 'https://via.placeholder.com/400x250/4CAF50/ffffff?text=EV+Vehicle';
  };

  if (loading) {
    return (
      <div className="my-vehicles-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-vehicles-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchVehicles} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-vehicles-page">
      {/* Success Message */}
      {successMessage && (
        <div className="success-toast">
          <span className="success-icon">✅</span>
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Quay lại
          </button>
          <div className="header-center">
            <h1>Quản lý xe của tôi</h1>
            <p className="customer-name">Khách hàng: {userInfo.name}</p>
          </div>
          <button onClick={handleAddVehicle} className="add-vehicle-btn">
            + Thêm xe mới
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="vehicles-container">
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có xe nào được đăng ký</h3>
            <p>Hãy thêm xe đầu tiên để bắt đầu sử dụng dịch vụ</p>
            <button onClick={handleAddVehicle} className="add-first-vehicle-btn">
              Thêm xe đầu tiên
            </button>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map(vehicle => (
              <div key={vehicle.vehicleId || vehicle.id} className="vehicle-card">
                <div className="vehicle-image">
                  <img src={getVehicleImage(vehicle)} alt={vehicle.model} />
                  {getStatusBadge(vehicle.status || 'ACTIVE')}
                </div>
                
                <div className="vehicle-info">
                  <div className="vehicle-header">
                    <h3 className="vehicle-model">{vehicle.model}</h3>
                    <div className="license-plate">{vehicle.licensePlate}</div>
                  </div>
                  
                  <div className="vehicle-specs">
                    <div className="spec-grid">
                      {vehicle.year && (
                        <div className="spec-item">
                          <div className="spec-icon">📅</div>
                          <div className="spec-content">
                            <span className="spec-label">Năm sản xuất</span>
                            <span className="spec-value">{vehicle.year}</span>
                          </div>
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="spec-item">
                          <div className="spec-icon">🎨</div>
                          <div className="spec-content">
                            <span className="spec-label">Màu sắc</span>
                            <span className="spec-value">{vehicle.color}</span>
                          </div>
                        </div>
                      )}
                      {vehicle.vin && (
                        <div className="spec-item" style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          padding: '14px 16px',
                          borderRadius: '12px'
                        }}>
                          <div className="spec-icon" style={{ fontSize: '26px' }}>🔑</div>
                          <div className="spec-content">
                            <span className="spec-label" style={{ 
                              color: '#fff', 
                              opacity: 0.95, 
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>Số VIN</span>
                            <span className="spec-value" style={{ 
                              color: '#fff', 
                              fontWeight: '700',
                              fontSize: '13px',
                              letterSpacing: '0.5px',
                              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>{vehicle.vin}</span>
                          </div>
                        </div>
                      )}
                      {vehicle.currentMileage !== null && vehicle.currentMileage !== undefined && (
                        <div className="spec-item" style={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
                          padding: '14px 16px',
                          borderRadius: '12px'
                        }}>
                          <div className="spec-icon" style={{ fontSize: '26px' }}>🛣️</div>
                          <div className="spec-content">
                            <span className="spec-label" style={{ 
                              color: '#fff', 
                              opacity: 0.95, 
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>Đã chạy</span>
                            <span className="spec-value" style={{ 
                              color: '#fff', 
                              fontWeight: '700',
                              fontSize: '17px',
                              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>{vehicle.currentMileage.toLocaleString()} km</span>
                          </div>
                        </div>
                      )}
                      {(() => {
                        const maintenanceLevel = calculateMaintenanceLevel(vehicle.currentMileage, vehicle.lastServiceDate);
                        const monthsSinceLastService = calculateMonthsSinceLastService(vehicle.lastServiceDate);
                        
                        if (!maintenanceLevel) return null;
                        
                        const levelByKm = vehicle.currentMileage ? Math.floor(vehicle.currentMileage / 1000) : 0;
                        const levelByTime = Math.floor(monthsSinceLastService / 3);
                        const isTimeTriggered = levelByTime > levelByKm;
                        
                        return (
                          <div className="spec-item" style={{
                            backgroundColor: (() => {
                              return maintenanceLevel === 1 ? '#e3f2fd' : maintenanceLevel === 2 ? '#fff3e0' : '#ffebee';
                            })(),
                            border: `2px solid ${(() => {
                              return maintenanceLevel === 1 ? '#2196F3' : maintenanceLevel === 2 ? '#FF9800' : '#F44336';
                            })()}`
                          }}>
                            <div className="spec-icon">⚙️</div>
                            <div className="spec-content">
                              <span className="spec-label">Lần bảo dưỡng</span>
                              <span className="spec-value" style={{
                                fontWeight: '700',
                                color: (() => {
                                  return maintenanceLevel === 1 ? '#1976d2' : maintenanceLevel === 2 ? '#f57c00' : '#d32f2f';
                                })()
                              }}>
                                Lần {maintenanceLevel}
                              </span>
                              <div style={{ fontSize: '11px', marginTop: '3px', opacity: 0.8 }}>
                                {isTimeTriggered 
                                  ? `${monthsSinceLastService} tháng kể từ lần cuối`
                                  : `${vehicle.currentMileage.toLocaleString()} km`}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="spec-item maintenance-item">
                        <div className="spec-icon">🔧</div>
                        <div className="spec-content">
                          <span className="spec-label">Bảo dưỡng cuối</span>
                          <span className="spec-value">
                            {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                          </span>
                        </div>
                      </div>
                      {(() => {
                        const nextMaintenance = calculateNextMaintenance(
                          vehicle.currentMileage || 0, 
                          vehicle.lastServiceDate
                        );
                        
                        // Hiển thị nếu có thông tin km hoặc thời gian
                        if (!nextMaintenance.kmRemaining && !nextMaintenance.monthsRemaining) return null;
                        
                        // Xác định điều kiện nào sẽ đến trước
                        const isKmSooner = !nextMaintenance.monthsRemaining || 
                                          (nextMaintenance.kmRemaining && nextMaintenance.kmRemaining < nextMaintenance.monthsRemaining * 333); // Giả sử trung bình 333km/tháng
                        
                        return (
                          <div className="spec-item next-maintenance-item" style={{
                            backgroundColor: '#f0f7ff',
                            border: '2px solid #2196F3'
                          }}>
                            <div className="spec-icon">⏰</div>
                            <div className="spec-content">
                              <span className="spec-label">Bảo dưỡng tiếp theo</span>
                              <span className="spec-value next-service-date" style={{ fontWeight: '600', color: '#1976d2' }}>
                                {isKmSooner ? (
                                  <>
                                    Còn {nextMaintenance.kmRemaining.toLocaleString()} km
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                                      (Đạt {nextMaintenance.nextKmMilestone.toLocaleString()} km)
                                    </div>
                                  </>
                                ) : nextMaintenance.nextMaintenanceDate ? (
                                  <>
                                    {nextMaintenance.nextMaintenanceDate.toLocaleDateString('vi-VN')}
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                                      (Còn {nextMaintenance.monthsRemaining} tháng)
                                    </div>
                                  </>
                                ) : 'Chưa xác định'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>

                <div className="vehicle-actions">
                  <button 
                    onClick={() => handleViewDetail(vehicle)}
                    className="detail-btn"
                  >
                    Chi tiết
                  </button>
                  <button 
                    onClick={() => navigate('/booking', { state: { 
                      selectedVehicle: vehicle,
                      skipToStep: 2 
                    }})}
                    className="book-service-btn"
                  >
                    Đặt lịch
                  </button>
                  <button 
                    onClick={() => handleDeleteVehicle(vehicle.vehicleId || vehicle.id)}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="vehicle-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết xe</h2>
              <button onClick={() => setSelectedVehicle(null)} className="close-btn">×</button>
            </div>
            
            <div className="modal-content">
              <div className="vehicle-image-large">
                <img src={getVehicleImage(selectedVehicle)} alt={selectedVehicle.model} />
              </div>
              
              <div className="vehicle-full-info">
                <h3>{selectedVehicle.model}</h3>
                <div className="license-plate-large">{selectedVehicle.licensePlate}</div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <label>VIN:</label>
                    <span>{selectedVehicle.vin || 'Chưa cập nhật'}</span>
                  </div>
                  {selectedVehicle.year && (
                    <div className="info-item">
                      <label>Năm sản xuất:</label>
                      <span>{selectedVehicle.year}</span>
                    </div>
                  )}
                  {selectedVehicle.color && (
                    <div className="info-item">
                      <label>Màu sắc:</label>
                      <span>{selectedVehicle.color}</span>
                    </div>
                  )}
                  {selectedVehicle.currentMileage !== null && selectedVehicle.currentMileage !== undefined && (
                    <div className="info-item">
                      <label>Số km hiện tại:</label>
                      <span>{selectedVehicle.currentMileage.toLocaleString()} km</span>
                    </div>
                  )}
                  {selectedVehicle.lastServiceDate && (
                    <div className="info-item">
                      <label>Bảo dưỡng cuối:</label>
                      <span>{new Date(selectedVehicle.lastServiceDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    {getStatusBadge(selectedVehicle.status || 'ACTIVE')}
                  </div>
                </div>

                {/* Thanh tiến trình bảo dưỡng */}
                {(() => {
                  const maintenanceLevel = calculateMaintenanceLevel(selectedVehicle.currentMileage, selectedVehicle.lastServiceDate);
                  if (!maintenanceLevel) return null;

                  const kmPerMaintenance = 1000;
                  const monthsPerMaintenance = 3;
                  const kmOverdue = maintenanceLevel ? (selectedVehicle.currentMileage - (maintenanceLevel * kmPerMaintenance)) : 0;
                  const isKmOverdue = kmOverdue > 200;
                  
                  const monthsSinceLastService = calculateMonthsSinceLastService(selectedVehicle.lastServiceDate);
                  const monthsOverdue = maintenanceLevel ? (monthsSinceLastService - (maintenanceLevel * monthsPerMaintenance)) : 0;
                  const isTimeOverdue = monthsOverdue > 1;
                  
                  const isOverdue = isKmOverdue || isTimeOverdue;

                  return (
                    <div style={{ marginTop: '25px', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16px', color: '#555', marginBottom: '15px', textAlign: 'center' }}>
                        Lịch sử bảo dưỡng
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '20px',
                        position: 'relative'
                      }}>
                        {[1, 2, 3, 4, 5].map((level) => {
                          const isCompleted = level < maintenanceLevel;
                          const isCurrent = level === maintenanceLevel;
                          
                          const currentColor = isCurrent && isOverdue ? '#F44336' : '#FF9800';
                          const currentShadow = isCurrent && isOverdue 
                            ? '0 4px 8px rgba(244, 67, 54, 0.3)' 
                            : '0 4px 8px rgba(255, 152, 0, 0.3)';
                          
                          return (
                            <div key={level} style={{ 
                              flex: 1, 
                              textAlign: 'center',
                              position: 'relative',
                              zIndex: 2
                            }}>
                              <div style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: isCompleted ? '#4CAF50' : isCurrent ? currentColor : '#E0E0E0',
                                color: isCompleted || isCurrent ? '#fff' : '#999',
                                borderRadius: '25px',
                                fontWeight: '700',
                                fontSize: '15px',
                                boxShadow: isCurrent ? currentShadow : 'none',
                                position: 'relative',
                                zIndex: 3
                              }}>
                                Lần {level}
                              </div>
                              {level < 5 && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '60%',
                                  right: '-40%',
                                  height: '4px',
                                  backgroundColor: isCompleted ? '#4CAF50' : '#E0E0E0',
                                  zIndex: 1,
                                  transform: 'translateY(-50%)'
                                }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Legend */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '20px',
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            width: '14px', 
                            height: '14px', 
                            backgroundColor: '#4CAF50', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span>Đúng hạn</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            width: '14px', 
                            height: '14px', 
                            backgroundColor: '#FF9800', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span>Cần bảo dưỡng</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            width: '14px', 
                            height: '14px', 
                            backgroundColor: '#F44336', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span>Quá hạn</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            width: '14px', 
                            height: '14px', 
                            backgroundColor: '#E0E0E0', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} />
                          <span>Lần kế tiếp</span>
                        </div>
                      </div>

                      {/* Thông tin bảo dưỡng hiện tại */}
                      <div style={{
                        padding: '15px',
                        backgroundColor: isOverdue ? '#FFEBEE' : '#fff8e1',
                        border: isOverdue ? '2px solid #EF5350' : '2px solid #FFC107',
                        borderRadius: '8px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ fontWeight: '600', color: isOverdue ? '#D32F2F' : '#F57C00', marginBottom: '8px', fontSize: '15px' }}>
                          {isOverdue ? '⚠️' : '⚙️'} Lần bảo dưỡng thứ {maintenanceLevel}
                        </div>
                        {(() => {
                          const monthsSinceLastService = calculateMonthsSinceLastService(selectedVehicle.lastServiceDate);
                          const levelByKm = selectedVehicle.currentMileage ? Math.floor(selectedVehicle.currentMileage / 1000) : 0;
                          const levelByTime = Math.floor(monthsSinceLastService / 3);
                          const isTimeTriggered = levelByTime > levelByKm;
                          
                          return (
                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                              {isTimeTriggered 
                                ? `🕒 ${monthsSinceLastService} tháng kể từ lần cuối`
                                : `🛣️ Đã chạy ${selectedVehicle.currentMileage.toLocaleString()} km`}
                            </div>
                          );
                        })()}
                        {isOverdue && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#D32F2F', 
                            fontWeight: '600',
                            marginBottom: '8px'
                          }}>
                            {isKmOverdue && isTimeOverdue ? (
                              <>Quá {kmOverdue.toLocaleString()} km và {monthsOverdue} tháng</>
                            ) : isKmOverdue ? (
                              <>Quá {kmOverdue.toLocaleString()} km so với kỳ bảo dưỡng</>
                            ) : (
                              <>Quá {monthsOverdue} tháng so với kỳ bảo dưỡng</>
                            )}
                          </div>
                        )}
                        <div style={{ 
                          fontSize: '13px', 
                          color: isOverdue ? '#D32F2F' : '#F57C00', 
                          fontWeight: '600',
                          marginTop: '8px',
                          padding: '8px 12px',
                          backgroundColor: isOverdue ? '#FFCDD2' : '#FFF3E0',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {isOverdue ? '⚠️ Quá hạn bảo dưỡng' : '⏰ Đã đến kỳ bảo dưỡng'}
                        </div>
                      </div>

                      {/* Bảo dưỡng tiếp theo */}
                      {(() => {
                        const nextMaintenance = calculateNextMaintenance(
                          selectedVehicle.currentMileage || 0, 
                          selectedVehicle.lastServiceDate
                        );
                        
                        if (!nextMaintenance.kmRemaining && !nextMaintenance.monthsRemaining) return null;
                        
                        const isKmSooner = !nextMaintenance.monthsRemaining || 
                                          (nextMaintenance.kmRemaining && nextMaintenance.kmRemaining < nextMaintenance.monthsRemaining * 333);
                        
                        return (
                          <div style={{
                            backgroundColor: '#f0f7ff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '2px solid #2196F3'
                          }}>
                            <div style={{ fontWeight: '600', color: '#1976d2', fontSize: '14px', marginBottom: '8px' }}>
                              📅 Bảo dưỡng tiếp theo
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              {isKmSooner ? (
                                <>
                                  ⏰ Còn {nextMaintenance.kmRemaining.toLocaleString()} km
                                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                    (Khi đạt {nextMaintenance.nextKmMilestone.toLocaleString()} km)
                                  </div>
                                </>
                              ) : nextMaintenance.nextMaintenanceDate ? (
                                <>
                                  📅 {nextMaintenance.nextMaintenanceDate.toLocaleDateString('vi-VN')}
                                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                    (Còn khoảng {nextMaintenance.monthsRemaining} tháng)
                                  </div>
                                </>
                              ) : 'Chưa xác định'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-vehicle-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm xe mới</h2>
              <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-content">
              <form className="add-vehicle-form" onSubmit={handleSubmitVehicle}>
                {/* Image Upload */}
                <div className="form-group full-width">
                  <label>Ảnh xe:</label>
                  <div className="image-upload-container">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="image-upload-btn">
                      {newVehicle.imagePreview ? (
                        <img src={newVehicle.imagePreview} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <span>📷</span>
                          <p>Click để chọn ảnh</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Biển số xe: <span className="required">*</span></label>
                    <input 
                      type="text" 
                      placeholder="VD: 29A-123.45"
                      value={newVehicle.licensePlate}
                      onChange={(e) => handleFormChange('licensePlate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Model xe: <span className="required">*</span></label>
                    <select 
                      value={newVehicle.model}
                      onChange={(e) => handleFormChange('model', e.target.value)}
                      required
                    >
                      <option value="">Chọn model xe</option>
                      <option value="VinFast Feliz S">VinFast Feliz S</option>
                      <option value="Yadea Ulike">Yadea Ulike</option>
                      <option value="VinFast Klara S">VinFast Klara S</option>
                      <option value="VinFast Impes">VinFast Impes</option>
                      <option value="Honda SH">Honda SH</option>
                      <option value="Yamaha NVX">Yamaha NVX</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>VIN (Vehicle Identification Number):</label>
                    <input 
                      type="text" 
                      placeholder="VD: 1HGBH41JXMN109186"
                      value={newVehicle.vin}
                      onChange={(e) => handleFormChange('vin', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số km hiện tại:</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="VD: 15000"
                      value={newVehicle.currentMileage}
                      onChange={(e) => handleFormChange('currentMileage', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Ngày bảo dưỡng cuối cùng: 
                      <span style={{ fontSize: '12px', color: '#999', marginLeft: '5px' }}>(Không bắt buộc)</span>
                    </label>
                    <input 
                      type="date" 
                      value={newVehicle.lastServiceDate}
                      onChange={(e) => handleFormChange('lastServiceDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      style={{ 
                        padding: '10px', 
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <small style={{ 
                      display: 'block', 
                      marginTop: '5px', 
                      color: '#666', 
                      fontSize: '12px' 
                    }}>
                      💡 Giúp tính toán lần bảo dưỡng tiếp theo dựa trên thời gian (mỗi 3 tháng)
                    </small>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="cancel-btn"
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang thêm...' : 'Thêm xe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
