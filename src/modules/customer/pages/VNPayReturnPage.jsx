import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeaderHome from '../../../components/layout/HeaderHome';
import './VNPayReturnPage.css';

const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    processVNPayReturn();
  }, []);

  const processVNPayReturn = async () => {
    try {
      // Lấy tất cả query params từ VNPay
      const params = {};
      for (let [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      // Gửi params tới backend để verify
      const response = await fetch(`/api/payment/vnpay/return?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setPaymentResult(data);
    } catch (err) {
      console.error('Error processing VNPay return:', err);
      setPaymentResult({
        success: false,
        message: 'Co loi xay ra khi xu ly ket qua thanh toan',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/payment-history');
  };

  if (loading) {
    return (
      <div className="vnpay-return-page">
        <div className="loading">Dang xu ly ket qua thanh toan...</div>
      </div>
    );
  }

  return (
    <div className="vnpay-return-page">
      {/* Header Navigation */}
      <HeaderHome activeMenu="" />
      
      <div className="result-card">
        {paymentResult?.success ? (
          <>
            <div className="success-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="35" stroke="#28a745" strokeWidth="5" fill="none"/>
                <path d="M25 40 L35 50 L55 30" stroke="#28a745" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">Thanh toan thanh cong</h2>
            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Ma giao dich:</span>
                <span className="value">{paymentResult.txnRef}</span>
              </div>
              <div className="detail-row">
                <span className="label">So tien:</span>
                <span className="value">{paymentResult.amount?.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="error-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="35" stroke="#dc3545" strokeWidth="5" fill="none"/>
                <path d="M30 30 L50 50 M50 30 L30 50" stroke="#dc3545" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="error-title">Thanh toan that bai</h2>
            <p className="error-message">{paymentResult?.message || 'Giao dich khong thanh cong'}</p>
          </>
        )}
        
        <button className="btn-back-dashboard" onClick={handleBackToDashboard}>
          Xem lich su thanh toan
        </button>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
