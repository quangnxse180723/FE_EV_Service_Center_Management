import React, { useState, useEffect } from 'react';
import vehicleApi from '../../../api/vehicleApi';
import './CustomerVehiclesPage.css';

const CustomerVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    licensePlate: '',
    year: new Date().getFullYear(),
    color: ''
  });
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Lấy customerId từ localStorage
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    if (customerId) {
      fetchVehicles();
    }
  }, [customerId]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleApi.getCustomerVehicles(customerId);
      console.log('✅ Vehicles loaded:', response);
      
      // axiosClient đã unwrap data
      const vehiclesData = Array.isArray(response) ? response : response?.data || [];
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      alert('Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    if (!formData.model || !formData.licensePlate) {
      alert('Vui lòng điền đầy đủ thông tin xe');
      return;
    }

    try {
      const vehicleData = {
        ...formData,
        customerId: parseInt(customerId)
      };

      await vehicleApi.createVehicle(vehicleData);
      alert('Thêm xe thành công!');
      setShowAddModal(false);
      setFormData({ model: '', licensePlate: '', year: new Date().getFullYear(), color: '' });
      fetchVehicles(); // Reload danh sách
    } catch (error) {
      console.error('❌ Error adding vehicle:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm xe');
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    
    try {
      await vehicleApi.updateVehicle(editingVehicle.vehicleId, formData);
      alert('Cập nhật xe thành công!');
      setShowAddModal(false);
      setEditingVehicle(null);
      setFormData({ model: '', licensePlate: '', year: new Date().getFullYear(), color: '' });
      fetchVehicles();
    } catch (error) {
      console.error('❌ Error updating vehicle:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật xe');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      return;
    }

    try {
      await vehicleApi.deleteVehicle(vehicleId);
      alert('Xóa xe thành công!');
      fetchVehicles();
    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa xe');
    }
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      model: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || ''
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
    setFormData({ model: '', licensePlate: '', year: new Date().getFullYear(), color: '' });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Hoạt động', class: 'status-active' },
      maintenance: { text: 'Đang bảo dưỡng', class: 'status-maintenance' },
      inactive: { text: 'Không hoạt động', class: 'status-inactive' }
    };
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap['active'];
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (!customerId) {
    return (
      <div className="vehicles-error">
        <p>Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vehicles-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách xe...</p>
      </div>
    );
  }

  return (
    <div className="customer-vehicles-page">
      <div className="vehicles-header">
        <h1>Quản lý xe của tôi</h1>
        <button className="btn-add-vehicle" onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}>
          ➕ Thêm xe mới
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="no-vehicles">
          <div className="no-vehicles-icon">🚗</div>
          <h3>Chưa có xe nào</h3>
          <p>Thêm xe của bạn để bắt đầu sử dụng dịch vụ</p>
          <button className="btn-add-first" onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}>
            Thêm xe đầu tiên
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map(vehicle => (
            <div key={vehicle.vehicleId} className="vehicle-card">
              <div className="vehicle-card-header">
                <div className="vehicle-icon">🚗</div>
                {getStatusBadge(vehicle.status)}
              </div>
              
              <div className="vehicle-info">
                <h3 className="vehicle-model">{vehicle.model}</h3>
                <div className="vehicle-plate">{vehicle.licensePlate}</div>
                
                <div className="vehicle-details">
                  {vehicle.year && (
                    <div className="detail-item">
                      <span className="detail-label">Năm sản xuất:</span>
                      <span className="detail-value">{vehicle.year}</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="detail-item">
                      <span className="detail-label">Màu sắc:</span>
                      <span className="detail-value">{vehicle.color}</span>
                    </div>
                  )}
                  {vehicle.lastMaintenance && (
                    <div className="detail-item">
                      <span className="detail-label">Bảo dưỡng cuối:</span>
                      <span className="detail-value">
                        {new Date(vehicle.lastMaintenance).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="vehicle-actions">
                <button className="btn-edit" onClick={() => openEditModal(vehicle)}>
                  ✏️ Chỉnh sửa
                </button>
                <button className="btn-delete" onClick={() => handleDeleteVehicle(vehicle.vehicleId)}>
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h2>
              <button className="btn-close-modal" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="add-vehicle-form" onSubmit={editingVehicle ? handleEditVehicle : handleAddVehicle}>
                <div className="form-group">
                  <label>Hãng xe / Model *</label>
                  <input 
                    type="text" 
                    name="model"
                    value={formData.model}
                    onChange={handleFormChange}
                    placeholder="VD: VinFast VF e34" 
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input 
                    type="text" 
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleFormChange}
                    placeholder="VD: 30A-12345" 
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Năm sản xuất</label>
                    <input 
                      type="number" 
                      name="year"
                      value={formData.year}
                      onChange={handleFormChange}
                      placeholder="2024" 
                      className="form-input"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Màu sắc</label>
                    <input 
                      type="text" 
                      name="color"
                      value={formData.color}
                      onChange={handleFormChange}
                      placeholder="Trắng" 
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    💾 {editingVehicle ? 'Cập nhật' : 'Lưu xe'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    ❌ Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerVehiclesPage;
