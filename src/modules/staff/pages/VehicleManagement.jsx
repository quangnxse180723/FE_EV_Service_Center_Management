import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import vehicleApi from '../../../api/vehicleApi';
import './VehicleManagement.css';

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    try {
      await vehicleApi.deleteVehicle(id);
      fetchVehicles();
      alert('Xóa xe thành công');
    } catch (err) {
      console.error(err);
      alert('Xóa xe thất bại');
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
                    <button className="btn-edit">Sửa</button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(vehicle.vehicleId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleManagement;