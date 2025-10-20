import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import technicianApi from '../../../api/technicianApi';
import './AssignedVehiclesPage.css';

export default function AssignedVehiclesPage() {
  const navigate = useNavigate();
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Kiểm tra authentication
    const role = localStorage.getItem('role');
    const accountId = localStorage.getItem('accountId');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    console.log('🔍 Technician Auth Check:', { role, accountId, isAuthenticated });
    
    if (!isAuthenticated || role !== 'TECHNICIAN') {
      console.log('⚠️ Not authenticated as TECHNICIAN, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    // Fetch danh sách xe được phân công
    if (accountId) {
      console.log('✅ Fetching vehicles for technician ID:', accountId);
      fetchAssignedVehicles(accountId);
    } else {
      console.log('⚠️ No accountId found in localStorage');
      setError('Không tìm thấy thông tin tài khoản');
      setLoading(false);
    }
  }, [navigate]);

  const fetchAssignedVehicles = async (technicianId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Calling API: getAssignedVehicles with ID:', technicianId);
      const data = await technicianApi.getAssignedVehicles(technicianId);
      console.log('✅ Received vehicles data:', data);
      console.log('📊 Data type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('📊 Data length:', Array.isArray(data) ? data.length : 'N/A');
      
      setAssignedVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading assigned vehicles:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
      setAssignedVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (status) => {
    setFilterStatus(status);
    const accountId = localStorage.getItem('accountId');
    
    if (!accountId) {
      console.log('⚠️ No accountId for filtering');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Filtering vehicles by status:', status);
      let data;
      if (status === 'all') {
        data = await technicianApi.getAssignedVehicles(accountId);
      } else {
        data = await technicianApi.getAssignedVehiclesByStatus(accountId, status);
      }
      
      console.log('✅ Filtered vehicles:', data);
      setAssignedVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error filtering vehicles:', err);
      setError('Không thể lọc danh sách xe. Vui lòng thử lại sau.');
      setAssignedVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'đang làm':
      case 'in_progress':
        return 'status-working';
      case 'hoàn thành':
      case 'completed':
        return 'status-completed';
      case 'chờ duyệt':
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'Đang làm';
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ nhận';
      case 'inspecting':
        return 'Đang kiểm tra';
      case 'need_parts':
        return 'Cần phụ tùng';
      default:
        return status || 'Chưa xác định';
    }
  };

  return (
    <div className="assigned-vehicles-page">
      <div className="page-header">
        <h1 className="page-title">Xe được phân công</h1>
      </div>

      {/* Content Card */}
      <div className="content-card">
        <div className="card-header">
          <h2>Danh sách xe</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách xe...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button 
              className="retry-btn"
              onClick={() => {
                const accountId = localStorage.getItem('accountId');
                if (accountId) fetchAssignedVehicles(accountId);
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && assignedVehicles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>Chưa có xe được phân công</h3>
            <p>Bạn chưa được phân công xe nào để bảo dưỡng</p>
          </div>
        )}

        {/* Vehicles Table */}
        {!loading && !error && assignedVehicles.length > 0 && (
          <div className="table-wrapper">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Xe</th>
                  <th>Biển số xe</th>
                  <th>Giờ hẹn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {assignedVehicles.map((vehicle, index) => (
                  <tr key={vehicle.id || vehicle.vehicleId || index}>
                    <td>{vehicle.customerName || 'Nguyễn Văn A'}</td>
                    <td>{vehicle.vehicleName || vehicle.vehicleModel || 'VinFast Feliz S'}</td>
                    <td className="license-plate">
                      {vehicle.licensePlate || vehicle.plateNumber || '29A-123.45'}
                    </td>
                    <td>{vehicle.appointmentTime || vehicle.scheduledTime || '8:30'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-accept" title="Xác nhận">
                          Xác nhận
                        </button>
                        <button className="btn-reject" title="Từ chối sửa chữa">
                          Từ chối sửa chữa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
