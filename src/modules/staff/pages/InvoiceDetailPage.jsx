import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InvoiceDetailPage.css'; // Sẽ cập nhật CSS ở bước 2
import staffApi from '../../../api/staffApi';
import paymentApi from '../../../api/paymentApi';
// Import service của technician để lấy biên bản chi tiết
import { getServiceTicketDetail } from '../../technician/services/technicianService';

const InvoiceDetailPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [invoiceStatus, setInvoiceStatus] = useState(''); // NEW, PENDING_PAYMENT, PAID
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // ===== FETCH DATA =====
  useEffect(() => {
    if (!scheduleId || scheduleId === 'undefined') {
      setError('Không tìm thấy mã đặt lịch hợp lệ!');
      setLoading(false);
      return;
    }
    fetchInvoiceDetail();
  }, [scheduleId]);

  const fetchInvoiceDetail = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getInvoiceDetail(scheduleId);
      setInvoice(data);
      setInvoiceStatus(data.status || 'NEW'); // Giả sử 'NEW' là trạng thái ban đầu
      setPaymentMethod(data.paymentMethod || ''); // Lấy phương thức thanh toán nếu đã có
    } catch (err) {
      console.error(err);
      setError('Không thể tải chi tiết hóa đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

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
      // Gọi API mới để gửi hóa đơn cho khách hàng
      await staffApi.sendInvoiceToCustomer({
        scheduleId: parseInt(scheduleId),
        paymentMethod: paymentMethod
      });
      
      setSuccessMessage('Đã gửi hóa đơn thanh toán cho khách hàng thành công!');
      setInvoiceStatus('PENDING_PAYMENT'); // Cập nhật trạng thái
      
      // Reload dữ liệu để cập nhật trạng thái mới
      await fetchInvoiceDetail();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gửi hóa đơn thất bại. Vui lòng thử lại.');
    }
  };

  // ===== HANDLE CONFIRM PAYMENT (NẾU LÀ TIỀN MẶT) =====
  const handleConfirmPayment = async () => {
    if (!paymentMethod) {
      setError('Vui lòng chọn hình thức thanh toán.');
      return;
    }
    
    try {
      // API này sẽ cập nhật trạng thái hóa đơn là PAID
      await paymentApi.payInvoice(invoice.scheduleId, { paymentMethod });
      setInvoiceStatus('PAID');
      setSuccessMessage('Xác nhận thanh toán thành công!');
    } catch (err) {
      console.error(err);
      setError('Xác nhận thanh toán thất bại.');
    }
  };
  
  // ===== HANDLE SHOW DETAIL MODAL (BIÊN BẢN SỬA CHỮA) =====
  const handleShowDetail = async () => {
    setLoadingModal(true);
    setShowDetailModal(true);
    try {
      // Gọi API lấy chi tiết biên bản (danh sách hạng mục)
      const data = await getServiceTicketDetail(scheduleId);
      setChecklistData(data);
    } catch (err) {
      console.error('Lỗi khi tải biên bản:', err);
      // Đặt checklistData thành lỗi để modal có thể hiển thị
      setChecklistData({ error: 'Không thể tải chi tiết biên bản.' });
    } finally {
      setLoadingModal(false);
    }
  };

  // ===== UI STATES =====
  if (loading) return <div className="invoice-detail-loading">Đang tải...</div>;
  if (error && !invoice) return <div className="invoice-detail-page error-message">{error}</div>;
  if (!invoice) return <div className="invoice-detail-page">Không tìm thấy thông tin hóa đơn.</div>;

  const isPaid = invoiceStatus === 'PAID';
  const displayStatus =
    invoiceStatus === 'PAID'
      ? 'Đã thanh toán'
      : invoiceStatus === 'PENDING_PAYMENT'
      ? 'Chờ thanh toán'
      : 'Mới (chưa gửi)';

  // ===== RENDER =====
  return (
    <>
      <div className="invoice-detail-page">
        <button className="btn-back-main" onClick={() => navigate(-1)}>
          Trở lại
        </button>
        <h2 className="main-title">Quản lý thanh toán</h2>

        {error && <div className="invoice-error-message">{error}</div>}
        {successMessage && <div className="invoice-success-message">{successMessage}</div>}

        <div className="invoice-summary-card">
          <div className="info-group">
            <span className="info-label">Khách hàng:</span>
            <span className="info-value">{invoice.customerName}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Xe:</span>
            <span className="info-value">{invoice.vehicleName}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Bảo dưỡng:</span>
            <span className="info-value">{invoice.maintenanceType}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Biên bản sửa chữa:</span>
            <button className="btn-detail-inline" onClick={handleShowDetail}>
              Chi tiết
            </button>
          </div>
          <div className="info-group info-total">
            <span className="info-label">Tổng chi phí:</span>
            <span className="info-value total-amount">
              {Number(invoice.totalCost).toLocaleString()} vnđ
            </span>
          </div>
          
          <div className="info-group payment-method-group">
            <span className="info-label">Hình thức thanh toán:</span>
            <div className="payment-options">
              <button
                className={`btn-payment-method ${paymentMethod === 'BANK' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('BANK')}
                disabled={isPaid}
              >
                Ngân hàng
              </button>
              <button
                className={`btn-payment-method ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('CASH')}
                disabled={isPaid}
              >
                Tiền mặt
              </button>
            </div>
          </div>

          <div className="info-group">
            <span className="info-label">Trạng thái:</span>
            <span className={`info-value status-tag ${isPaid ? 'status-paid' : 'status-waiting'}`}>
              {displayStatus}
            </span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="invoice-actions">
          {invoiceStatus !== 'PAID' && (
            <button
              className="btn-action btn-send"
              onClick={handleSendInvoice}
              disabled={!paymentMethod}
            >
              Gửi hóa đơn thanh toán cho khách hàng
            </button>
          )}

          {invoiceStatus === 'PENDING_PAYMENT' && (
            <button
              className="btn-action btn-confirm-payment"
              onClick={handleConfirmPayment}
            >
              Xác nhận đã thanh toán
            </button>
          )}

          {isPaid && (
            <button className="btn-action btn-print">
              In hóa đơn
            </button>
          )}
        </div>
      </div>

      {/* Modal chi tiết biên bản sửa chữa */}
      {showDetailModal && (
        <div className="invoice-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3>Biên bản sửa chữa</h3>
              <button className="invoice-modal-close" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className="invoice-modal-body">
              {loadingModal ? (
                <div>Đang tải chi tiết...</div>
              ) : !checklistData || checklistData.error ? (
                <div className="invoice-error-message">
                  {checklistData?.error || 'Không thể tải dữ liệu.'}
                </div>
              ) : (
                <table className="checklist-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên phụ tùng</th>
                      <th>Giá vật tư (₫)</th>
                      <th>Nhân công (₫)</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklistData.items && checklistData.items.length > 0 ? (
                      checklistData.items.map((item, index) => {
                        const partPrice = item.partCost ? item.partCost : 0;
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.partName}</td>
                            <td>{partPrice.toLocaleString('vi-VN')}</td>
                            <td>{item.laborCost.toLocaleString('vi-VN')}</td>
                            <td>{item.actionStatus || 'N/A'}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5">Không có hạng mục nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceDetailPage;