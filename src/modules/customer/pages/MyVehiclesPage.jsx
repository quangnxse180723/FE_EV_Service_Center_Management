import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyVehiclesPage.css';
import vehicleApi from '../../../api/vehicleApi';
import XE01 from '/src/assets/img/XE01.png';
import XE02 from '/src/assets/img/XE02.png';

export default function MyVehiclesPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // State cho form thêm xe
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '',
    model: '',
    year: '',
    color: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Giả lập user info (thực tế sẽ lấy từ AuthContext)
  const userInfo = {
    id: 'KH001',
    name: 'Nguyễn Văn A'
  };

  // Mock data cho demo (thực tế sẽ gọi API)
  const mockVehicles = [
    {
      id: 1,
      licensePlate: '29A-123.45',
      model: 'VinFast Feliz S',
      year: 2023,
      color: 'Trắng',
      batteryCapacity: '51.8 kWh',
      range: '300 km',
      registrationDate: '2023-05-15',
      lastService: '2024-03-15',
      nextService: '2024-09-15',
      status: 'active',
      image: XE01
    },
    {
      id: 2,
      licensePlate: '30B-456.78',
      model: 'Yadea Ulike',
      year: 2022,
      color: 'Đen',
      batteryCapacity: '3.2 kWh',
      range: '80 km',
      registrationDate: '2022-08-20',
      lastService: '2024-02-10',
      nextService: '2024-08-10',
      status: 'active',
      image: XE02
    }
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Trong môi trường thực tế, sẽ gọi API
      // const response = await vehicleApi.getCustomerVehicles(userInfo.id);
      // setVehicles(response.data);
      
      // Demo với mock data
      setTimeout(() => {
        setVehicles(mockVehicles);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Không thể tải danh sách xe');
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setNewVehicle({
      licensePlate: '',
      model: '',
      year: '',
      color: ''
    });
    setShowAddModal(true);
  };

  const handleFormChange = (field, value) => {
    setNewVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newVehicle.licensePlate || !newVehicle.model || !newVehicle.year || !newVehicle.color) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Tạo vehicle object mới
      const vehicleToAdd = {
        id: Date.now(), // Tạm thời dùng timestamp làm ID
        licensePlate: newVehicle.licensePlate,
        model: newVehicle.model,
        year: parseInt(newVehicle.year),
        color: newVehicle.color,
        batteryCapacity: getDefaultBatteryCapacity(newVehicle.model),
        range: getDefaultRange(newVehicle.model),
        registrationDate: new Date().toISOString().split('T')[0],
        lastService: null,
        nextService: getNextServiceDate(),
        status: 'active',
        image: getDefaultImage(newVehicle.model)
      };

      // Trong thực tế sẽ gọi API
      // await vehicleApi.addVehicle(vehicleToAdd);
      
      // Cập nhật danh sách vehicles
      setVehicles(prev => [...prev, vehicleToAdd]);
      
      // Đóng modal và reset form
      setShowAddModal(false);
      setNewVehicle({
        licensePlate: '',
        model: '',
        year: '',
        color: ''
      });
      
      // Hiển thị thông báo thành công
      setSuccessMessage(`Thêm xe ${vehicleToAdd.licensePlate} thành công!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      alert('Lỗi khi thêm xe: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getDefaultBatteryCapacity = (model) => {
    const capacityMap = {
      'VinFast Feliz S': '51.8 kWh',
      'Yadea Ulike': '3.2 kWh',
      'VinFast Klara S': '2.5 kWh',
      'VinFast Impes': '3.5 kWh'
    };
    return capacityMap[model] || '2.5 kWh';
  };

  const getDefaultRange = (model) => {
    const rangeMap = {
      'VinFast Feliz S': '300 km',
      'Yadea Ulike': '80 km',
      'VinFast Klara S': '60 km',
      'VinFast Impes': '90 km'
    };
    return rangeMap[model] || '60 km';
  };

  const getDefaultImage = (model) => {
    const imageMap = {
      'VinFast Feliz S': XE01,
      'Yadea Ulike': XE02,
      'VinFast Klara S': XE01,
      'VinFast Impes': XE02
    };
    return imageMap[model] || XE01;
  };

  const getNextServiceDate = () => {
    const nextService = new Date();
    nextService.setMonth(nextService.getMonth() + 6); // 6 tháng sau
    return nextService.toISOString().split('T')[0];
  };

  const handleViewDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này?')) {
      try {
        // await vehicleApi.deleteVehicle(vehicleId);
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
      } catch (err) {
        alert('Lỗi khi xóa xe');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { text: 'Hoạt động', class: 'status-active' },
      'maintenance': { text: 'Bảo trì', class: 'status-maintenance' },
      'inactive': { text: 'Ngưng hoạt động', class: 'status-inactive' }
    };
    const statusInfo = statusMap[status] || statusMap['active'];
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
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
            {vehicles.map(vehicle => {
              console.log('Rendering vehicle:', vehicle.model, 'nextService:', vehicle.nextService);
              return (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-image">
                  <img src={vehicle.image} alt={vehicle.model} />
                  {getStatusBadge(vehicle.status)}
                </div>
                
                <div className="vehicle-info">
                  <div className="vehicle-header">
                    <h3 className="vehicle-model">{vehicle.model}</h3>
                    <div className="license-plate">{vehicle.licensePlate}</div>
                  </div>
                  
                  <div className="vehicle-specs">
                    <div className="spec-grid">
                      <div className="spec-item">
                        <div className="spec-icon">📅</div>
                        <div className="spec-content">
                          <span className="spec-label">Năm sản xuất</span>
                          <span className="spec-value">{vehicle.year}</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <div className="spec-icon">🎨</div>
                        <div className="spec-content">
                          <span className="spec-label">Màu sắc</span>
                          <span className="spec-value">{vehicle.color}</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <div className="spec-icon">🔋</div>
                        <div className="spec-content">
                          <span className="spec-label">Dung lượng pin</span>
                          <span className="spec-value">{vehicle.batteryCapacity}</span>
                        </div>
                      </div>
                      <div className="spec-item">
                        <div className="spec-icon">🛣️</div>
                        <div className="spec-content">
                          <span className="spec-label">Quãng đường</span>
                          <span className="spec-value">{vehicle.range}</span>
                        </div>
                      </div>
                      <div className="spec-item maintenance-item">
                        <div className="spec-icon">🔧</div>
                        <div className="spec-content">
                          <span className="spec-label">Bảo dưỡng cuối</span>
                          <span className="spec-value">
                            {vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString('vi-VN') : 'Chưa có'}
                          </span>
                        </div>
                      </div>
                      <div className="spec-item next-maintenance-item">
                        <div className="spec-icon">⏰</div>
                        <div className="spec-content">
                          <span className="spec-label">Bảo dưỡng tiếp theo</span>
                          <span className="spec-value next-service-date">
                            {new Date(vehicle.nextService).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
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
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
            })}
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
                <img src={selectedVehicle.image} alt={selectedVehicle.model} />
              </div>
              
              <div className="vehicle-full-info">
                <h3>{selectedVehicle.model}</h3>
                <div className="license-plate-large">{selectedVehicle.licensePlate}</div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <label>Năm sản xuất:</label>
                    <span>{selectedVehicle.year}</span>
                  </div>
                  <div className="info-item">
                    <label>Màu sắc:</label>
                    <span>{selectedVehicle.color}</span>
                  </div>
                  <div className="info-item">
                    <label>Dung lượng pin:</label>
                    <span>{selectedVehicle.batteryCapacity}</span>
                  </div>
                  <div className="info-item">
                    <label>Quãng đường:</label>
                    <span>{selectedVehicle.range}</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày đăng ký:</label>
                    <span>{new Date(selectedVehicle.registrationDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    {getStatusBadge(selectedVehicle.status)}
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
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Năm sản xuất: <span className="required">*</span></label>
                    <input 
                      type="number" 
                      min="2000" 
                      max="2024"
                      value={newVehicle.year}
                      onChange={(e) => handleFormChange('year', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Màu sắc: <span className="required">*</span></label>
                    <input 
                      type="text" 
                      placeholder="VD: Trắng, Đen, Đỏ"
                      value={newVehicle.color}
                      onChange={(e) => handleFormChange('color', e.target.value)}
                      required
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
