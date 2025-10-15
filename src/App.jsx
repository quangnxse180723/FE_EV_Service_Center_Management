import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import HomePage from './pages/HomePage/HomePage';
import Login from './pages/Login/Login';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import StaffLayout from './modules/staff/layout/StaffLayout';

// Staff Pages
import CustomerManagement from './modules/staff/CustomerManagement/CustomerManagement';
import DashboardPage from './modules/staff/pages/DashboardPage';
import CheckinPage from './modules/staff/pages/CheckinPage';
import ScheduleManagementPage from './modules/staff/pages/ScheduleManagementPage';
import PartInventoryPage from './modules/staff/pages/PartInventoryPage';
import InvoiceManagementPage from './modules/staff/pages/InvoiceManagemetPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './contexts/AuthContext';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Staff Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="checkin" element={<CheckinPage />} />
            <Route path="schedules" element={<ScheduleManagementPage />} />
            <Route path="inventory" element={<PartInventoryPage />} />
            <Route path="invoices" element={<InvoiceManagementPage />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;