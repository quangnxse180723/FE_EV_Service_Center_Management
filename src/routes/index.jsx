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

import TechnicianLayout from '@/modules/technician/layouts/TechnicianLayout.jsx';
import TechnicianDashboardPage from '@/modules/technician/pages/DashboardPage.jsx';
import AssignedJobsPage from '@/modules/technician/pages/AssignedJobsPage.jsx';
import InspectionPage from '@/modules/technician/pages/InspectionPage.jsx';

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

      {/* Nhóm route dành cho Technician dùng chung 1 layout */}
      <Route path="/technician" element={<TechnicianLayout />}>
        <Route index element={<TechnicianDashboardPage />} />
        <Route path="assigned-jobs" element={<AssignedJobsPage />} />
        <Route path="inspection" element={<InspectionPage />} />
        <Route path="inspection/:recordId" element={<InspectionPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;