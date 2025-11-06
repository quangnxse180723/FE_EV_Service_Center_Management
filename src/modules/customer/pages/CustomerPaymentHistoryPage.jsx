import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentApi from '../../../api/paymentApi';
import './CustomerPaymentHistoryPage.css';

const CustomerPaymentHistoryPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const customerId = localStorage.getItem('userId');
      
      if (!customerId) {
        setError('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      const response = await paymentApi.getCustomerPaymentHistory(customerId);
      
      // Response trả về data.data hoặc data
      const paymentData = response.data?.data || response.data || [];
      setPayments(paymentData);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử thanh toán');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CHO_THANH_TOAN': { text: 'Chờ thanh toán', class: 'status-pending' },
      'PENDING': { text: 'Chờ thanh toán', class: 'status-pending' },
      'DA_THANH_TOAN': { text: 'Đã thanh toán', class: 'status-paid' },
      'PAID': { text: 'Đã thanh toán', class: 'status-paid' },
      'COMPLETED': { text: 'Đã thanh toán', class: 'status-paid' },
      'HUY': { text: 'Đã hủy', class: 'status-cancelled' },
      'CANCELLED': { text: 'Đã hủy', class: 'status-cancelled' },
    };

    const config = statusConfig[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const handleViewInvoice = (payment) => {
    // Điều hướng đến trang chi tiết hóa đơn hoặc mở modal
    if (payment.invoiceId) {
      navigate(`/customer/invoice/${payment.invoiceId}`);
    } else if (payment.scheduleId) {
      navigate(`/customer/payment/${payment.scheduleId}`);
    }
  };

  if (loading) {
    return (
      <div className="payment-history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải lịch sử thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchPaymentHistory} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="payment-history-header">
        <h1>Lịch sử thanh toán</h1>
        <p className="subtitle">Quản lý các giao dịch thanh toán của bạn</p>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>Chưa có lịch sử thanh toán</h3>
          <p>Bạn chưa thực hiện giao dịch thanh toán nào</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="payment-history-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Biển số xe</th>
                <th>Giờ hẹn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td>{payment.customerName || 'Customer'}</td>
                  <td>{payment.vehicleModel || payment.vehicleName || 'N/A'}</td>
                  <td>{payment.licensePlate || payment.vehiclePlate || 'N/A'}</td>
                  <td>{formatDateTime(payment.appointmentTime || payment.scheduleTime || payment.createdAt)}</td>
                  <td>{getStatusBadge(payment.status || payment.paymentStatus)}</td>
                  <td>
                    <button 
                      className="action-btn view-invoice-btn"
                      onClick={() => handleViewInvoice(payment)}
                    >
                      Xem hóa đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentHistoryPage;
