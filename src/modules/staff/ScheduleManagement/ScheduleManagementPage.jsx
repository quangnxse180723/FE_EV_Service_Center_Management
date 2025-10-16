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
      setSchedules(res);
    } catch (err) {
      console.error(err);
      alert('Không tìm thấy lịch hẹn');
    }
    setLoading(false);
  };

  const handleCheckIn = async (id) => {
    try {
      await scheduleApi.updateScheduleStatus(id, { status: 'Đang thực hiện' });
      alert('Check-in thành công');
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Check-in thất bại');
    }
  };

  const handleComplete = async (id) => {
    try {
      await scheduleApi.updateScheduleStatus(id, { status: 'Hoàn tất' });
      alert('Hoàn tất lịch hẹn thành công');
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert('Hoàn tất lịch hẹn thất bại');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'status-pending';
      case 'Đang thực hiện':
        return 'status-in-progress';
      case 'Hoàn tất':
        return 'status-completed';
      case 'Hủy':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'Chờ xác nhận';
      case 'Đang thực hiện':
        return 'Đang thực hiện';
      case 'Hoàn tất':
        return 'Hoàn tất';
      case 'Hủy':
        return 'Hủy';
      default:
        return status;
    }
  };

  return (
    <div className="schedule-management">
      <h2>Quản lý lịch hẹn</h2>
      
      <div className="search-bar">
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type-select"
        >
          <option value="customer">Tên khách hàng</option>
          <option value="vehicle">Biển số xe</option>
          <option value="status">Trạng thái</option>
        </select>
        <input
          type="text"
          placeholder="Tìm kiếm ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
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
              schedules.map((schedule) => (
                <tr key={schedule.scheduleId}>
                  <td>{schedule.scheduleId}</td>
                  <td>{schedule.scheduledDate}</td>
                  <td>{schedule.licensePlate}</td>
                  <td>{schedule.customerName}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(schedule.status)}`}>
                      {getStatusText(schedule.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {schedule.status === 'Chờ xác nhận' && (
                        <button 
                          className="btn-checkin"
                          onClick={() => handleCheckIn(schedule.scheduleId)}
                        >
                          Check-in
                        </button>
                      )}
                      {schedule.status === 'Đang thực hiện' && (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleManagementPage;