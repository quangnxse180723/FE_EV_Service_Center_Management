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
        lastServiceDate: null
      };

      console.log('📤 Adding vehicle (WITHOUT IMAGE):');
      console.log('  - customerId:', vehicleData.customerId);
      console.log('  - licensePlate:', vehicleData.licensePlate);
      console.log('  - model:', vehicleData.model);
      console.log('  - vin:', vehicleData.vin);
      console.log('  - currentMileage:', vehicleData.currentMileage);
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
          <div className="header-info">
            <h1>Quản lý xe của tôi</h1>
            <p>Khách hàng: {userInfo.name}</p>
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
                        <div className="spec-item">
                          <div className="spec-icon">�</div>
                          <div className="spec-content">
                            <span className="spec-label">VIN</span>
                            <span className="spec-value">{vehicle.vin}</span>
                          </div>
                        </div>
                      )}
                      {vehicle.currentMileage !== null && vehicle.currentMileage !== undefined && (
                        <div className="spec-item">
                          <div className="spec-icon">🛣️</div>
                          <div className="spec-content">
                            <span className="spec-label">Số km hiện tại</span>
                            <span className="spec-value">{vehicle.currentMileage.toLocaleString()} km</span>
                          </div>
                        </div>
                      )}
                      <div className="spec-item maintenance-item">
                        <div className="spec-icon">🔧</div>
                        <div className="spec-content">
                          <span className="spec-label">Bảo dưỡng cuối</span>
                          <span className="spec-value">
                            {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                          </span>
                        </div>
                      </div>
                      {vehicle.nextService && (
                        <div className="spec-item next-maintenance-item">
                          <div className="spec-icon">⏰</div>
                          <div className="spec-content">
                            <span className="spec-label">Bảo dưỡng tiếp theo</span>
                            <span className="spec-value next-service-date">
                              {new Date(vehicle.nextService).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      )}
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
