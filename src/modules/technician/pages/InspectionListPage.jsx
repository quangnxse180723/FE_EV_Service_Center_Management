import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInspectionReports } from '../services/technicianService';
import styles from './InspectionListPage.module.css';

export default function InspectionListPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInspectionReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInspectionReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to fetch inspection reports:', err);
        setError('Không thể tải danh sách biên bản kiểm tra. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadInspectionReports();
  }, []);

  const getStatusClass = (status) => {
    if (status === "Đã duyệt" || status === "Hoàn thành") return styles['status-approved'];
    if (status === "Chờ duyệt" || status === "Chờ nhận") return styles['status-pending'];
    if (status === "Đang kiểm tra") return styles['status-in-progress'];
    return styles['status-pending'];
  };

  const handleViewDetail = (scheduleId) => {
    navigate(`/technician/inspection/${scheduleId}`);
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
        <h1 className={styles['page-title']}>Biên bản kiểm tra</h1>
      </div>

      <div className={styles['content-card']}>
        <div className={styles['card-header']}>
          <h2>Danh sách biên bản kiểm tra</h2>
        </div>

        <div className={styles['table-wrapper']}>
          <table className={styles['tickets-table']}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Biển số xe</th>
                <th>Ngày kiểm tra</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.scheduleId || report.id}>
                    <td>{report.customerName}</td>
                    <td>{report.vehicleModel}</td>
                    <td className={styles['license-plate']}>{report.licensePlate}</td>
                    <td>{report.inspectionDate}</td>
                    <td>
                      <span className={`${styles['status-badge']} ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles['action-buttons']}>
                        <button 
                          className={styles['btn-view']} 
                          onClick={() => handleViewDetail(report.scheduleId || report.id)}
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
                    Không có biên bản kiểm tra nào
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
