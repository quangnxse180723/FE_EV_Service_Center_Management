import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    },
    content: {
      textAlign: 'center',
      color: 'white',
      maxWidth: '600px'
    },
    errorCode: {
      fontSize: '10rem',
      fontWeight: 'bold',
      margin: 0,
      textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)'
    },
    title: {
      fontSize: '2rem',
      margin: '1rem 0'
    },
    description: {
      fontSize: '1.1rem',
      marginBottom: '2rem',
      opacity: 0.9
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    primaryBtn: {
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#667eea',
      transition: 'all 0.3s'
    },
    secondaryBtn: {
      padding: '1rem 2rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: 'white',
      border: '2px solid white',
      transition: 'all 0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.title}>Trang không tồn tại</h2>
        <p style={styles.description}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <div style={styles.buttonContainer}>
          <button style={styles.primaryBtn} onClick={() => navigate('/')}>
            Về trang chủ
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;