import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('role');

  // Debug: Xem thông tin
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - userRole:', userRole);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    console.log('⛔ Chưa đăng nhập → Redirect về /login');
    return <Navigate to="/login" replace />;
  }

  // Nếu không có quyền
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('⛔ Không có quyền truy cập → Redirect về /');
    return <Navigate to="/" replace />;
  }

  // Có quyền → Render children
  console.log('✅ Có quyền truy cập');
  return children;
};

export default ProtectedRoute;