import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import authApi from '../../api/authApi';
import './LoginPage.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('role');
    
    if (isAuthenticated) {
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'STAFF') {
        navigate('/staff/customers', { replace: true });
      } else if (role === 'TECHNICIAN') {
        navigate('/technician', { replace: true });
      } else if (role === 'CUSTOMER') {
        navigate('/', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Đang đăng nhập với:', { email, password });
      
      // Gọi API đăng nhập
      const response = await authApi.login(email, password);
      
      console.log('✅ Login response:', response);

      // axiosClient đã return response.data rồi, nên response chính là data
      // Kiểm tra response
      if (response && response.token) {
        const { token, email: userEmail, role, message } = response;

        // Tạo object user để lưu
        const user = {
          email: userEmail,
          role: role,
          fullName: userEmail.split('@')[0]
        };

        // Lưu thông tin vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', role);
        localStorage.setItem('email', userEmail);

        console.log('✅ Đã lưu localStorage:', {
          token: token.substring(0, 20) + '...',
          role,
          email: userEmail
        });

        // Redirect dựa theo role
        if (role === 'ADMIN') {
          console.log('🚀 Redirect to /admin/dashboard');
          navigate('/admin/dashboard');
        } else if (role === 'STAFF') {
          console.log('🚀 Redirect to /staff/customers');
          navigate('/staff/customers');
        } else if (role === 'TECHNICIAN') {
          console.log('🚀 Redirect to /technician');
          navigate('/technician');
        } else if (role === 'CUSTOMER') {
          console.log('🚀 Redirect to /');
          navigate('/');
        } else {
          console.log('🚀 Redirect to / (default)');
          navigate('/');
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response);
      
      // Xử lý lỗi từ backend
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        console.error('❌ Status:', status);
        console.error('❌ Error data:', errorData);

        if (status === 401) {
          // Unauthorized - Sai email/password
          setError('Email hoặc mật khẩu không đúng!');
        } else if (status === 403) {
          // Forbidden - Tài khoản bị khóa
          setError('Tài khoản bị khóa hoặc không có quyền truy cập!');
        } else if (status === 404) {
          // Not Found - Email không tồn tại
          setError('Email không tồn tại trong hệ thống!');
        } else if (status === 500) {
          // Server Error
          setError('Lỗi server. Vui lòng thử lại sau!');
        } else {
          setError(errorData?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else if (err.request) {
        // Request được gửi nhưng không nhận được response
        console.error('❌ No response from server');
        setError('Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend có đang chạy không?\n- URL có đúng không?');
      } else {
        // Lỗi khác
        console.error('❌ Error message:', err.message);
        setError('Đã xảy ra lỗi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-logo" onClick={handleBackToHome} style={{ cursor: 'pointer' }}>
            <span className="logo-volt">VØLT</span>
            <span className="logo-fix">FIX</span>
          </div>
          <h1>Chào mừng trở lại!</h1>
          <p>Đăng nhập để quản lý dịch vụ sửa chữa xe điện</p>
          <div className="login-illustration">
            {/* Có thể thêm ảnh minh họa ở đây */}
          </div>
        </div>

        <div className="login-right">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Đăng nhập</h2>
            <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục</p>

            {error && (
              <div className="error-message" style={{ whiteSpace: 'pre-line' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="forgot-password">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <button 
              type="button" 
              className="back-home-btn"
              onClick={handleBackToHome}
            >
              ← Quay lại trang chủ
            </button>

            <div className="demo-accounts">
              <p className="demo-title">💡 Lưu ý:</p>
              <ul style={{ 
                fontSize: '13px', 
                color: '#666', 
                marginTop: '8px',
                paddingLeft: '20px',
                textAlign: 'left'
              }}>
                <li>Đảm bảo backend đang chạy tại <code>localhost:8080</code></li>
                <li>Sử dụng email/password có trong database</li>
                <li>Kiểm tra Console (F12) để xem lỗi chi tiết</li>
              </ul>
            </div>

            <div className="register-link">
              Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;