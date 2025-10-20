import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vehicleApi from '../../../api/vehicleApi';
import './VehicleDetailPage.css';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await vehicleApi.getVehicleById(id);
        setVehicle(data);
      } catch (err) {
        console.error(err);
        alert('Không tìm thấy xe');
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [id]);

  if (loading) return <div className="vehicle-detail-loading">Đang tải...</div>;
  if (!vehicle) return <div className="vehicle-detail-error">Không có dữ liệu xe</div>;

  return (
    <div className="vehicle-detail-page">
      <h2>Chi tiết xe</h2>
      <button className="btn-back" onClick={() => navigate(-1)}>Trở lại</button>
      <div className="vehicle-detail-card">
        <div className="vehicle-info">
          <h3>Thông tin xe:</h3>
          <div>Chủ xe: {vehicle.ownerName || 'N/A'}</div>
          <div>Xe: {vehicle.model || 'N/A'}</div>
          <div>Biển số xe: {vehicle.licensePlate || 'N/A'}</div>
          <div>VIN: {vehicle.vin || 'N/A'}</div>
        </div>
        <hr />
        <div className="vehicle-history">
          <h3>Lịch sử bảo dưỡng - sửa / chữa:</h3>
          <ul>
            {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
              vehicle.maintenanceHistory.map((item, idx) => (
                <li key={idx}>
                  {item.date}: {item.description}
                  <button className="btn-detail-history">Chi tiết</button>
                </li>
              ))
            ) : (
              <li>Chưa có lịch sử bảo dưỡng</li>
            )}
          </ul>
        </div>
        <hr />
        <div className="vehicle-status">
          <strong>Trạng thái xe: </strong>
          <span className={vehicle.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>
            {vehicle.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;