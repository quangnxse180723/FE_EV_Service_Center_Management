import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PriceListPage.css';
import { formatCurrencyVND } from '../utils/formatCurrency';
import partApi from '../api/partApi';
import HeaderHome from '../components/layout/HeaderHome';

export default function PriceListPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  const [localParts, setLocalParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dữ liệu từ database
  useEffect(() => {
    fetchPriceListFromDatabase();
  }, []);

  const fetchPriceListFromDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API để lấy danh sách packageChecklistItems và parts
      const [checklistItems, parts] = await Promise.all([
        partApi.getAllPackageChecklistItems(),
        partApi.getAllParts()
      ]);

      console.log('📦 Package Checklist Items:', checklistItems);
      console.log('🔧 Parts:', parts);

      // Kết hợp dữ liệu: lấy itemName và giá nhân công từ packageChecklistItem
      // và giá vật tư từ part với id tương ứng
      const combinedData = checklistItems.map(item => {
        // Tìm part tương ứng với partId trong checklistItem
        const correspondingPart = parts.find(part => part.partId === item.partId || part.id === item.partId);
        
        return {
          id: item.checklistItemId || item.id,
          tenLinhKien: item.itemName || 'N/A',
          giaLinhKien: correspondingPart?.unitPrice || 0, // Giá vật tư từ bảng part
          giaCongTho: item.laborCost || 0, // Giá nhân công từ packageChecklistItem
          quantity: 1,
          partId: item.partId,
          packageChecklistItemId: item.checklistItemId || item.id
        };
      });

      console.log('✅ Combined Price List:', combinedData);
      setLocalParts(combinedData);
      
    } catch (err) {
      console.error('❌ Error fetching price list from database:', err);
      setError('Không thể tải bảng giá từ database. Vui lòng thử lại sau.');
      setLocalParts([]); // Không hiển thị gì nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // Determine which parts to display
  useEffect(() => {
    // Skip if still loading from database
    if (loading) return;

    // Check localStorage for test data (optional - for testing purposes)
    const storedParts = localStorage.getItem('proposalParts');
    const storedMode = localStorage.getItem('isProposalMode');
    
    if (storedMode === 'true' && storedParts) {
      try {
        const parts = JSON.parse(storedParts);
        setLocalParts(parts);
        // Clear localStorage after loading
        localStorage.removeItem('proposalParts');
        localStorage.removeItem('isProposalMode');
      } catch (e) {
        console.error('Error parsing stored parts:', e);
      }
    }
    // Otherwise keep the data loaded from database
  }, [loading]);

  // Always show as read-only price list (not proposal mode)
  const inProposalMode = false;

  return (
    <div className="homepage-root">
      {/* Header */}
      <HeaderHome activeMenu="price" />

      {/* Price List Content */}
      <div className="price-list-page">
        <div className="price-list-container">
          <h1 className="price-list-title">
            {inProposalMode ? 'Bảng giá đề xuất từ kỹ thuật viên' : 'Bảng giá phụ tùng'}
          </h1>

          {error && (
            <div className="error-notice" style={{
              padding: '20px',
              backgroundColor: '#fee',
              border: '2px solid #f44336',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#c62828',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {error}
              </div>
              <button 
                onClick={fetchPriceListFromDatabase}
                style={{
                  marginTop: '12px',
                  padding: '10px 24px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
              >
                🔄 Thử lại
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#666'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }} />
              <p>Đang tải bảng giá từ database...</p>
            </div>
          ) : (
            <>
              {inProposalMode && (
                <div className="proposal-notice">
                  <p>📋 Kỹ thuật viên đã đề xuất các phụ tùng sau. Bạn có thể thêm, sửa hoặc xóa phụ tùng trước khi xác nhận.</p>
                </div>
              )}

          <div className="price-table-wrap">
            <table className="price-table">
              <thead>
                <tr>
                  <th className="col-no">STT</th>
                  <th className="col-name">Tên linh kiện</th>
                  {inProposalMode && <th className="col-qty">Số lượng</th>}
                  <th className="col-price">Giá linh kiện</th>
                  <th className="col-labor">Giá công thợ</th>
                  {inProposalMode && <th className="col-total">Tổng</th>}
                  {inProposalMode && <th className="col-actions">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {localParts.length === 0 ? (
                  <tr>
                    <td colSpan={inProposalMode ? 7 : 4} style={{ textAlign: 'center', padding: '32px' }}>
                      Chưa có phụ tùng nào
                    </td>
                  </tr>
                ) : (
                  localParts.slice(0, 19).map((p, idx) => {
                    const total = (p.giaLinhKien + p.giaCongTho) * (p.quantity || 1);
                    return (
                      <tr key={p.id}>
                        <td className="cell-center">{idx + 1}</td>
                        <td>{p.tenLinhKien}</td>
                        {inProposalMode && <td className="cell-center">{p.quantity || 1}</td>}
                        <td className="cell-right">{formatCurrencyVND(p.giaLinhKien)}</td>
                        <td className="cell-right">{formatCurrencyVND(p.giaCongTho)}</td>
                        {inProposalMode && <td className="cell-right cell-total">{formatCurrencyVND(total)}</td>}
                        {inProposalMode && (
                          <td className="cell-actions">
                            <button className="btn-edit" onClick={() => handleEditPart(p)} title="Sửa">
                              Sửa
                            </button>
                            <button className="btn-delete" onClick={() => handleDeletePart(p.id)} title="Xóa">
                              Xóa
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {inProposalMode && (
            <div className="action-buttons">
              <button className="btn-cancel" onClick={() => navigate(-1)}>
                ❌ Hủy
              </button>
              <button className="btn-add-part" onClick={() => setShowAddModal(true)}>
                ➕ Thêm phụ tùng
              </button>
              <button className="btn-confirm" onClick={handleConfirm}>
                ✅ Xác nhận danh sách
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}