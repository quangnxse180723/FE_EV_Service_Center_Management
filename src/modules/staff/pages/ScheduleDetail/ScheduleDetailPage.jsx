import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import scheduleApi from '../../../../api/scheduleApi';
import technicianApi from '../../../../api/technicianApi';
import './ScheduleDetailPage.css';

const ScheduleDetailPage = () => {
  const { scheduleId: id} = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);

  // Fetch data on component mount and when ID changes
  useEffect(() => {
    fetchScheduleDetail();
    fetchTechnicians();
  }, [id]);

  const fetchScheduleDetail = async () => {
    setLoading(true);
    try {
      // The axios interceptor already returns response.data, so we use the result directly.
      const scheduleData = await scheduleApi.getScheduleById(id);
      setSchedule(scheduleData);
    } catch (err) {
      console.error('Error fetching schedule details:', err);
      alert('Không tìm thấy lịch hẹn');
    }
    setLoading(false);
  };

  const fetchTechnicians = async () => {
    try {
      const techniciansData = await technicianApi.getAllTechnicians();
      console.log('--- Technician Data From API (Post-Backend-Fix) ---', JSON.stringify(techniciansData, null, 2));
      
      // The API now provides technicianId directly, no mapping needed.
      if (Array.isArray(techniciansData)) {
        setTechnicians(techniciansData);
      } else {
        setTechnicians([]);
      }

    } catch (err) {
      console.error('Error fetching technicians:', err);
      alert('Không thể tải danh sách kỹ thuật viên');
    }
  };

  // Simplified: Assign technician and update status in one go
  const handleAssignTechnician = async () => {
    if (!selectedTechnician) {
      alert('Vui lòng chọn kỹ thuật viên');
      return;
    }
    const techId = Number(selectedTechnician);
    if (isNaN(techId) || !Number.isInteger(techId)) {
      alert('ID kỹ thuật viên không hợp lệ!');
      return;
    }

    try {
      // 1. Assign technician
      await scheduleApi.assignTechnician(id, { technicianId: techId });
      
      // 2. Update status to IN_PROGRESS
      await scheduleApi.updateScheduleStatus(id, { status: 'IN_PROGRESS' });
      
      alert('Đã phân công thành công!');
      
      // 3. Close modal and refresh data on the page
      setShowTechnicianModal(false);
      fetchScheduleDetail(); // Re-fetch to show updated info

    } catch (err) {
      console.error('Lỗi phân công:', err.response?.data || err.message);
      alert('Phân công thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    try {
      await scheduleApi.updateScheduleStatus(id, { status: 'CANCELLED' });
      alert('Hủy lịch hẹn thành công');
      fetchScheduleDetail(); // Refresh data
    } catch (err) {
      console.error('Error cancelling schedule:', err);
      alert('Hủy lịch hẹn thất bại');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Xác nhận hoàn tất lịch hẹn?')) return;
    try {
      await scheduleApi.updateScheduleStatus(id, { status: 'COMPLETED' });
      alert('Hoàn tất lịch hẹn thành công');
      fetchScheduleDetail(); // Refresh data
    } catch (err) {
      console.error('Error completing schedule:', err);
      alert('Hoàn tất lịch hẹn thất bại');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ check-in';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn tất';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!schedule) return <div className="error">Không có dữ liệu</div>;

  return (
    <div className="schedule-detail-page">
      <div className="detail-header">
        <h2>Chi tiết</h2>
        <button className="btn-back" onClick={() => navigate(-1)}>
          Trở lại
        </button>
      </div>

      <div className="detail-card">
        <h2 className="card-title">Chi tiết lịch hẹn</h2>

        <div className="detail-info">
          <div className="info-row">
            <span className="info-icon">👤</span>
            <span className="info-label">Chủ xe:</span>
            <span className="info-value">{schedule.customerName || 'Customer'}</span>
          </div>
          
          <div className="info-row">
            <span className="info-icon">🚗</span>
            <span className="info-label">Xe:</span>
            <span className="info-value">{schedule.vehicleModel || 'N/A'}</span>
          </div>
          
          <div className="info-row">
            <span className="info-icon">📅</span>
            <span className="info-label">Ngày /giờ</span>
            <span className="info-value">{schedule.scheduledDate || 'N/A'}</span>
          </div>
          
          <div className="info-row status-row">
            <span className="info-icon">📋</span>
            <div className="status-content">
              <span className="info-label"><strong>Trạng thái: </strong>{getStatusText(schedule.status)}</span>
              <div className="info-row">
            <strong>Kỹ thuật viên phụ trách:</strong>{' '}
            {schedule.technicianName || '(chưa phân công)'}
          </div>
            </div>
          </div>
        
        </div>

        <div className="actions-section">
          {schedule.status === 'PENDING' && (
            <>
              <button className="btn-complete" onClick={() => setShowTechnicianModal(true)}>
                Phân công
              </button>
              <button className="btn-cancel-outline" onClick={handleCancel}>
                Hủy
              </button>
            </>
          )}

          {schedule.status === 'IN_PROGRESS' && (
            <>
              <button className="btn-complete" onClick={handleComplete}>
                Hoàn tất
              </button>
              <button className="btn-cancel-outline" onClick={handleCancel}>
                Hủy
              </button>
            </>
          )}

          {schedule.status === 'COMPLETED' && (
            <>
              <button className="btn-complete" disabled>Hoàn tất</button>
              <button className="btn-cancel-outline" disabled>Hủy</button>
            </>
          )}
          
          {schedule.status === 'CANCELLED' && (
            <>
              <button className="btn-complete" disabled>Hoàn tất</button>
              <button className="btn-cancel-outline" disabled>Hủy</button>
            </>
          )}
        </div>
      </div>

      {/* Simplified Modal for Technician Assignment */}
      {showTechnicianModal && (
        <div className="modal-overlay" onClick={() => setShowTechnicianModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chọn và phân công kỹ thuật viên</h3>
            <select 
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="technician-select"
              autoFocus
            >
              <option value="">-- Chọn kỹ thuật viên --</option>
              {technicians.map((tech) => (
                <option key={tech.technicianId} value={tech.technicianId}>
                  {tech.fullName}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleAssignTechnician}>
                Xác nhận Phân công
              </button>
              <button className="btn-close" onClick={() => setShowTechnicianModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDetailPage;