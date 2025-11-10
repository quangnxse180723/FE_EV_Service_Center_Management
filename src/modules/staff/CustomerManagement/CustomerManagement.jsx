import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit } from 'react-icons/fa';
import customerApi from '../../../api/customerApi'; // ✅ Sửa đường dẫn
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho modal sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    document.title = 'Quản lý khách hàng';
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const data = await customerApi.searchCustomers(searchTerm);
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
      alert('Không tìm thấy khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal sửa
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setShowEditModal(true);
  };

  // Đóng modal
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingCustomer(null);
    setEditForm({
      fullName: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  // Lưu thay đổi
  const handleSaveEdit = async () => {
    if (!editForm.fullName || !editForm.email || !editForm.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Số điện thoại)');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      alert('Email không hợp lệ!');
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(editForm.phone)) {
      alert('Số điện thoại không hợp lệ (phải là 10-11 chữ số)!');
      return;
    }

    try {
      setLoading(true);
      await customerApi.updateCustomer(editingCustomer.customerId, editForm);
      alert('Cập nhật thông tin khách hàng thành công!');
      handleCancelEdit();
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-management">
      <div className="page-header">
        <h2>Quản lý khách hàng</h2>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td>{customer.customerId}</td>
                    <td>{customer.fullName}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.address || 'N/A'}</td>
                    
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit" 
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(customer)}
                        >
                          <FaEdit />
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

      {/* Modal sửa thông tin khách hàng */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chỉnh sửa thông tin khách hàng</h3>
            
            <div className="form-group">
              <label>Họ tên <span className="required">*</span></label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại <span className="required">*</span></label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button className="btn-cancel" onClick={handleCancelEdit} disabled={loading}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;