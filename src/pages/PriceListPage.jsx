import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePartsPriceContext } from '../contexts/PartsPriceContext';
import { useNotifications } from '../hooks/useNotifications';
import './PriceListPage.css';
import './HomePage.css';
import { formatCurrencyVND } from '../utils/formatCurrency';
import logoImage from '../assets/img/logo.png';
import AddPartModal from '../components/shared/AddPartModal';
import EditPartModal from '../components/shared/EditPartModal';
import NotificationModal from '../components/shared/NotificationModal';

const ALL_PARTS = [
  { id: 1, tenLinhKien: 'Phanh tay', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 2, tenLinhKien: 'Đèn / còi / hiển thị đồng hồ', giaLinhKien: 150000, giaCongTho: 40000 },
  { id: 3, tenLinhKien: 'Vỏ bọc, tay gas', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 4, tenLinhKien: 'Chân chống cạnh/ chân chống đứng', giaLinhKien: 150000, giaCongTho: 50000 },
  { id: 5, tenLinhKien: 'Cơ cấu khóa yên xe', giaLinhKien: 200000, giaCongTho: 60000 },
  { id: 6, tenLinhKien: 'Ắc quy Li-on', giaLinhKien: 1000000, giaCongTho: 80000 },
  { id: 7, tenLinhKien: 'Dầu phanh', giaLinhKien: 150000, giaCongTho: 40000 },
  { id: 8, tenLinhKien: 'Phanh trước', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 9, tenLinhKien: 'Ống dầu phanh trước', giaLinhKien: 150000, giaCongTho: 40000 },
  { id: 10, tenLinhKien: 'Vành xe trước', giaLinhKien: 300000, giaCongTho: 80000 },
  { id: 11, tenLinhKien: 'Lốp xe trước', giaLinhKien: 200000, giaCongTho: 50000 },
  { id: 12, tenLinhKien: 'Cổ phốt', giaLinhKien: 250000, giaCongTho: 80000 },
  { id: 13, tenLinhKien: 'Giảm xóc trước', giaLinhKien: 400000, giaCongTho: 80000 },
];

export default function PriceListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { proposedParts, isProposalMode, updateProposedPart, removeProposedPart, addProposedPart, clearProposal } = usePartsPriceContext();
  const { unreadCount } = useNotifications(user?.id || 'guest');
  
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [localParts, setLocalParts] = useState([]);
  
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Determine which parts to display
  useEffect(() => {
    // Check localStorage for test data
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
    } else if (isProposalMode && proposedParts.length > 0) {
      setLocalParts(proposedParts);
    } else {
      // Default: show all 13 parts (read-only mode)
      setLocalParts(ALL_PARTS.map(p => ({ ...p, quantity: 1 })));
    }
  }, [isProposalMode, proposedParts]);

  // Determine if we're in proposal mode (either from context or localStorage test)
  const inProposalMode = isProposalMode || localParts.some(p => p.quantity !== undefined && localParts.length < 13);

  useEffect(() => {
    if (!showAuthDropdown) return;
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowAuthDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuthDropdown]);

  const handleAddPart = (part) => {
    setLocalParts(prev => [...prev, part]);
    if (isProposalMode) {
      addProposedPart(part);
    }
  };

  const handleEditPart = (part) => {
    setEditingPart(part);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedPart) => {
    setLocalParts(prev => 
      prev.map(p => p.id === updatedPart.id ? updatedPart : p)
    );
    if (isProposalMode) {
      updateProposedPart(updatedPart.id, { quantity: updatedPart.quantity });
    }
  };

  const handleDeletePart = (partId) => {
    if (window.confirm('Bạn có chắc muốn xóa phụ tùng này?')) {
      setLocalParts(prev => prev.filter(p => p.id !== partId));
      if (isProposalMode) {
        removeProposedPart(partId);
      }
    }
  };

  const handleConfirm = async () => {
    // TODO: Gửi danh sách phụ tùng đã confirm về backend
    console.log('Confirm parts:', localParts);
    alert(`Đã xác nhận ${localParts.length} phụ tùng. Danh sách sẽ được gửi cho kỹ thuật viên.`);
    // Clear proposal mode and navigate back
    clearProposal();
    navigate('/');
  };

  const existingPartIds = localParts.map(p => p.id);

  return (
    <div className="homepage-root">
      {/* Header */}
      <header className="hf-header">
        <div className="hf-header-inner">
          <div className="hf-logo"> 
            <img src={logoImage} alt="VOLTFIX Logo" className="logo-image" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          </div>

          <nav className="hf-nav">
            <a className="nav-item" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Trang chủ</a>
            <a className="nav-item" onClick={() => navigate('/booking')} style={{ cursor: 'pointer' }}>Đặt lịch</a>
            <a className="nav-item active" style={{ cursor: 'pointer' }}>Bảng giá</a>
            <a className="nav-item" onClick={() => navigate('/booking-history')} style={{ cursor: 'pointer' }}>Lịch sử</a>
          </nav>

          <div className="hf-actions">
            <div className="notification-bell-wrapper">
              <div 
                className="icon-circle bell" 
                title="Thông báo" 
                onClick={() => setShowNotificationModal(true)} 
                style={{ cursor: 'pointer' }} 
              />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <div
              className="icon-circle avatar"
              title="Tài khoản"
              ref={avatarRef}
              onClick={() => setShowAuthDropdown((v) => !v)}
            />
            <div className="icon-circle menu" title="Menu" />
            {showAuthDropdown && (
              <div className="auth-dropdown-root" ref={dropdownRef}>
                <div className="auth-dropdown-menu">
                  {isLoggedIn ? (
                    <>
                      <div className="auth-dropdown-item user-info">
                        <strong>{user?.name || 'Người dùng'}</strong>
                      </div>
                      <a onClick={() => navigate('/my-vehicles')} className="auth-dropdown-item" style={{ cursor: 'pointer' }}>Quản lý xe</a>
                      <a onClick={() => navigate('/booking-history')} className="auth-dropdown-item" style={{ cursor: 'pointer' }}>Lịch sử</a>
                      <a onClick={logout} className="auth-dropdown-item" style={{ cursor: 'pointer' }}>Đăng xuất</a>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="auth-dropdown-item">Đăng nhập</a>
                      <a href="/register" className="auth-dropdown-item">Đăng ký</a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Price List Content */}
      <div className="price-list-page">
        <div className="price-list-container">
          <h1 className="price-list-title">
            {inProposalMode ? 'Bảng giá đề xuất từ kỹ thuật viên' : 'Bảng giá phụ tùng'}
          </h1>

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
                  localParts.map((p, idx) => {
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
        </div>
      </div>

      {/* Modals */}
      <AddPartModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPart}
        existingPartIds={existingPartIds}
      />
      <EditPartModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        part={editingPart}
      />
      <NotificationModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        customerId={user?.id}
      />
    </div>
  );
}
