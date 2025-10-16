import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

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
      if (role === 'STAFF' || role === 'ADMIN') {
        navigate('/staff/customers', { replace: true });
      } else if (role === 'TECHNICIAN') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  // Dữ liệu cứng - Hard coded data
  const users = [
    {
      id: 1,
      email: 'staff@voltfix.com',
      password: '123456',
      role: 'STAFF',
      fullName: 'Nhân viên 1'
    },
    {
      id: 2,
      email: 'admin@voltfix.com',
      password: 'admin123',
      role: 'ADMIN',
      fullName: 'Quản trị viên'
    },
    {
      id: 3,
      email: 'customer@voltfix.com',
      password: 'customer123',
      role: 'CUSTOMER',
      fullName: 'Khách hàng'
    },
    {
      id: 4,
      email: 'technician@voltfix.com',
      password: 'tech123',
      role: 'TECHNICIAN',
      fullName: 'Kỹ thuật viên 1'
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Tìm user trong dữ liệu cứng
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (user) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accountId', user.id);
        localStorage.setItem('role', user.role);

        // Redirect dựa theo role
        if (user.role === 'STAFF' || user.role === 'ADMIN') {
          navigate('/staff/customers');
        } else if (user.role === 'TECHNICIAN') {
          navigate('/technician');
        } else {
          navigate('/');
        }
      } else {
        setError('Email hoặc mật khẩu không đúng!');
      }
      setLoading(false);
    }, 800);
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

            {error && <div className="error-message">{error}</div>}

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
              <p className="demo-title">📧 Tài khoản demo:</p>
              <div className="demo-account">
                <strong>Staff:</strong> staff@voltfix.com / 123456
              </div>
              <div className="demo-account">
                <strong>Admin:</strong> admin@voltfix.com / admin123
              </div>
              <div className="demo-account">
                <strong>Technician:</strong> technician@voltfix.com / tech123
              </div>
              <div className="demo-account">
                <strong>Customer:</strong> customer@voltfix.com / customer123
              </div>
            </div>

            <div className="register-link">
              Chưa có tài khoản? <a href="#">Đăng ký ngay</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;