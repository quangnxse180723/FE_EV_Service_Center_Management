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
import ServiceManagementPage from '../modules/admin/pages/ServiceManagementPage';
import PartsManagementPage from '../modules/admin/pages/PartsManagementPage';

// import layout và pages của technician
import TechnicianLayout from "../modules/technician/layouts/TechnicianLayout";
import TechnicianDashboardPage from "../modules/technician/pages/TechnicianDashboardPage";
import AssignedJobsPage from "../modules/technician/pages/AssignedJobsPage";
import ServiceTicketsPage from "../modules/technician/pages/ServiceTicketsPage";
import ServiceTicketDetailPage from "../modules/technician/pages/ServiceTicketDetailPage";
import InspectionCreatePage from "../modules/technician/pages/InspectionCreatePage";
import MaintenanceListPage from "../modules/technician/pages/MaintenanceListPage";
import CertificateManagementPage from "../modules/technician/pages/CertificateManagementPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* ===== Public Routes ===== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingPage />} />

      {/* ===== Technician Routes ===== */}
      <Route path="/technician" element={<TechnicianLayout />}>
        <Route index element={<TechnicianDashboardPage />} /> {/* Dashboard mặc định */}
        <Route path="assigned-jobs" element={<AssignedJobsPage />} />                  {/* Xe được phân công */}
        <Route path="service-orders" element={<ServiceTicketsPage />} />               {/* Danh sách phiếu */}
        <Route path="service-orders/:id" element={<ServiceTicketDetailPage />} />      {/* Chi tiết phiếu */}
        <Route path="inspection/create" element={<InspectionCreatePage />} />          {/* Biên bản kiểm tra */}
        <Route path="maintenance" element={<MaintenanceListPage />} />                 {/* Danh sách bảo dưỡng */}
        <Route path="certificates" element={<CertificateManagementPage />} />          {/* Quản lý chứng chỉ */}
      </Route>

      {/* ===== Admin Routes ===== */}
      <Route path="/admin/dashboard" element={<DashboardPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/admin/revenue" element={<RevenueManagementPage />} />
      <Route path="/admin/services" element={<ServiceManagementPage />} />
      <Route path="/admin/parts" element={<PartsManagementPage />} />
    </Routes>
  );
};

export default AppRouter;