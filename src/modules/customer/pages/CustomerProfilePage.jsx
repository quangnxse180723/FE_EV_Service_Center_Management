import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerProfilePage.css';
import customerApi from '../../../api/customerApi';
import { useAuth } from '../../../contexts/AuthContext';
import defaultAvatar from '/src/assets/img/user-avatar.jpg'; // Ảnh của bạn

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Customer data từ database
  const [customerData, setCustomerData] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const customerId = localStorage.getItem('customerId');
      
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      }

      console.log('🔍 Fetching customer data for ID:', customerId);
      const data = await customerApi.getCustomerById(customerId);
      
      console.log('✅ Customer data loaded:', data);
      setCustomerData(data);
      
      // Set form data - hỗ trợ cả fullName và name
      setEditForm({
        fullName: data.fullName || data.name || '',
        phone: data.phone || data.phoneNumber || '',
        email: data.email || '',
        address: data.address || ''
      });
      
    } catch (err) {
      console.error('❌ Error fetching customer data:', err);
      setError(err.message || 'Không thể tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form
      setEditForm({
        fullName: customerData.fullName || '',
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || ''
      });
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMessage('');
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!editForm.fullName || editForm.fullName.trim() === '') {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    
    if (!editForm.phone || editForm.phone.trim() === '') {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    
    // Validate phone number format (Vietnamese phone number)
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(editForm.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    
    if (!editForm.email || editForm.email.trim() === '') {
      setError('Vui lòng nhập email');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const customerId = localStorage.getItem('customerId');
      
      const updateData = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        address: editForm.address.trim()
      };
      
      console.log('📤 Updating customer data:', updateData);
      const response = await customerApi.updateCustomer(customerId, updateData);
      
      console.log('✅ Customer updated successfully:', response);
      
      // Update local data
      setCustomerData(response);
      setIsEditing(false);
      
      // Update localStorage if needed
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.fullName = updateData.fullName;
        user.phone = updateData.phone;
        user.email = updateData.email;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setSuccessMessage('✅ Cập nhật thông tin thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('❌ Error updating customer:', err);
      setError(err.response?.data?.message || err.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !customerData) {
    return (
      <div className="customer-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-profile-page">
      {/* Success Message */}
      {successMessage && (
        <div className="success-toast">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-toast">
          ❌ {error}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Quay lại
          </button>
          <h1>Thông tin cá nhân</h1>
          <div></div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={defaultAvatar} alt="Customer Avatar" className="avatar-image" />
            </div>
            <div className="profile-title">
              <h2>{customerData?.fullName || customerData?.name || 'Khách hàng'}</h2>
              <p className="customer-id">Mã KH: KH{String(customerData?.customerId || '').padStart(3, '0')}</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>
              
              <div className="form-group">
                <label>
                  Họ và tên <span className="required">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ tên"
                    disabled={loading}
                  />
                ) : (
                  <div className="form-value">{customerData?.fullName || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    disabled={loading}
                  />
                ) : (
                  <div className="form-value">{customerData?.phone || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập email"
                    disabled={loading}
                  />
                ) : (
                  <div className="form-value">{customerData?.email || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                {isEditing ? (
                  <textarea
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ"
                    rows="3"
                    disabled={loading}
                  />
                ) : (
                  <div className="form-value">{customerData?.address || 'Chưa cập nhật'}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Thông tin tài khoản</h3>
              
              <div className="form-group">
                <label>Trạng thái tài khoản</label>
                <div className="form-value">
                  <span className={`status-badge ${customerData?.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                    {customerData?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Ngày đăng ký</label>
                <div className="form-value">
                  {customerData?.createdAt 
                    ? new Date(customerData.createdAt).toLocaleDateString('vi-VN') 
                    : 'Chưa rõ'}
                </div>
              </div>
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button 
                    type="button" 
                    onClick={handleEditToggle} 
                    className="cancel-btn"
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  onClick={handleEditToggle} 
                  className="edit-btn"
                >
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
