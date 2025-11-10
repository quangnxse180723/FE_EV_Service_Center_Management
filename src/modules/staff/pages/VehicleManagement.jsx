import React, { useEffect, useState } from 'react';
import { FaSearch, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import vehicleApi from '../../../api/vehicleApi';
import './VehicleManagement.css';

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State cho modal sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editForm, setEditForm] = useState({
    model: '',
    licensePlate: '',
    manufactureYear: '',
    vin: '',
    mileage: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.getAllVehicles();
      setVehicles(res);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách xe');
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!searchTerm.trim()) {
        fetchVehicles();
      } else {
        const res = await vehicleApi.searchVehicles(searchTerm);
        setVehicles(res);
      }
    } catch (err) {
      console.error(err);
      alert('Không tìm thấy xe');
    }
    setLoading(false);
  };

  // Mở modal sửa
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditForm({
      model: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
      manufactureYear: vehicle.manufactureYear || '',
      vin: vehicle.vin || '',
      mileage: vehicle.mileage || ''
    });
    setShowEditModal(true);
  };

  // Đóng modal
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingVehicle(null);
    setEditForm({
      model: '',
      licensePlate: '',
      manufactureYear: '',
      vin: '',
      mileage: ''
    });
  };

  // Lưu thay đổi
  const handleSaveEdit = async () => {
    if (!editForm.model || !editForm.licensePlate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên xe và Biển số xe)');
      return;
    }

    // Validate biển số xe
    const licensePlateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/;
    if (!licensePlateRegex.test(editForm.licensePlate)) {
      alert('Biển số xe không hợp lệ (Định dạng: 12A-12345)!');
      return;
    }

    // Validate năm sản xuất (nếu có nhập)
    if (editForm.manufactureYear && (editForm.manufactureYear < 1900 || editForm.manufactureYear > new Date().getFullYear())) {
      alert('Năm sản xuất không hợp lệ!');
      return;
    }

    // Validate số km (nếu có nhập)
    if (editForm.mileage && (isNaN(editForm.mileage) || editForm.mileage < 0)) {
      alert('Số km đi được không hợp lệ!');
      return;
    }

    try {
      setLoading(true);
      await vehicleApi.updateVehicle(editingVehicle.vehicleId, editForm);
      alert('Cập nhật thông tin xe thành công!');
      handleCancelEdit();
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-management">
      <h2>Quản lý xe</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm ..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>
      <div className="table-container">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Xe</th>
              <th>Biển số xe</th>
              <th>Chủ xe</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Đang tải...</td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
              </tr>
            ) : (
              vehicles.map(vehicle => (
                <tr key={vehicle.vehicleId}>
                  <td>{vehicle.vehicleId}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.licensePlate}</td>
                  <td>{vehicle.customerName}</td>
                  <td>
                    <button 
                      className="btn-detail"
                      onClick={() => navigate(`/staff/vehicles/${vehicle.vehicleId}`)}
                    >
                      Chi tiết
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <FaEdit /> Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal sửa thông tin xe */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chỉnh sửa thông tin xe</h3>
            
            <div className="form-group">
              <label>Tên xe <span className="required">*</span></label>
              <input
                type="text"
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                placeholder="Nhập tên xe"
              />
            </div>

            <div className="form-group">
              <label>Biển số xe <span className="required">*</span></label>
              <input
                type="text"
                value={editForm.licensePlate}
                onChange={(e) => setEditForm({ ...editForm, licensePlate: e.target.value })}
                placeholder="Ví dụ: 12A-12345"
              />
            </div>

            <div className="form-group">
              <label>Năm sản xuất</label>
              <input
                type="number"
                value={editForm.manufactureYear}
                onChange={(e) => setEditForm({ ...editForm, manufactureYear: e.target.value })}
                placeholder="Ví dụ: 2023"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label>Số VIN</label>
              <input
                type="text"
                value={editForm.vin}
                onChange={(e) => setEditForm({ ...editForm, vin: e.target.value })}
                placeholder="Nhập số VIN"
              />
            </div>

            <div className="form-group">
              <label>Số km đi được</label>
              <input
                type="number"
                value={editForm.mileage}
                onChange={(e) => setEditForm({ ...editForm, mileage: e.target.value })}
                placeholder="Nhập số km"
                min="0"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button className="btn-cancel-modal" onClick={handleCancelEdit} disabled={loading}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;