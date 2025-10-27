import React, { useState } from 'react';
import './InvoiceDetailModal.css';

const InvoiceDetailModal = ({ invoice, onClose, onPaid }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaid, setIsPaid] = useState(invoice.status === 'PAID');

  const handlePayment = async () => {
    // Gọi API cập nhật trạng thái hóa đơn sang PAID
    // await paymentApi.payInvoice(invoice.id, { paymentMethod });
    setIsPaid(true);
    if (onPaid) onPaid();
    alert('Đã thanh toán thành công!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Chi tiết hóa đơn</h3>
        <div className="invoice-info">
          <div>Khách hàng: {invoice.customerName}</div>
          <div>Xe: {invoice.vehicleName}</div>
          <div>Biển số xe: {invoice.licensePlate}</div>
          <div>Bảo dưỡng: {invoice.serviceName}</div>
          <div>Biên bản sửa chữa: <button className="btn-detail">Chi tiết</button></div>
          <div>Tổng chi phí: {invoice.totalCost?.toLocaleString()} vnđ</div>
          <div>
            Hình thức thanh toán:
            <button
              className={paymentMethod === 'BANK' ? 'btn-method selected' : 'btn-method'}
              onClick={() => setPaymentMethod('BANK')}
            >
              Ngân hàng
            </button>
            <button
              className={paymentMethod === 'CASH' ? 'btn-method selected' : 'btn-method'}
              onClick={() => setPaymentMethod('CASH')}
            >
              Tiền mặt
            </button>
          </div>
          <div>Trạng thái: {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}</div>
        </div>
        {!isPaid && (
          <button className="btn-send" onClick={handlePayment}>
            Gửi hóa đơn thanh toán cho khách hàng
          </button>
        )}
        {isPaid && (
          <button className="btn-print-green">In hóa đơn</button>
        )}
        <button className="btn-close-modal" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
