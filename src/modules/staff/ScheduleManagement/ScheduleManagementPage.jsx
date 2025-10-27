import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import scheduleApi from '../../../api/scheduleApi';
import './ScheduleManagement.css';

const ScheduleManagementPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const statusClassMap = {
    'PENDING': 'status-pending',
    'CONFIRMED': 'status-confirmed',
    'IN_PROGRESS': 'status-in-progress',
    'DONE': 'status-completed',
    'COMPLETED': 'status-completed',
    'CANCELLED': 'status-cancelled'
  };

  // Gọi API lấy danh sách lịch hẹn dạng AppointmentResponse
  const fetchAppointments = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await scheduleApi.getAppointments(keyword);
      console.log('Dữ liệu API trả về:', res);
      setAppointments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu lịch hẹn:', err);
      setAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleSearch = () => {
    fetchAppointments(searchTerm.trim());
  };

  // Hành động: Check-in, Thanh toán, ...
  const handleAction = async (id, action) => {
    if (action === 'Check in') {
      await scheduleApi.updateScheduleStatus(id.replace('lh', ''), { status: 'IN_PROGRESS' });
    } else if (action === 'Thanh toán') {
      await scheduleApi.updateScheduleStatus(id.replace('lh', ''), { status: 'DONE' });
    }
    fetchAppointments(searchTerm.trim());
  };

  const statusDisplayMap = {
  'PENDING': 'Chờ xác nhận',
  'CONFIRMED': 'Đã xác nhận',
  'IN_PROGRESS': 'Đang tiến hành',
  'DONE': 'Hoàn thành',
  'COMPLETED': 'Hoàn thành',
  'CANCELLED': 'Đã hủy'
};

  return (
    <div className="schedule-management">
      <h2>Quản lý lịch hẹn</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm ..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}><FaSearch /></button>
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
              <tr><td colSpan={6}>Đang tải...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={6}>Không có dữ liệu</td></tr>
            ) : (
              appointments.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.dateTime}</td>
                  <td>{a.licensePlate}</td>
                  <td>{a.customerName}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.action && (
                      <button className="btn-checkin" onClick={() => handleAction(a.id, a.action)}>{a.action}</button>
                    )}
                    <button className="btn-detail" onClick={() => navigate(`/staff/schedules/${a.id.replace('lh', '')}`)}>Chi tiết</button>
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