import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceTicketDetail, confirmItemCompletion, completeSchedule } from '../services/technicianService';
import styles from './ServiceTicketDetailPage.module.css';

export default function ServiceTicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API lấy chi tiết phiếu dịch vụ
      console.log('🔍 Fetching ticket detail for ID:', ticketId);
      const data = await getServiceTicketDetail(ticketId);
      console.log('✅ Received ticket data:', data);
      console.log('📋 Items in ticket:', data.items);
      console.log('📊 Items length:', data.items?.length || 0);
      setTicket(data);
    } catch (err) {
      console.error('❌ Failed to fetch service ticket detail:', err);
      setError('Không thể tải thông tin phiếu dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId]);
  
  // Xác nhận hoàn thành một item
  const handleConfirmItem = async (itemId) => {
    try {
      await confirmItemCompletion(itemId);
      alert('Đã xác nhận hoàn thành hạng mục!');
      // Reload data
      await fetchTicketDetail();
    } catch (err) {
      console.error('Error confirming item:', err);
      alert('Lỗi khi xác nhận: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Xác nhận hoàn thành toàn bộ lịch hẹn
  const handleCompleteSchedule = async () => {
    if (!window.confirm('Bạn chắc chắn đã hoàn thành tất cả công việc?')) return;
    
    try {
      await completeSchedule(ticketId);
      alert('Đã xác nhận hoàn thành lịch hẹn!');
      // Chuyển về trang danh sách phiếu dịch vụ
      navigate('/technician/services');
    } catch (err) {
      console.error('Error completing schedule:', err);
      alert('Lỗi khi xác nhận: ' + (err.response?.data?.message || err.message));
    }
  };


  if (loading) {
    return <div className={styles['loading']}>Đang tải...</div>;
  }

  if (error) {
    return (
      <div className={styles['error-container']}>
        <div className={styles['error-message']}>{error}</div>
        <button 
          className={styles['retry-btn']} 
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!ticket) {
    return <div className={styles['loading']}>Không tìm thấy phiếu dịch vụ.</div>;
  }

  return (
    <div className={styles['detail-page']}>
      {/* Header */}
      <div className={styles['page-header']}>
        <button className={styles['back-btn']} onClick={() => navigate('/technician/services')}>
          ← Quay lại
        </button>
        <h1 className={styles['page-title']}>Chi tiết phiếu dịch vụ</h1>
      </div>

      {/* Customer & Vehicle Info Card */}
      <div className={styles['info-card']}>
        <div className={styles['card-header']}>
          <h2>Thông tin chung</h2>
        </div>
        <div className={styles['card-body']}>
          <div className={styles['info-grid']}>
            <div className={styles['info-item']}>
              <span className={styles['label']}>Tên khách hàng:</span>
              <span className={styles['value']}>{ticket.customerName}</span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['label']}>Tên xe:</span>
              <span className={styles['value']}>{ticket.vehicleName}</span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['label']}>Biển số xe:</span>
              <span className={styles['value license-plate']}>{ticket.licensePlate}</span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['label']}>Ngày giờ hẹn:</span>
              <span className={styles['value']}>{ticket.appointmentDateTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Items List Card */}
      <div className={styles['info-card']}>
        <div className={styles['card-header']}>
          <h2>Danh sách hạng mục kiểm tra</h2>
        </div>
        <div className={styles['card-body']}>
          <table className={styles['detail-table']}>
            <thead>
              <tr>
                <th>Mã vật tư</th>
                <th>Tên phụ tùng</th>
                <th>Giá vật tư (₫)</th>
                <th>Nhân công (₫)</th>
                <th>Trạng thái xử lý</th>
                <th>Tiến trình</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {ticket.items && ticket.items.length > 0 ? (
                ticket.items.map((item, index) => {
                  // Tính giá vật tư = partCost + 10%
                  const partPrice = item.partCost ? item.partCost * 1.1 : 0;
                  
                  return (
                    <tr key={item.stt || index}>
                      <td>
                        <span className={styles['part-code']}>
                          {item.partCode || 'N/A'}
                        </span>
                      </td>
                      <td>{item.partName}</td>
                      <td className={styles['price-cell']}>
                        <span className={styles['price-value']}>
                          {partPrice ? partPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : '0'}
                        </span>
                      </td>
                      <td className={styles['price-cell']}>
                        <span className={styles['price-value']}>
                          {item.laborCost ? item.laborCost.toLocaleString('vi-VN') : '0'}
                        </span>
                      </td>
                      <td>
                        <span className={styles['action-status']}>
                          {item.actionStatus || 'Chưa xác định'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles['status-badge']} ${item.processStatus === 'DONE' || item.processStatus === 'Hoàn thành' ? styles['status-approved'] : styles['status-pending']}`}>
                          {item.processStatus || 'Chưa xử lý'}
                        </span>
                      </td>
                      <td>
                        {item.processStatus !== 'DONE' && item.processStatus !== 'Hoàn thành' ? (
                          <button 
                            className={styles['confirm-btn']}
                            onClick={() => handleConfirmItem(item.stt)}
                          >
                            Xác nhận
                          </button>
                        ) : (
                          <span className={styles['completed-text']}>✓ Đã hoàn thành</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    ⚠️ Chưa có hạng mục kiểm tra nào. Vui lòng kiểm tra xem lịch hẹn này đã được gán gói bảo dưỡng chưa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Complete Schedule Button */}
      <div className={styles['complete-section']}>
        <button 
          className={styles['complete-btn']}
          onClick={handleCompleteSchedule}
        >
          Xác nhận hoàn tất bảo dưỡng
        </button>
      </div>
    </div>
  );
}

