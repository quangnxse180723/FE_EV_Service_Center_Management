import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import scheduleApi from '../../../../api/scheduleApi';
import technicianApi from '../../../../api/technicianApi';
import './ScheduleDetailPage.css';

const ScheduleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);

  useEffect(() => {
    fetchScheduleDetail();
    fetchTechnicians();
  }, [id]);

  const fetchScheduleDetail = async () => {
    try {
      const data = await scheduleApi.getScheduleById(id);
      setSchedule(data);
    } catch (err) {
      console.error(err);
      alert('Không tìm thấy lịch hẹn');
    }
    setLoading(false);
  };

  const fetchTechnicians = async () => {
    try {
      const data = await technicianApi.getAllTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      alert('Không thể tải danh sách kỹ thuật viên');
    }
  };

  // ✅ Hàm chọn kỹ thuật viên (chỉ chọn, chưa phân công)
  const handleSelectTechnician = () => {
    if (!selectedTechnician) {
      alert('Vui lòng chọn kỹ thuật viên');
      return;
    }

    // Đóng modal
    setShowTechnicianModal(false);
    alert('Đã chọn kỹ thuật viên. Vui lòng ấn nút "Phân công Technician" để xác nhận.');
  };

  // ✅ Hàm phân công và chuyển PENDING → IN_PROGRESS
  const handleAssignTechnician = async () => {
    if (!selectedTechnician) {
      alert('Vui lòng chọn kỹ thuật viên trước');
      setShowTechnicianModal(true);
      return;
    }

    try {
      // Gọi API gán technician và chuyển trạng thái sang IN_PROGRESS
      await scheduleApi.assignTechnician(id, {
        technicianId: selectedTechnician,
        status: 'IN_PROGRESS'
      });
      
      alert('Đã phân công thành công');
      
      // ✅ Chuyển về trang quản lý lịch hẹn
      navigate('/staff/schedules');
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      alert('Phân công thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;

    try {
      await scheduleApi.updateScheduleStatus(id, { status: 'CANCELLED' });
      alert('Hủy lịch hẹn thành công');
      navigate('/staff/schedules');
    } catch (err) {
      console.error(err);
      alert('Hủy lịch hẹn thất bại');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Xác nhận hoàn tất lịch hẹn?')) return;

    try {
      await scheduleApi.updateScheduleStatus(id, { status: 'COMPLETED' });
      alert('Hoàn tất lịch hẹn thành công');
      navigate('/staff/schedules');
    } catch (err) {
      console.error(err);
      alert('Hoàn tất lịch hẹn thất bại');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ check-in';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn tất';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // ✅ Tìm tên technician đã chọn
  const getSelectedTechnicianName = () => {
    const tech = technicians.find(t => t.technicianId === parseInt(selectedTechnician));
    return tech ? tech.fullName : null;
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
        <div className="detail-info">
          <div className="info-row">
            <strong>Chủ xe:</strong> {schedule.customerName || 'N/A'}
          </div>
          <div className="info-row">
            <strong>Xe:</strong> {schedule.vehicleModel || 'N/A'}
          </div>
          <div className="info-row">
            <strong>Biển số xe:</strong> {schedule.licensePlate || 'N/A'}
          </div>
          <div className="info-row">
            <strong>Ngày / giờ:</strong> {schedule.scheduledDate || 'N/A'}
          </div>
        </div>

        <hr />

        <div className="status-section">
          <div className="info-row">
            <strong>Trạng thái:</strong> {getStatusText(schedule.status)}
          </div>
          <div className="info-row">
            <strong>Kỹ thuật viên phụ trách:</strong>{' '}
            {schedule.technicianName || getSelectedTechnicianName() || '(chưa phân công)'}
          </div>
        </div>

        <hr />

        <div className="actions-section">
          <h4>Biên bản sửa chữa:</h4>
          
          {/* PENDING: Hiển thị nút Chọn và Hủy */}
          {schedule.status === 'PENDING' && (
            <>
              <button 
                className="btn-assign"
                onClick={() => setShowTechnicianModal(true)}
              >
                Chọn
              </button>
              <button 
                className="btn-cancel"
                onClick={handleCancel}
              >
                Hủy
              </button>
            </>
          )}

          {/* IN_PROGRESS: Hiển thị Chi tiết, Hoàn tất, Hủy */}
          {schedule.status === 'IN_PROGRESS' && (
            <>
              <button className="btn-detail">Chi tiết</button>
              <button 
                className="btn-complete"
                onClick={handleComplete}
              >
                Hoàn tất
              </button>
              <button 
                className="btn-cancel"
                onClick={handleCancel}
              >
                Hủy
              </button>
            </>
          )}

          {/* COMPLETED: Chỉ hiển thị Chi tiết */}
          {schedule.status === 'COMPLETED' && (
            <button className="btn-detail">Chi tiết</button>
          )}
        </div>

        {/* ✅ Nút "Phân công Technician" - CHỈ HIỆN KHI PENDING */}
        {schedule.status === 'PENDING' && (
          <>
            <hr />
            <div className="technician-section">
              <button 
                className="btn-assign-tech"
                onClick={handleAssignTechnician}
              >
                Phân công Technician
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal chọn kỹ thuật viên */}
      {showTechnicianModal && (
        <div className="modal-overlay" onClick={() => setShowTechnicianModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chọn kỹ thuật viên</h3>
            <select 
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="technician-select"
            >
              <option value="">-- Chọn kỹ thuật viên --</option>
              {technicians.map((tech) => (
                <option key={tech.technicianId} value={tech.technicianId}>
                  {tech.fullName}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleSelectTechnician}>
                Xác nhận
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