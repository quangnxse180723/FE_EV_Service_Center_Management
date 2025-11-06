import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import staffApi from '../../../api/staffApi';
import './CustomerPaymentPage.css';
import { getServiceTicketDetail } from '../../technician/services/technicianService'; 
import './CustomerPaymentPage.css';

const CustomerPaymentPage = ({ scheduleId: propScheduleId, onClose }) => {
  const { scheduleId: paramScheduleId } = useParams();
  const navigate = useNavigate();
  
  // Dùng prop scheduleId nếu có (modal mode), không thì dùng từ URL params (route mode)
  const scheduleId = propScheduleId || paramScheduleId;
  const isModalMode = !!propScheduleId; // Modal mode khi có prop
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Modal xem chi tiết
  const [checklistData, setChecklistData] = useState(null); // Dữ liệu biên bản
  const [loadingModal, setLoadingModal] = useState(false); // Loading modal

  useEffect(() => {
    if (scheduleId) {
      fetchInvoiceDetail();
    }
  }, [scheduleId]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getInvoiceDetail(scheduleId);
      console.log('Invoice detail response:', response);
      
      // axiosClient đã trả về data trực tiếp, không cần .data
      setInvoiceData(response);
      
      // Set payment method từ invoice nếu có
      if (response.paymentMethod) {
        setSelectedPaymentMethod(response.paymentMethod);
      }
    } catch (err) {
      console.error('Error fetching invoice detail:', err);
      setError(err.response?.data?.message || 'Khong the tai thong tin hoa don');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Vui long chon hinh thuc thanh toan');
      return;
    }

    try {
      setProcessingPayment(true);
      
      if (selectedPaymentMethod === 'BANK') {
        // Tích hợp VNPay payment gateway
        const paymentUrl = await initiateVNPayPayment();
        if (paymentUrl) {
          window.location.href = paymentUrl;
        }
      } else {
        // Tiền mặt - chỉ cần xác nhận thanh toán
        alert('Vui long den trung tam de thanh toan tien mat');
        if (isModalMode && onClose) {
          onClose();
        } else {
          navigate('/customer/homepage');
        }
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      alert(err.response?.data?.message || 'Co loi xay ra khi xu ly thanh toan');
    } finally {
      setProcessingPayment(false);
    }
  };

  const initiateVNPayPayment = async () => {
    try {
      // Call backend API để tạo VNPay payment URL
      const response = await fetch('/api/payment/vnpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId: parseInt(scheduleId),
          amount: invoiceData.totalCost,
          orderInfo: `Thanh toan hoa don bao duong - Schedule ${scheduleId}`,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment URL');
      }
      
      const data = await response.json();
      console.log('VNPay payment URL:', data);
      return data.paymentUrl;
    } catch (err) {
      console.error('Error creating VNPay payment:', err);
      throw err;
    }
  };

  const handleClose = () => {
    if (isModalMode && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // ✅ Hàm load chi tiết biên bản để xem
  // ✅ Hàm load chi tiết biên bản để xem (ĐÃ CẬP NHẬT)
  const fetchChecklistDetail = async () => {
    try {
      setLoadingModal(true);
      // ✅ Gọi đúng API chi tiết biên bản giống như trang Staff
      const response = await getServiceTicketDetail(scheduleId); 
      console.log('Checklist detail response:', response);
      
      if (!response || !response.items || response.items.length === 0) {
        setChecklistData({ error: 'Không có hạng mục nào trong biên bản.' });
      } else {
        // ✅ Dữ liệu trả về từ API này đã chuẩn, gán trực tiếp
        setChecklistData(response);
      }
    } catch (err) {
      console.error('Error fetching checklist detail:', err);
      setChecklistData({ error: 'Không thể tải dữ liệu biên bản. Vui lòng thử lại.' });
    } finally {
      setLoadingModal(false);
    }
  };

  // ✅ Mở modal xem chi tiết
  const handleOpenDetailModal = () => {
    setShowDetailModal(true);
    fetchChecklistDetail();
  };

  if (loading) {
    return (
      <div className="customer-payment-overlay">
        <div className="payment-modal loading-modal">
          <div className="loading">Dang tai...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-payment-overlay">
        <div className="payment-modal error-modal">
          <div className="error-message">{error}</div>
          <button onClick={handleClose} className="btn-back">Quay lai</button>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="customer-payment-overlay">
        <div className="payment-modal error-modal">
          <div className="error-message">Không tìm thấy thông tin hóa đơn</div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-payment-overlay" onClick={handleClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal" onClick={handleClose}>×</button>
        <h2>Xác nhận nội dung bảo dưỡng - {invoiceData.vehicleModel}</h2>

        <div className="payment-info">
          <div className="info-row">
            <span className="label">Nhân viên:</span>
            <span className="value">{invoiceData.technicianName}</span>
          </div>
          <div className="info-row">
            <span className="label">Ngày in hóa đơn:</span>
            <span className="value">
              {invoiceData.inspectionDate 
                ? new Date(invoiceData.inspectionDate).toLocaleDateString('vi-VN')
                : 'N/A'
              }
            </span>
          </div>
        </div>

        <div className="checklist-section">
          <span className="label">Biên bản sửa chữa:</span>
          <button 
            className="btn-view-checklist" 
            onClick={handleOpenDetailModal}
          >
            Xem chi tiết
          </button>
        </div>

        <div className="cost-info">
          <div className="cost-row">
            <span className="label">Tổng chi phí:</span>
            <span className="value">{invoiceData.totalCost?.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="payment-method-section">
          <span className="label">Hinh thuc thanh toan:</span>
          <div className="payment-methods">
            <button
              className={`payment-btn ${selectedPaymentMethod === 'BANK' ? 'selected' : ''}`}
              onClick={() => setSelectedPaymentMethod('BANK')}
              disabled={processingPayment}
            >
              Ngân hàng
            </button>
            <button
              className={`payment-btn ${selectedPaymentMethod === 'CASH' ? 'selected' : ''}`}
              onClick={() => setSelectedPaymentMethod('CASH')}
              disabled={processingPayment}
            >
              Tiền mặt
            </button>
          </div>
        </div>

        <button 
          className="btn-confirm-payment"
          onClick={handleConfirmPayment}
          disabled={!selectedPaymentMethod || processingPayment}
        >
          {processingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
        </button>

        {/* ✅ Modal xem chi tiết biên bản (không có checkbox) */}
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
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
