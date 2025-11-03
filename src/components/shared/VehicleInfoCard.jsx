import React from 'react';
import './VehicleInfoCard.css';

const VehicleInfoCard = ({ vehicle, onClick, isSelected = false, showFullDetails = false }) => {
  const getVehicleImage = (vehicle) => {
    if (vehicle?.imageUrl) {
      return vehicle.imageUrl;
    }
    return 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=EV+Vehicle';
  };

  if (!vehicle) {
    return null;
  }

  return (
    <div 
      className={`vehicle-info-card ${isSelected ? 'selected' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="vehicle-image-container">
        <img 
          src={getVehicleImage(vehicle)} 
          alt={vehicle.model || 'Xe điện'}
          className="vehicle-image"
          onError={(e) => { 
            e.target.src = 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=EV+Vehicle';
          }}
        />
        {vehicle.status && (
          <span className={`vehicle-status-badge ${vehicle.status.toLowerCase()}`}>
            {vehicle.status}
          </span>
        )}
      </div>

      <div className="vehicle-details">
        <h3 className="vehicle-model">{vehicle.model || 'Xe điện'}</h3>
        
        <div className="vehicle-license-plate">
          <span className="icon">🚗</span>
          <span className="text">{vehicle.licensePlate || 'N/A'}</span>
        </div>

        {vehicle.vin && (
          <div className="vehicle-info-item">
            <span className="icon">🔑</span>
            <div className="info-content">
              <span className="label">VIN:</span>
              <span className="value">{vehicle.vin}</span>
            </div>
          </div>
        )}

        {vehicle.manufacturer && (
          <div className="vehicle-info-item">
            <span className="icon">🏭</span>
            <div className="info-content">
              <span className="label">Hãng:</span>
              <span className="value">{vehicle.manufacturer}</span>
            </div>
          </div>
        )}

        {vehicle.year && (
          <div className="vehicle-info-item">
            <span className="icon">📅</span>
            <div className="info-content">
              <span className="label">Năm:</span>
              <span className="value">{vehicle.year}</span>
            </div>
          </div>
        )}

        {vehicle.color && (
          <div className="vehicle-info-item">
            <span className="icon">🎨</span>
            <div className="info-content">
              <span className="label">Màu:</span>
              <span className="value">{vehicle.color}</span>
            </div>
          </div>
        )}

        {(vehicle.currentMileage || vehicle.mileage) && (
          <div className="vehicle-mileage">
            <span className="icon">🛣️</span>
            <div className="mileage-content">
              <span className="label">Đã chạy</span>
              <span className="value">
                {(vehicle.currentMileage || vehicle.mileage).toLocaleString()} km
              </span>
            </div>
          </div>
        )}

        {showFullDetails && vehicle.lastServiceDate && (
          <div className="vehicle-info-item">
            <span className="icon">🔧</span>
            <div className="info-content">
              <span className="label">Bảo dưỡng lần cuối:</span>
              <span className="value">
                {new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {onClick && (
        <div className="vehicle-card-footer">
          <button className="btn-select">
            {isSelected ? 'Đã chọn ✓' : 'Chọn xe này'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleInfoCard;
