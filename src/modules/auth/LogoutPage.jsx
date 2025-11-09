import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../api/authApi';
import './LoginPage.css';

export default function LogoutPage() {
  const navigate = useNavigate();
  const { logout: contextLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        setIsLoggingOut(true);
        
        // Gọi authApi.logout() để xóa token trên backend và localStorage
        await authApi.logout();
        
        // Cập nhật AuthContext
        contextLogout();
        
        // Chờ một chút để người dùng thấy thông báo
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('Logout error:', error);
        // Vẫn redirect về login dù có lỗi
        contextLogout();
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } finally {
        setIsLoggingOut(false);
      }
    };

    handleLogout();
  }, [navigate, contextLogout]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            {isLoggingOut ? (
              <>
                <div className="spinner" style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                <h2 style={{ color: '#667eea', marginBottom: '10px' }}>
                  Đang đăng xuất...
                </h2>
                <p style={{ color: '#666' }}>
                  Vui lòng đợi trong giây lát
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#4caf50',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  color: 'white'
                }}>
                  ✓
                </div>
                <h2 style={{ color: '#4caf50', marginBottom: '10px' }}>
                  Đăng xuất thành công!
                </h2>
                <p style={{ color: '#666' }}>
                  Đang chuyển hướng...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
