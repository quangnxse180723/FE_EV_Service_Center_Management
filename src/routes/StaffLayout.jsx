import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffLayout from '../modules/staff/layout/StaffLayout';

// Staff Pages
import DashboardPage from '../modules/staff/pages/DashboardPage';
import CustomerManagement from '../modules/staff/CustomerManagement/CustomerManagement';
import VehicleManagement from '../modules/staff/pages/VehicleManagement';
import VehicleDetailPage from '../modules/staff/pages/VehicleDetailPage';
import ScheduleManagementPage from '../modules/staff/pages/ScheduleManagementPage';
import CheckinPage from '../modules/staff/pages/CheckinPage';
import PartInventoryPage from '../modules/staff/pages/PartInventoryPage';
import InvoiceManagementPage from '../modules/staff/pages/InvoiceManagemetPage';

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="vehicles" element={<VehicleManagement />} />
        <Route path="vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="schedules" element={<ScheduleManagementPage />} />
        <Route path="payments" element={<InvoiceManagementPage />} />
        <Route path="chat" element={<div>Chat khách hàng - Coming soon</div>} />
        <Route path="checkin" element={<CheckinPage />} />
        <Route path="inventory" element={<PartInventoryPage />} />
      </Route>
    </Routes>
  );
};

export default StaffRoutes;