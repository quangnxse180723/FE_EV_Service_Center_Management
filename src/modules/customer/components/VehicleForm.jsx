import React, { useState } from "react";
import "./VehicleForm.css";

const VehicleForm = ({ onSubmit, initialData = {} }) => {
  const [vehicleData, setVehicleData] = useState({
    licensePlate: initialData.licensePlate || "",
    model: initialData.model || "",
    vin: initialData.vin || "",
    manufacturer: initialData.manufacturer || "",
    year: initialData.year || new Date().getFullYear(),
    color: initialData.color || "",
    km: initialData.km || "",
    imagePreview: initialData.imageUrl || null,
    imageBase64: null,
    ...initialData
  });

  const [maintenance, setMaintenance] = useState("");

  const handleKmChange = (e) => {
    const value = e.target.value;
    handleChange("km", value);
    
    if (value === "") {
      setMaintenance("");
      return;
    }
    const numKm = Number(value);
    if (numKm < 1000) {
      setMaintenance("Bảo dưỡng lần đầu");
    } else if (numKm >= 5000) {
      setMaintenance("Bảo dưỡng lần 2");
    } else {
      setMaintenance("Chưa đến kỳ bảo dưỡng tiếp theo");
    }
  };

  const handleChange = (field, value) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setVehicleData(prev => ({
            ...prev,
            imagePreview: compressedBase64,
            imageBase64: compressedBase64
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!vehicleData.licensePlate || !vehicleData.model) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (onSubmit) {
      onSubmit(vehicleData);
    }
  };

  return (
    <div className="vehicle-form-container">
      <h2>Quản lý xe của bạn</h2>
      
      <form onSubmit={handleSubmit} className="vehicle-form">
        {/* Image Upload Section */}
        <div className="form-group image-upload-section">
          <label>Ảnh xe:</label>
          <div className="image-upload-container">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="vehicle-image-upload"
            />
            <label htmlFor="vehicle-image-upload" className="image-upload-btn">
              {vehicleData.imagePreview ? (
                <img src={vehicleData.imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>Click để chọn ảnh xe</p>
                  <small>(Tối đa 2MB)</small>
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
              value={vehicleData.licensePlate}
              onChange={(e) => handleChange('licensePlate', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Model xe: <span className="required">*</span></label>
            <select 
              value={vehicleData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              required
            >
              <option value="">Chọn model xe</option>
              <option value="VinFast Feliz S">VinFast Feliz S</option>
              <option value="Yadea Ulike">Yadea Ulike</option>
              <option value="VinFast Klara S">VinFast Klara S</option>
              <option value="VinFast Impes">VinFast Impes</option>
              <option value="Honda SH">Honda SH</option>
              <option value="Yamaha NVX">Yamaha NVX</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>VIN:</label>
            <input 
              type="text" 
              placeholder="Nhập mã VIN"
              value={vehicleData.vin}
              onChange={(e) => handleChange('vin', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Hãng sản xuất:</label>
            <input 
              type="text" 
              placeholder="VD: VinFast, Yadea"
              value={vehicleData.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Năm sản xuất:</label>
            <input 
              type="number" 
              placeholder="VD: 2023"
              min="2000"
              max={new Date().getFullYear() + 1}
              value={vehicleData.year}
              onChange={(e) => handleChange('year', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Màu xe:</label>
            <input 
              type="text" 
              placeholder="VD: Đỏ, Xanh"
              value={vehicleData.color}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Số km xe đã chạy:</label>
          <input
            type="number"
            value={vehicleData.km}
            onChange={handleKmChange}
            min="0"
            placeholder="Nhập số km xe đã chạy"
          />
          {maintenance && (
            <div className="maintenance-info">
              <strong>📋 {maintenance}</strong>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Lưu thông tin xe
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
