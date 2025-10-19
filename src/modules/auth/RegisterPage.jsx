import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error khi user nhập
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Validate độ dài mật khẩu
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Đăng ký với:', formData);

      // Gọi API đăng ký - Backend Account entity
      const response = await authApi.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'CUSTOMER' // Mặc định role là CUSTOMER
      });

      console.log('✅ Register response:', response);

      // Hiển thị thông báo thành công
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: ''
      });

      // Redirect về login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('❌ Register error:', err);
      console.error('❌ Error response:', err.response);

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        console.error('❌ Status:', status);
        console.error('❌ Error data:', errorData);

        if (status === 400) {
          setError(errorData?.message || errorData || 'Email đã tồn tại hoặc dữ liệu không hợp lệ');
        } else if (status === 409) {
          setError('Email này đã được đăng ký. Vui lòng sử dụng email khác');
        } else if (status === 500) {
          setError('Lỗi server. Vui lòng thử lại sau');
        } else {
          setError(errorData?.message || errorData || 'Đăng ký thất bại. Vui lòng thử lại');
        }
      } else if (err.request) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend có đang chạy không?\n- URL có đúng không?');
      } else {
        setError('Đã xảy ra lỗi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h1>Đăng ký tài khoản</h1>
          <p className="register-subtitle">Tạo tài khoản mới để sử dụng dịch vụ</p>
          
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #fcc',
              whiteSpace: 'pre-line'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{
              backgroundColor: '#efe',
              color: '#3c3',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #cfc'
            }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
            <p>💡 <strong>Lưu ý:</strong></p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li>Đảm bảo backend đang chạy tại <code>localhost:8080</code></li>
              <li>Mật khẩu phải có ít nhất 6 ký tự</li>
              <li>Email phải là email hợp lệ</li>
            </ul>
          </div>

          <div className="login-link">
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
