// src/routes/index.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import LoginPage from '../modules/auth/LoginPage';
import RegisterPage from '../modules/auth/RegisterPage';
import BookingPage from '../modules/customer/pages/BookingPage';
import DashboardPage from '../modules/admin/pages/DashboardPage';
import UserManagementPage from '../modules/admin/pages/UserManagementPage';
import RevenueManagementPage from '../modules/admin/pages/RevenueManagementPage';
import PartsManagementPage from '../modules/admin/pages/PartsManagementPage';
import VehicleManagementPage from '../modules/admin/pages/VehicleManagementPage';
import SystemSettingsPage from '../modules/admin/pages/SystemSettingsPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/admin/dashboard" element={<DashboardPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/revenue" element={<RevenueManagementPage />} />
      <Route path="/admin/parts" element={<PartsManagementPage />} />
      <Route path="/admin/vehicles" element={<VehicleManagementPage />} />
      <Route path="/admin/settings" element={<SystemSettingsPage />} />
    </Routes>
  );
};

export default AppRouter;