import React, { useEffect, useState } from 'react';
import paymentApi from '../../../api/paymentApi';
import './PaymentManagementPage.css';
import InvoiceDetailModal from './InvoiceDetailModal';

const PaymentManagementPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await paymentApi.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      alert('Không thể tải danh sách hóa đơn');
    }
  };

  const handleShowInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
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
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.customerName}</td>
              <td>{inv.vehicleName}</td>
              <td>{inv.licensePlate}</td>
              <td>{inv.appointmentTime}</td>
              <td>
                {inv.status === 'PAID' ? (
                  <span className="status-paid">Đã thanh toán</span>
                ) : (
                  <span className="status-waiting">Chờ thanh toán</span>
                )}
              </td>
              <td>
                {inv.status === 'PAID' ? (
                  <button className="btn-view" onClick={() => handleShowInvoice(inv)}>
                    Xem hóa đơn
                  </button>
                ) : (
                  <button className="btn-print" onClick={() => handleShowInvoice(inv)}>
                    In hóa đơn
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setShowModal(false)}
          onPaid={fetchInvoices}
        />
      )}
    </div>
  );
};

export default PaymentManagementPage;
