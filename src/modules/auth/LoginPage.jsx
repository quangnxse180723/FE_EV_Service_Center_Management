import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call login API here
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setError("");
    
    // Giả lập: nếu username là "admin" thì chuyển đến admin dashboard
    if (form.username.toLowerCase() === 'admin') {
      alert("Đăng nhập thành công! Chào mừng Admin.");
      navigate('/admin/dashboard');
    } else {
      alert("Đăng nhập thành công!");
      navigate('/');
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
        <button type="submit">Đăng nhập</button>
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
