import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InvoiceDetailPage.css';
import staffApi from '../../../api/staffApi';
import paymentApi from '../../../api/paymentApi';

const InvoiceDetailPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [invoiceStatus, setInvoiceStatus] = useState(''); // e.g. NEW, PENDING_PAYMENT, PAID
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ===== FETCH DATA =====
  useEffect(() => {
    if (!scheduleId || scheduleId === 'undefined') {
      setError('Không tìm thấy mã đặt lịch hợp lệ!');
      setLoading(false);
      return;
    }

    const fetchInvoiceDetail = async () => {
      setLoading(true);
      try {
        const data = await staffApi.getInvoiceDetail(scheduleId);
        setInvoice(data);
        setInvoiceStatus(data.status || 'NEW');
        setPaymentMethod(data.paymentMethod || '');
      } catch (err) {
        console.error(err);
        setError('Không thể tải chi tiết hóa đơn. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetail();
  }, [scheduleId]);

  // ===== HANDLE PAYMENT METHOD SELECT =====
  const handlePaymentMethodChange = (method) => {
    if (invoiceStatus === 'PAID') return;
    setPaymentMethod(method);
    setError(null);
    setSuccessMessage(null);
  };

  // ===== HANDLE SEND INVOICE (TẠO THANH TOÁN) =====
  const handleSendInvoice = async () => {
    if (!paymentMethod) {
      setError('Vui lòng chọn hình thức thanh toán trước khi gửi.');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const paymentData = {
        method: paymentMethod,
        amount: parseFloat(invoice.totalCost),
        invoiceId: parseInt(scheduleId),
      };

      await paymentApi.createPayment(paymentData);
      setSuccessMessage('Đã gửi hóa đơn thanh toán cho khách hàng thành công!');
      setInvoiceStatus('PENDING_PAYMENT');
    } catch (err) {
      console.error(err);
      setError('Gửi hóa đơn thất bại. Vui lòng thử lại.');
    }
  };

  // ===== HANDLE CONFIRM PAYMENT (ĐÃ THANH TOÁN) =====
  const handleConfirmPayment = async () => {
    try {
      await paymentApi.payInvoice(invoice.scheduleId, { paymentMethod });
      setInvoiceStatus('PAID');
      setSuccessMessage('Xác nhận thanh toán thành công!');
    } catch (err) {
      console.error(err);
      setError('Xác nhận thanh toán thất bại.');
    }
  };

  // ===== UI STATES =====
  if (loading) return <div className="invoice-detail-page">Đang tải...</div>;
  if (error && !invoice) return <div className="invoice-detail-page error-message">{error}</div>;
  if (!invoice) return <div className="invoice-detail-page">Không tìm thấy thông tin hóa đơn.</div>;

  const isPaid = invoiceStatus === 'PAID';
  const displayStatus =
    invoiceStatus === 'PAID'
      ? 'Đã thanh toán'
      : invoiceStatus === 'PENDING_PAYMENT'
      ? 'Chờ thanh toán'
      : 'Mới tạo (chưa gửi)';

  // ===== RENDER =====
  return (
    <div className="invoice-detail-page" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div className="invoice-detail-content">
        <h3>Chi tiết hóa đơn (ID: {scheduleId})</h3>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {successMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</div>}

        <div className="invoice-info" style={{ lineHeight: '1.8' }}>
          <div>Khách hàng: {invoice.customerName}</div>
          <div>Xe: {invoice.vehicleName}</div>
          <div>Biển số xe: {invoice.licensePlate}</div>
          <div>Loại bảo dưỡng: {invoice.maintenanceType}</div>
          <div>Ghi chú sửa chữa: {invoice.repairNote}</div>
          <div>Tổng chi phí: {Number(invoice.totalCost).toLocaleString()} vnđ</div>
          <div>
            Hình thức thanh toán:
            <button
              style={{
                marginLeft: '10px',
                border: paymentMethod === 'BANK' ? '2px solid blue' : '1px solid #ccc',
                padding: '5px 10px',
              }}
              onClick={() => handlePaymentMethodChange('BANK')}
              disabled={isPaid}
            >
              Ngân hàng
            </button>
            <button
              style={{
                marginLeft: '10px',
                border: paymentMethod === 'CASH' ? '2px solid blue' : '1px solid #ccc',
                padding: '5px 10px',
              }}
              onClick={() => handlePaymentMethodChange('CASH')}
              disabled={isPaid}
            >
              Tiền mặt
            </button>
          </div>
          <div>Trạng thái: {displayStatus}</div>
        </div>

        <br />

        {/* Nếu chưa gửi hóa đơn */}
        {invoiceStatus === 'NEW' && (
          <button
            className="btn-send"
            onClick={handleSendInvoice}
            disabled={!paymentMethod}
            style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Gửi hóa đơn thanh toán cho khách hàng
          </button>
        )}

        {/* Nếu đang chờ thanh toán */}
        {invoiceStatus === 'PENDING_PAYMENT' && (
          <button
            className="btn-confirm"
            onClick={handleConfirmPayment}
            style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}
          >
            Xác nhận đã thanh toán
          </button>
        )}

        {/* Nếu đã thanh toán */}
        {isPaid && (
          <button
            className="btn-print-green"
            style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            In hóa đơn
          </button>
        )}

        <button
          className="btn-back"
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 15px',
            marginLeft: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;