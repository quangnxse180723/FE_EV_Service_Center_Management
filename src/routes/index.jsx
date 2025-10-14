// src/routes/index.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import LoginPage from '../modules/auth/LoginPage';
import RegisterPage from '../modules/auth/RegisterPage';
import BookingPage from '../modules/customer/pages/BookingPage';
import DashboardPage from '../modules/admin/pages/DashboardPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/admin/dashboard" element={<DashboardPage />} />
    </Routes>
  );
};

export default AppRouter;