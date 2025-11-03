import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authApi from "../../api/authApi";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Lấy trang redirect từ state (nếu có)
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      // Gọi API login thực
      const response = await authApi.login(form.username, form.password);
      
      console.log('Login response:', response);
      
      // Response từ backend có format:
      // { token, email, role, accountId, fullName, customerId (nếu là CUSTOMER) }
      const { 
        token, email, role, 
        accountId, fullName, 
        customerId, staffId, technicianId // Lấy ID mới
      } = response;
      
      // Tạo userData object
      const userData = {
        accountId: accountId,
        email: email,
        fullName: fullName || email.split('@')[0], 
        role: role,
        customerId: customerId,     // Thêm
        staffId: staffId,         // Thêm
        technicianId: technicianId  // Thêm
      };
      
      // Nếu là customer, thêm customerId
      if (role === 'CUSTOMER' && customerId) {
        userData.customerId = customerId;
        localStorage.setItem('customerId', customerId);
      }
      
      // Lưu vào AuthContext và localStorage
      login(userData, token);
      
      // Lưu thêm role và accountId vào localStorage (compatibility)
      localStorage.setItem('role', role);
      localStorage.setItem('accountId', accountId);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Lưu các ID theo vai trò
      if (role === 'CUSTOMER') {
        localStorage.setItem('customerId', customerId);
      }
      if (role === 'STAFF') {
        localStorage.setItem('staffId', staffId);
      }
      if (role === 'TECHNICIAN') {
        localStorage.setItem('technicianId', technicianId); // ID của technician
      }
      
      // Chuyển hướng theo role
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'STAFF') {
        navigate('/staff/dashboard');
      } else if (role === 'TECHNICIAN') {
        navigate('/technician/dashboard');
      } else if (role === 'CUSTOMER') {
        navigate(from); // Customer về trang đã lưu hoặc trang chủ
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
        />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <div className="auth-link">
          Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a href="/" className="back-btn"><span className="back-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 16L7.5 10L12.5 4" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Trở lại</a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
