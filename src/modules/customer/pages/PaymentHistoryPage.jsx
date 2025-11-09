import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentHistoryPage.css';
import paymentApi from '../../../api/paymentApi';
import HeaderHome from '../../../components/layout/HeaderHome';

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User info - lấy customerId từ localStorage (không phải userId!)
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        setLoading(false);
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }

      // Gọi API lấy payment history từ database
      console.log('🔍 Fetching payment history for customerId:', customerId);
      const response = await paymentApi.getCustomerPaymentHistory(customerId);
      
      console.log('📦 Raw API response:', response);
      
      // Response có thể là response.data hoặc response.data.data
      let paymentsData = [];
      if (Array.isArray(response)) {
        paymentsData = response;
      } else if (Array.isArray(response?.data)) {
        paymentsData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        paymentsData = response.data.data;
      }
      
      console.log('✅ Payments loaded from database:', paymentsData);
      
      // Debug: Log từng payment để kiểm tra status
      if (paymentsData.length > 0) {
        console.log('📋 Sample payment data:', paymentsData[0]);
        paymentsData.forEach((payment, idx) => {
          console.log(`Payment ${idx + 1} status: "${payment.status}"`);
        });
      }
      
      setPayments(paymentsData);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading payment history:', err);
      setError(err.message || 'Không thể tải lịch sử thanh toán. Vui lòng thử lại.');
      setPayments([]);
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
    if (!status) return <span className="status-badge status-unknown">N/A</span>;
    
    // Normalize status to handle case variations
    const statusNormalized = status.toString().toLowerCase().trim();
    
    const statusConfig = {
      // Chờ thanh toán
      'chờ thanh toán': { text: 'Chờ thanh toán', class: 'status-pending' },
      'cho_thanh_toan': { text: 'Chờ thanh toán', class: 'status-pending' },
      'pending': { text: 'Chờ thanh toán', class: 'status-pending' },
      'unpaid': { text: 'Chờ thanh toán', class: 'status-pending' },
      'new': { text: 'Chờ thanh toán', class: 'status-pending' },
      'pending_payment': { text: 'Chờ thanh toán', class: 'status-pending' },
      
      // Đã thanh toán
      'đã thanh toán': { text: 'Đã thanh toán', class: 'status-paid' },
      'da_thanh_toan': { text: 'Đã thanh toán', class: 'status-paid' },
      'paid': { text: 'Đã thanh toán', class: 'status-paid' },
      'completed': { text: 'Đã thanh toán', class: 'status-paid' },
      
      // Đã hủy
      'đã hủy': { text: 'Đã hủy', class: 'status-cancelled' },
      'huy': { text: 'Đã hủy', class: 'status-cancelled' },
      'cancelled': { text: 'Đã hủy', class: 'status-cancelled' },
      'canceled': { text: 'Đã hủy', class: 'status-cancelled' },
    };

    const config = statusConfig[statusNormalized] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const handleViewInvoice = (payment) => {
    // Điều hướng đến trang chi tiết hóa đơn
    if (payment.scheduleId) {
      navigate(`/customer/payment/${payment.scheduleId}`);
    } else if (payment.invoiceId) {
      navigate(`/customer/payment/${payment.invoiceId}`);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderHome />
        <div className="payment-history-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải lịch sử thanh toán...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderHome />
        <div className="payment-history-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchPaymentHistory} className="retry-btn">
              Thử lại
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderHome />
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
              {payments.map((payment, index) => (
                <tr key={payment.paymentId || payment.scheduleId || index}>
                  <td>{payment.customerName || 'Customer'}</td>
                  <td>{payment.vehicleName || payment.vehicleModel || 'N/A'}</td>
                  <td>{payment.licensePlate || payment.vehiclePlate || 'N/A'}</td>
                  <td>{formatDateTime(payment.scheduledDate || payment.appointmentTime || payment.scheduleTime || payment.createdAt)}</td>
                  <td>{getStatusBadge(payment.status)}</td>
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
    </>
  );
}