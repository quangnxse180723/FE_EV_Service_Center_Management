import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentHistoryPage.css';
import paymentApi from '../../../api/paymentApi';

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('all');

  // User info - lấy customerId từ localStorage
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    fetchPaymentHistory();
  }, [filterYear, filterStatus]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }

      // Gọi API lấy payment history từ database
      console.log('🔍 Fetching payment history for customerId:', customerId);
      const response = await paymentApi.getCustomerPaymentHistory(customerId);
      let paymentsData = Array.isArray(response) ? response : response?.data || [];
      
      console.log('✅ Payments loaded from database:', paymentsData);

      // Filter by year
      if (filterYear !== 'all') {
        paymentsData = paymentsData.filter(payment => {
          const paymentDate = new Date(payment.paymentDate || payment.date);
          return paymentDate.getFullYear() === parseInt(filterYear);
        });
      }
      
      // Filter by status
      if (filterStatus !== 'all') {
        paymentsData = paymentsData.filter(payment => 
          (payment.status || '').toLowerCase() === filterStatus.toLowerCase()
        );
      }
      
      setPayments(paymentsData);
    } catch (err) {
      console.error('❌ Error loading payment history:', err);
      setError(err.message || 'Không thể tải lịch sử thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { text: 'Đã thanh toán', class: 'status-completed' },
      'pending': { text: 'Chờ thanh toán', class: 'status-pending' },
      'failed': { text: 'Thất bại', class: 'status-failed' },
      'refunded': { text: 'Đã hoàn tiền', class: 'status-refunded' }
    };
    const statusInfo = statusMap[status] || statusMap['pending'];
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTotalSpent = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.totalAmount, 0);
  };

  const getPaymentMethodIcon = (method) => {
    const iconMap = {
      'Tiền mặt': '💵',
      'Thẻ tín dụng': '💳',
      'Chuyển khoản': '🏦',
      'Ví điện tử': '📱'
    };
    return iconMap[method] || '💳';
  };

  if (loading) {
    return (
      <div className="payment-history-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchPaymentHistory} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Quay lại
          </button>
          <div className="header-info">
            <h1>Lịch sử thanh toán</h1>
            <p>Khách hàng: {userInfo.name}</p>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Tổng đã chi:</span>
              <span className="stat-value">{formatCurrency(getTotalSpent())}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Số lần thanh toán:</span>
              <span className="stat-value">{payments.filter(p => p.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Năm:</label>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="completed">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-container">
        {payments.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có lịch sử thanh toán</h3>
            <p>Khi bạn thực hiện các dịch vụ bảo dưỡng, lịch sử sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="payments-list">
            {payments.map(payment => (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-info">
                    <h3>Hóa đơn #{payment.invoiceNumber}</h3>
                    <div className="payment-date">{new Date(payment.date).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="payment-status">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>

                <div className="payment-body">
                  <div className="vehicle-info">
                    <span className="vehicle-license">{payment.vehicleLicense}</span>
                    <span className="vehicle-model">{payment.vehicleModel}</span>
                  </div>
                  
                  <div className="service-info">
                    <div className="service-type">{payment.serviceType}</div>
                    <div className="service-center">📍 {payment.serviceCenter}</div>
                  </div>

                  <div className="payment-details">
                    <div className="cost-breakdown">
                      <div className="cost-item">
                        <span>Phụ tùng:</span>
                        <span>{formatCurrency(payment.partsCost)}</span>
                      </div>
                      <div className="cost-item">
                        <span>Nhân công:</span>
                        <span>{formatCurrency(payment.laborCost)}</span>
                      </div>
                      <div className="cost-item total">
                        <span>Tổng cộng:</span>
                        <span>{formatCurrency(payment.totalAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="payment-method">
                      {getPaymentMethodIcon(payment.paymentMethod)} {payment.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="payment-actions">
                  <button 
                    onClick={() => handleViewDetail(payment)}
                    className="detail-btn"
                  >
                    Chi tiết
                  </button>
                  <button className="download-btn">
                    Tải hóa đơn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="payment-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết thanh toán</h2>
              <button onClick={() => setSelectedPayment(null)} className="close-btn">×</button>
            </div>
            
            <div className="modal-content">
              <div className="payment-full-info">
                <div className="info-section">
                  <h3>Thông tin chung</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Số hóa đơn:</label>
                      <span>{selectedPayment.invoiceNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày thanh toán:</label>
                      <span>{new Date(selectedPayment.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="info-item">
                      <label>Phương thức:</label>
                      <span>{getPaymentMethodIcon(selectedPayment.paymentMethod)} {selectedPayment.paymentMethod}</span>
                    </div>
                    <div className="info-item">
                      <label>Trạng thái:</label>
                      {getStatusBadge(selectedPayment.status)}
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Thông tin xe</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Biển số:</label>
                      <span>{selectedPayment.vehicleLicense}</span>
                    </div>
                    <div className="info-item">
                      <label>Model:</label>
                      <span>{selectedPayment.vehicleModel}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Dịch vụ thực hiện</h3>
                  <div className="service-details">
                    <div className="service-type-detail">{selectedPayment.serviceType}</div>
                    <ul className="service-list">
                      {selectedPayment.serviceDetails.map((service, index) => (
                        <li key={index}>{service}</li>
                      ))}
                    </ul>
                    <div className="technician-info">
                      <span>Kỹ thuật viên: {selectedPayment.technician}</span>
                      <span>Trung tâm: {selectedPayment.serviceCenter}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Chi phí</h3>
                  <div className="cost-detail">
                    <div className="cost-row">
                      <span>Chi phí phụ tùng:</span>
                      <span>{formatCurrency(selectedPayment.partsCost)}</span>
                    </div>
                    <div className="cost-row">
                      <span>Chi phí nhân công:</span>
                      <span>{formatCurrency(selectedPayment.laborCost)}</span>
                    </div>
                    <div className="cost-row total-row">
                      <span>Tổng thanh toán:</span>
                      <span>{formatCurrency(selectedPayment.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}