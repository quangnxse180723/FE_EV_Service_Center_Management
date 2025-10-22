import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    fullName: "", 
    email: "", 
    password: "", 
    confirm: ""
    // role luôn là CUSTOMER, không cho user chọn
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.fullName || !form.email || !form.password || !form.confirm) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ.");
      return;
    }

    // Password validation
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      // Gọi API đăng ký
      const registerData = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: "CUSTOMER"
      };

      console.log('📝 Sending register request:', registerData);

      const response = await authApi.register(registerData);
      
      console.log('✅ Register successful:', response);

      // Hiển thị thông báo thành công
      alert("Đăng ký thành công! Vui lòng đăng nhập.");

      // Chuyển hướng đến trang đăng nhập
      navigate('/login');

    } catch (error) {
      console.error('❌ Register error:', error);
      
      // Xử lý lỗi từ backend
      if (error.response?.status === 400) {
        setError("Email đã tồn tại trong hệ thống.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>
        
        <input
          type="text"
          name="fullName"
          placeholder="Họ và tên"
          value={form.fullName}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
        
        <input
          type="password"
          name="confirm"
          placeholder="Xác nhận mật khẩu"
          value={form.confirm}
          onChange={handleChange}
          disabled={loading}
          required
        />

        {/* Ẩn dropdown role, luôn đăng ký CUSTOMER */}
        
        {error && <div className="auth-error">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
        <div className="auth-link">
          Bạn đã có tài khoản? <a href="/login">Đăng nhập</a>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a href="/" className="back-btn"><span className="back-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 16L7.5 10L12.5 4" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Trở lại</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
