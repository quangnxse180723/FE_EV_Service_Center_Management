import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import scheduleApi from '../../../api/scheduleApi';
import './ScheduleManagement.css';

const ScheduleManagementPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('customer'); // customer, vehicle, status
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Auto search when status is selected
  const handleStatusChange = (value) => {
    setSearchTerm(value);
    if (value) {
      // Tự động search khi chọn status
      searchByStatusValue(value);
    } else {
      // Reset về tất cả khi chọn "-- Chọn trạng thái --"
      fetchSchedules();
    }
  };

  const searchByStatusValue = async (status) => {
    setLoading(true);
    try {
      console.log('🔍 Searching by status:', status);
      const res = await scheduleApi.searchByStatus(status);
      console.log('✅ Search result:', res);
      console.log('✅ Result count:', Array.isArray(res) ? res.length : 0);
      setSchedules(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('❌ Error searching by status:', err);
      console.error('❌ Error response:', err.response?.data);
      alert('Không tìm thấy lịch hẹn với trạng thái: ' + status);
    }
    setLoading(false);
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.getAllSchedules();
      setSchedules(res);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách lịch hẹn');
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSchedules();
      return;
    }

    setLoading(true);
    try {
      let res;
      if (searchType === 'customer') {
        res = await scheduleApi.searchByCustomerName(searchTerm);
      } else if (searchType === 'vehicle') {
        res = await scheduleApi.searchByLicensePlate(searchTerm);
      } else if (searchType === 'status') {
        res = await scheduleApi.searchByStatus(searchTerm);
      }
      setSchedules(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error searching:', err);
      alert('Không tìm thấy lịch hẹn');
    }
    setLoading(false);
  };

  const handleCheckIn = async (id) => {
    try {
      // Backend expects English status
      await scheduleApi.updateScheduleStatus(id, { status: 'IN_PROGRESS' });
      alert('Check-in thành công');
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Check-in thất bại');
    }
  };

  const handleComplete = async (id) => {
    try {
      // Backend expects English status
      await scheduleApi.updateScheduleStatus(id, { status: 'DONE' });
      alert('Hoàn tất lịch hẹn thành công');
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Hoàn tất lịch hẹn thất bại');
    }
  };

  const getStatusClass = (status) => {
    // Map backend status (English) to CSS class
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
      case 'CHỜ XÁC NHẬN':
        return 'status-pending';
      case 'IN_PROGRESS':
      case 'ĐANG THỰC HIỆN':
        return 'status-in-progress';
      case 'DONE':
      case 'COMPLETED':
      case 'HOÀN TẤT':
        return 'status-completed';
      case 'CANCELLED':
      case 'HỦY':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    // Map backend status (English) to Vietnamese text
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'DONE':
      case 'COMPLETED':
        return 'Hoàn tất';
      case 'CANCELLED':
        return 'Hủy';
      // Fallback cho tiếng Việt
      case 'CHỜ XÁC NHẬN':
        return 'Chờ xác nhận';
      case 'ĐANG THỰC HIỆN':
        return 'Đang thực hiện';
      case 'HOÀN TẤT':
        return 'Hoàn tất';
      case 'HỦY':
        return 'Hủy';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <div className="schedule-management">
      <h2>Quản lý lịch hẹn</h2>
      
      <div className="search-bar">
        <select 
          value={searchType} 
          onChange={(e) => {
            setSearchType(e.target.value);
            setSearchTerm(''); // Reset search term khi đổi loại search
            fetchSchedules(); // Load lại tất cả schedules
          }}
          className="search-type-select"
        >
          <option value="customer">Tên khách hàng</option>
          <option value="vehicle">Biển số xe</option>
          <option value="status">Trạng thái</option>
        </select>
        
        {searchType === 'status' ? (
          <select
            value={searchTerm}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="DONE">Hoàn tất</option>
            <option value="CANCELLED">Hủy</option>
          </select>
        ) : (
          <input
            type="text"
            placeholder={
              searchType === 'customer' 
                ? 'Nhập tên khách hàng...' 
                : 'Nhập biển số xe...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        )}
        
        <button className="search-btn" onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Ngày / giờ</th>
              <th>Biển số xe</th>
              <th>Chủ xe</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Đang tải...</td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
              </tr>
            ) : (
              schedules.map((schedule) => {
                console.log('🔍 Rendering schedule:', {
                  id: schedule.scheduleId,
                  status: schedule.status,
                  fullData: schedule
                });
                return (
                <tr key={schedule.scheduleId}>
                  <td>{schedule.scheduleId}</td>
                  <td>{schedule.scheduledDate}</td>
                  <td>{schedule.licensePlate}</td>
                  <td>{schedule.customerName}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(schedule.status)}`}>
                      {schedule.status || 'Không xác định'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {(schedule.status?.toUpperCase() === 'PENDING' || schedule.status === 'Chờ xác nhận') && (
                        <button 
                          className="btn-checkin"
                          onClick={() => handleCheckIn(schedule.scheduleId)}
                        >
                          Check-in
                        </button>
                      )}
                      {(schedule.status?.toUpperCase() === 'IN_PROGRESS' || schedule.status === 'Đang thực hiện') && (
                        <button 
                          className="btn-complete"
                          onClick={() => handleComplete(schedule.scheduleId)}
                        >
                          Hoàn tất
                        </button>
                      )}
                      <button 
                        className="btn-detail"
                        onClick={() => navigate(`/staff/schedules/${schedule.scheduleId}`)}
                      >
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleManagementPage;