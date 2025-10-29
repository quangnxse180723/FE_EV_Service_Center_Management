import React from 'react';
import './DashboardStats.module.css';

export default function DashboardStats(){
  return (
    <div className="dashboard-stats">
      <div className="stat">Số xe: 2</div>
      <div className="stat">Đang xử lý: 1</div>
      <div className="stat">Đã hoàn thành: 5</div>
    </div>
  );
}
