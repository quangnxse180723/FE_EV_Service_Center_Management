import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PartsManagementPage.css';
import logoImage from '../../../assets/img/log_voltfit.png';
import partApi from '../../../api/partApi';
import AdminHeader from '../layouts/AdminHeader';
import { useAuth } from '../../../contexts/AuthContext';

export default function PartsManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState('parts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  // use `unitPrice` on the frontend to match backend DTO (with fallback to `price`)
  const [editForm, setEditForm] = useState({ name: '', unitPrice: '', quantity: '', minStock: '' });
  const [addForm, setAddForm] = useState({ name: '', unitPrice: '', quantity: '', minStock: '' });

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
  // 📞 GET /parts - Lấy danh sách phụ tùng từ backend
  const data = await partApi.getAllParts();
        console.log('✅ Loaded parts:', data);
        // 💾 Lưu vào state
  setParts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error loading parts:', err);
        setError('Không thể tải danh sách phụ tùng');
        // Fallback về dữ liệu mẫu nếu API lỗi
        setParts([
          { partId: 1, name: 'Phanh tay', price: 200000, quantityInStock: 10, minStock: 2 },
          { partId: 2, name: 'Đèn / còi / hiển thị đồng hồ', price: 150000, quantityInStock: 5, minStock: 1 },
          { partId: 3, name: 'Vỏ bọc, tay gas', price: 200000, quantityInStock: 7, minStock: 2 },
          { partId: 4, name: 'Chân chống cạnh/ chân chống đứng', price: 150000, quantityInStock: 8, minStock: 2 },
          { partId: 5, name: 'Cơ cấu khóa yên xe', price: 200000, quantityInStock: 6, minStock: 1 },
          { partId: 6, name: 'Ắc quy Li-on', price: 1000000, quantityInStock: 2, minStock: 1 },
          { partId: 7, name: 'Dầu phanh', price: 150000, quantityInStock: 20, minStock: 5 },
          { partId: 8, name: 'Phanh trước', price: 200000, quantityInStock: 12, minStock: 3 },
          { partId: 9, name: 'Ống dầu phanh trước', price: 150000, quantityInStock: 15, minStock: 3 },
          { partId: 10, name: 'Vành xe trước', price: 300000, quantityInStock: 4, minStock: 1 },
          { partId: 11, name: 'Lốp xe trước', price: 200000, quantityInStock: 9, minStock: 2 },
          { partId: 12, name: 'Cổ phốt', price: 250000, quantityInStock: 3, minStock: 1 },
          { partId: 13, name: 'Giảm xóc trước', price: 400000, quantityInStock: 2, minStock: 1 },
          { partId: 14, name: 'Phanh sau', price: 200000, quantityInStock: 11, minStock: 2 },
          { partId: 15, name: 'Ống dầu phanh sau', price: 150000, quantityInStock: 14, minStock: 3 },
          { partId: 16, name: 'Vành xe sau', price: 300000, quantityInStock: 4, minStock: 1 },
          { partId: 17, name: 'Lốp xe sau', price: 200000, quantityInStock: 9, minStock: 2 },
          { partId: 18, name: 'Giảm xóc sau', price: 400000, quantityInStock: 1, minStock: 1 },
          { partId: 19, name: 'Động cơ', price: 3000000, quantityInStock: 1, minStock: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  const handleLogout = () => {
    navigate('/logout');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (menu === 'accounts') {
      navigate('/admin/users');
    } else if (menu === 'revenue') {
      navigate('/admin/revenue');
    } else if (menu === 'centers') {
      navigate('/admin/centers');
    }
  };

  // ✏️ Sửa phụ tùng
  const handleEdit = (id) => {
    const part = parts.find(p => (p.partId || p.id) === id);
    if (part) {
      setEditingPart(part);
        setEditForm({
          name: part.name || '',
          // accept backend returning `unitPrice` or `price`
          unitPrice: (part.unitPrice ?? part.price) != null ? String(part.unitPrice ?? part.price) : '',
          quantity: (part.quantityInStock ?? part.quantity) != null ? String(part.quantityInStock ?? part.quantity) : '',
          minStock: part.minStock != null ? String(part.minStock) : ''
        });
      setShowEditModal(true);
    }
  };

  // 💾 Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    // validate using unitPrice (frontend field)
    if (!editForm.name || editForm.unitPrice === '' || editForm.quantity === '') {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const id = editingPart.partId || editingPart.id;
      // ensure centerId is present (DB requires non-null center_id)
      // Option C: default centerId = 1 when missing
      const centerId = user?.centerId ?? user?.center?.centerId ?? 1;
      if (!user?.centerId && !(user?.center?.centerId)) {
        console.warn('PartsManagementPage: no user.centerId found, using default centerId=1');
      }

      const updatedData = {
        name: editForm.name,
        // send `unitPrice` as FE field (backend DTO mapper should accept this)
        unitPrice: parseFloat(editForm.unitPrice),
        quantityInStock: parseInt(editForm.quantity || '0', 10),
        minStock: parseInt(editForm.minStock || '0', 10),
        centerId: parseInt(centerId, 10)
      };

      // 📞 PUT /parts/{id} - Cập nhật phụ tùng
      await partApi.updatePart(id, updatedData);
      
      // 💾 Cập nhật state
      setParts(parts.map(part => 
        (part.partId || part.id) === id 
          ? { ...part, ...updatedData }
          : part
      ));

  setShowEditModal(false);
  setEditingPart(null);
  setEditForm({ name: '', unitPrice: '', quantity: '', minStock: '' });
      alert('Đã cập nhật phụ tùng thành công!');
    } catch (err) {
      console.error('❌ Error updating part:', err);
      alert('Lỗi khi cập nhật phụ tùng: ' + (err.response?.data?.message || err.message));
    }
  };

  // ❌ Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingPart(null);
    setEditForm({ name: '', unitPrice: '', quantity: '', minStock: '' });
  };

  // 🗑️ API DELETE: Xóa phụ tùng
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phụ tùng này?')) {
      try {
  // 📞 DELETE /parts/{id} - Xóa phụ tùng
  await partApi.deletePart(id);
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
    setAddForm({ name: '', unitPrice: '', quantity: '', minStock: '' });
    setShowAddModal(true);
  };

  // 💾 Lưu phụ tùng mới
  const handleSaveAdd = async () => {
    if (!addForm.name || addForm.unitPrice === '' || addForm.quantity === '') {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      // Option C: default centerId = 1 when missing
      const centerId = user?.centerId ?? user?.center?.centerId ?? 1;
      if (!user?.centerId && !(user?.center?.centerId)) {
        console.warn('PartsManagementPage: no user.centerId found, using default centerId=1');
      }

      const newData = {
        name: addForm.name,
        // send `unitPrice` per backend DTO
        unitPrice: parseFloat(addForm.unitPrice),
        quantityInStock: parseInt(addForm.quantity || '0', 10),
        minStock: parseInt(addForm.minStock || '0', 10),
        centerId: parseInt(centerId, 10)
      };

      // 📞 POST /parts - Tạo phụ tùng mới
      const createdPart = await partApi.createPart(newData);
      
      // 💾 Thêm vào danh sách
  // when backend responds, it may return `price` or `unitPrice` — normalize by preferring `unitPrice`
  const normalized = { ...createdPart };
  if (normalized.price != null && normalized.unitPrice == null) normalized.unitPrice = normalized.price;
  setParts([...parts, normalized]);

  setShowAddModal(false);
  setAddForm({ name: '', unitPrice: '', quantity: '', minStock: '' });
      alert('Đã thêm phụ tùng thành công!');
    } catch (err) {
      console.error('❌ Error creating part:', err);
      alert('Lỗi khi thêm phụ tùng: ' + (err.response?.data?.message || err.message));
    }
  };

  // ❌ Hủy thêm phụ tùng
  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddForm({ name: '', unitPrice: '', quantity: '', minStock: '' });
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
            className={`nav-item ${activeMenu === 'centers' ? 'active' : ''}`}
            onClick={() => handleMenuClick('centers')}
          >
            Quản lý trung tâm
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <AdminHeader />

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
                    <th>Số lượng phụ tùng</th>
                    <th>Giá linh kiện</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        Không có phụ tùng nào
                      </td>
                    </tr>
                  ) : (
                  parts.slice(0, 19).map((part, index) => (
                      <tr key={part.partId || part.id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{part.name}</td>
                        <td className="quantity-cell">{part.quantityInStock ?? part.quantity ?? 0}</td>
                        <td className="text-right">{(part.unitPrice ?? part.price)?.toLocaleString?.('vi-VN')} VND</td>
                        <td className="action-cell">
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-edit-inline" 
                              onClick={() => handleEdit(part.partId || part.id)}
                            >
                              Sửa
                            </button>
                            <button 
                              className="btn-action btn-delete-inline" 
                              onClick={() => handleDelete(part.partId || part.id)}
                            >
                              Xóa
                            </button>
                          </div>
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

      {/* Modal Sửa Phụ Tùng */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa phụ tùng</h2>
            <div className="form-group">
              <label>Tên phụ tùng:</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nhập tên phụ tùng"
              />
            </div>
            <div className="form-group">
              <label>Giá (VND):</label>
              <input
                type="number"
                value={editForm.unitPrice}
                onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                placeholder="Nhập giá"
              />
            </div>
            <div className="form-group">
              <label>Số lượng phụ tùng:</label>
              <input
                type="number"
                min="0"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                placeholder="Nhập số lượng"
              />
            </div>
            <div className="form-group">
              <label>Mức tối thiểu (minStock):</label>
              <input
                type="number"
                min="0"
                value={editForm.minStock}
                onChange={(e) => setEditForm({ ...editForm, minStock: e.target.value })}
                placeholder="Nhập mức tối thiểu"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveEdit}>Lưu</button>
              <button className="btn-cancel" onClick={handleCancelEdit}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Phụ Tùng */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCancelAdd}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm phụ tùng mới</h2>
            <div className="form-group">
              <label>Tên phụ tùng:</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Nhập tên phụ tùng"
              />
            </div>
            <div className="form-group">
              <label>Giá (VND):</label>
              <input
                type="number"
                value={addForm.unitPrice}
                onChange={(e) => setAddForm({ ...addForm, unitPrice: e.target.value })}
                placeholder="Nhập giá"
              />
            </div>
            <div className="form-group">
              <label>Số lượng phụ tùng:</label>
              <input
                type="number"
                min="0"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                placeholder="Nhập số lượng"
              />
            </div>
            <div className="form-group">
              <label>Mức tối thiểu (minStock):</label>
              <input
                type="number"
                min="0"
                value={addForm.minStock}
                onChange={(e) => setAddForm({ ...addForm, minStock: e.target.value })}
                placeholder="Nhập mức tối thiểu"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveAdd}>Thêm</button>
              <button className="btn-cancel" onClick={handleCancelAdd}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
