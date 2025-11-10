import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchServiceTickets } from '../services/technicianService';
import styles from './ServiceTicketsPage.module.css';

export default function ServiceTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadServiceTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchServiceTickets();
        setTickets(data);
      } catch (err) {
        console.error('Failed to fetch service tickets:', err);
        setError('Không thể tải danh sách phiếu dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadServiceTickets();
  }, []);

  const getStatusClass = (status) => {
    if (status === "Đã duyệt" || status === "Hoàn thành") return styles['status-approved'];
    if (status === "Chờ duyệt" || status === "Chờ nhận") return styles['status-pending'];
    if (status === "Đang kiểm tra") return styles['status-in-progress'];
    return styles['status-pending'];
  };

  const handleViewDetail = (ticketId) => {
    navigate(`/technician/services/${ticketId}`);
  };

  const handleUpdateStatus = (ticketId) => {
    console.log("Update status for ticket:", ticketId);
    // TODO: Implement status update logic
  };

  if (loading) {
    return (
      <div className={styles['service-tickets-page']}>
        <div className={styles['loading']}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['service-tickets-page']}>
        <div className={styles['error-container']}>
          <div className={styles['error-message']}>{error}</div>
          <button 
            className={styles['retry-btn']} 
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['service-tickets-page']}>
      <div className={styles['page-header']}>
        <h1 className={styles['page-title']}>Phiếu dịch vụ</h1>
      </div>

      <div className={styles['content-card']}>
        <div className={styles['card-header']}>
          <h2>Danh sách phiếu dịch vụ</h2>
        </div>

        <div className={styles['table-wrapper']}>
          <table className={styles['tickets-table']}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Biển số xe</th>
                <th>Giờ bắt đầu</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.scheduleId || ticket.id}>
                    <td>{ticket.customerName}</td>
                    <td>{ticket.vehicleModel}</td>
                    <td className={styles['license-plate']}>{ticket.licensePlate}</td>
                    <td>{ticket.startTime}</td>
                    <td>
                      <span className={`${styles['status-badge']} ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles['action-buttons']}>
                        <button 
                          className={styles['btn-view']} 
                          onClick={() => handleViewDetail(ticket.scheduleId || ticket.id)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Không có phiếu dịch vụ nào
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

