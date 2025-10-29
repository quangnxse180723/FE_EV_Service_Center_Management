import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceTicketDetail } from '../services/technicianService';
import styles from './ServiceTicketDetailPage.module.css';

export default function ServiceTicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Gọi API lấy chi tiết phiếu dịch vụ
        const data = await getServiceTicketDetail(ticketId);
        setTicket(data);
      } catch (err) {
        console.error('Failed to fetch service ticket detail:', err);
        setError('Không thể tải thông tin phiếu dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [ticketId]);

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
                <th>STT</th>
                <th>Tên phụ tùng</th>
                <th>Trạng thái xử lý</th>
                <th>Tiến trình</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {ticket.items && ticket.items.length > 0 ? (
                ticket.items.map((item, index) => (
                  <tr key={item.stt || index}>
                    <td>{item.stt}</td>
                    <td>{item.partName}</td>
                    <td>
                      <span className={styles['action-status']}>
                        {item.actionStatus || 'Chưa xác định'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles['status-badge']} ${item.processStatus === 'Hoàn thành' ? styles['status-approved'] : styles['status-pending']}`}>
                        {item.processStatus || 'Chưa xử lý'}
                      </span>
                    </td>
                    <td>
                      <span className={styles['confirm-action']}>
                        {item.confirmAction || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    Chưa có hạng mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

