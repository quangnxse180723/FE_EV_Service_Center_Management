import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentApi from '../../../api/paymentApi';
import './PaymentManagementPage.css';

const PaymentManagementPage = () => {
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await paymentApi.getAllPaymentsForManagement();
      setPayments(data);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      alert('Không thể tải danh sách thanh toán');
    }
  };

  const handleShowInvoice = (scheduleId) => {
    navigate(`/staff/payments/${scheduleId}`);
  };

  return (
    <div className="payment-management-page">
      <h2>Quản lý thanh toán</h2>
      <table className="invoice-table">
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
            <tr key={index}>
              <td>{payment.customerName}</td>
              <td>{payment.vehicleName}</td>
              <td>{payment.licensePlate}</td>
              <td>{payment.scheduledDate}</td>
              <td>
                {payment.status === 'PAID' ? (
                  <span className="status-paid">Đã thanh toán</span>
                ) : (
                  <span className="status-waiting">Chờ thanh toán</span>
                )}
              </td>
              <td>
                <button className="btn-view" onClick={() => handleShowInvoice(payment.scheduleId)}>
                  Xem hóa đơn
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentManagementPage;
