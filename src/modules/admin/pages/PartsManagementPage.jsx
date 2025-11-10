import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PartsManagementPage.css';
import logoImage from '/src/assets/img/logo.png';
import adminAvatar from '/src/assets/img/avtAdmin.jpg';
import { getAllParts, createPart, updatePart, deletePart } from '../../../api/adminApi.js';

export default function PartsManagementPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('parts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Giả lập dữ liệu admin
  const adminInfo = {
    name: 'Admin',
    role: 'Administrator'
  };

  // 💾 State cho dữ liệu phụ tùng từ API
  const [parts, setParts] = useState([]);

  // 🔄 API GET: Tải danh sách phụ tùng khi component mount
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 📞 GET /api/admin/parts - Lấy danh sách phụ tùng từ backend
        const data = await getAllParts();
        console.log('✅ Loaded parts:', data);
        // 💾 Lưu vào state
        setParts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error loading parts:', err);
        setError('Không thể tải danh sách phụ tùng');
        // Fallback về dữ liệu mẫu nếu API lỗi
        setParts([
          { partId: 1, name: 'Phanh tay', price: 200000 },
          { partId: 2, name: 'Đèn / còi / hiển thị đồng hồ', price: 150000 },
          { partId: 3, name: 'Vỏ bọc, tay gas', price: 200000 },
          { partId: 4, name: 'Chân chống cạnh/ chân chống đứng', price: 150000 },
          { partId: 5, name: 'Cơ cấu khóa yên xe', price: 200000 },
          { partId: 6, name: 'Ắc quy Li-on', price: 1000000 },
          { partId: 7, name: 'Dầu phanh', price: 150000 },
          { partId: 8, name: 'Phanh trước', price: 200000 },
          { partId: 9, name: 'Ống dầu phanh trước', price: 150000 },
          { partId: 10, name: 'Vành xe trước', price: 300000 },
          { partId: 11, name: 'Lốp xe trước', price: 200000 },
          { partId: 12, name: 'Cổ phốt', price: 250000 },
          { partId: 13, name: 'Giảm xóc trước', price: 400000 },
          { partId: 14, name: 'Phanh sau', price: 200000 },
          { partId: 15, name: 'Ống dầu phanh sau', price: 150000 },
          { partId: 16, name: 'Vành xe sau', price: 300000 },
          { partId: 17, name: 'Lốp xe sau', price: 200000 },
          { partId: 18, name: 'Giảm xóc sau', price: 400000 },
          { partId: 19, name: 'Động cơ', price: 3000000 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  const handleLogout = () => {
    alert('Đăng xuất thành công!');
    navigate('/');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'vehicles') {
      navigate('/admin/vehicles');
    }
  };

  // ✏️ Sửa phụ tùng
  const handleEdit = (id) => {
    alert(`Chức năng sửa phụ tùng ${id} sẽ được phát triển!`);
    // TODO: Mở modal chỉnh sửa, sau đó gọi updatePart(id, data)
  };

  // 🗑️ API DELETE: Xóa phụ tùng
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phụ tùng này?')) {
      try {
        // 📞 DELETE /api/admin/parts/{id} - Xóa phụ tùng
        await deletePart(id);
        // 💾 Cập nhật state: Loại bỏ phụ tùng vừa xóa
        setParts(parts.filter(part => (part.partId || part.id) !== id));
        alert('Đã xóa phụ tùng!');
      } catch (err) {
        console.error('❌ Error deleting part:', err);
        alert('Lỗi khi xóa phụ tùng: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // ➕ Thêm phụ tùng
  const handleAdd = () => {
    alert('Chức năng thêm phụ tùng sẽ được phát triển!');
    // TODO: Mở modal thêm mới, sau đó gọi createPart(data)
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logoImage} alt="VOLTFIX Logo" className="logo" />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard')}
          >
            Bảng điều khiển
          </button>
          <button
            className={`nav-item ${activeMenu === 'accounts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('accounts')}
          >
            Quản lý tài khoản
          </button>
          <button
            className={`nav-item ${activeMenu === 'revenue' ? 'active' : ''}`}
            onClick={() => handleMenuClick('revenue')}
          >
            Quản lý doanh thu
          </button>
          <button
            className={`nav-item ${activeMenu === 'parts' ? 'active' : ''}`}
            onClick={() => handleMenuClick('parts')}
          >
            Quản lý phụ tùng
          </button>
          <button
            className={`nav-item ${activeMenu === 'vehicles' ? 'active' : ''}`}
            onClick={() => handleMenuClick('vehicles')}
          >
            Quản lý xe
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-user">
            <div className="user-avatar">
              <img src={adminAvatar} alt="Admin Avatar" className="avatar-image" />
            </div>
            <span className="user-name">{adminInfo.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Content */}
        <div className="admin-content">
          <h1 className="page-title">Quản lý phụ tùng</h1>

          {/* Loading & Error States */}
          {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>}
          {error && <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>}

          {/* Parts Table */}
          {!loading && (
            <div className="parts-table-container">
              <table className="parts-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên linh kiện</th>
                    <th>Giá linh kiện</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                        Không có phụ tùng nào
                      </td>
                    </tr>
                  ) : (
                    parts.map((part, index) => (
                      <tr key={part.partId || part.id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{part.name}</td>
                        <td className="text-right">{part.price?.toLocaleString('vi-VN')} VND</td>
                        <td className="text-center">
                          <button 
                            className="btn-action btn-edit-inline" 
                            onClick={() => handleEdit(part.partId || part.id)}
                            style={{ marginRight: '8px', padding: '4px 12px', fontSize: '14px' }}
                          >
                            Sửa
                          </button>
                          <button 
                            className="btn-action btn-delete-inline" 
                            onClick={() => handleDelete(part.partId || part.id)}
                            style={{ padding: '4px 12px', fontSize: '14px' }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          <div className="table-actions">
            <button className="btn-action btn-add" onClick={handleAdd}>
              Thêm phụ tùng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
