import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TechnicianDashboard.css';

const TechnicianDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="under-development-page">
      <div className="under-development-container">
        <div className="icon">🔧</div>
        <h1>Trang Technician Dashboard</h1>
        <h2>Đang phát triển</h2>
        <p className="description">
          Trang này đang trong quá trình phát triển
        </p>
        <p className="sub-description">
          Vui lòng quay lại sau
        </p>
        
        <div className="features-list">
          <h3>Tính năng sắp có:</h3>
          <ul>
            <li>📊 Thống kê công việc được giao</li>
            <li>🔧 Danh sách xe cần bảo dưỡng</li>
            <li>📝 Biên bản kiểm tra</li>
            <li>📋 Lịch sử sửa chữa</li>
            <li>🎯 Quản lý chứng chỉ</li>
          </ul>
        </div>

        <button className="back-btn" onClick={() => navigate('/technician')}>
          ← Quay lại Dashboard
        </button>
      </div>
    </div>
  );
};

export default TechnicianDashboard;