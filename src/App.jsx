import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Public Pages
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import NotFoundPage from "./pages/NotFoundPage";

// Customer Pages
import BookingPage from './modules/customer/pages/BookingPage';

// Layouts
import StaffLayout from "./modules/staff/layout/StaffLayout";
import TechnicianLayout from "./modules/technician/layouts/TechnicianLayout";

// Staff Pages
import CustomerManagement from "./modules/staff/CustomerManagement/CustomerManagement";
import StaffDashboard from "./modules/staff/pages/DashboardPage";
import CheckinPage from "./modules/staff/pages/CheckinPage";
import ScheduleManagementPage from "./modules/staff/ScheduleManagement/ScheduleManagementPage";
import PartInventoryPage from "./modules/staff/pages/PartInventoryPage";
import InvoiceManagementPage from "./modules/staff/pages/InvoiceManagemetPage";
import VehicleManagement from "./modules/staff/pages/VehicleManagement";
import VehicleDetailPage from "./modules/staff/pages/VehicleDetailPage";
import ScheduleDetailPage from "./modules/staff/pages/ScheduleDetail/ScheduleDetailPage";

// Technician Pages
import TechnicianDashboardPage from "./modules/technician/pages/TechnicianDashboardPage";
import AssignedJobsPage from "./modules/technician/pages/AssignedJobsPage";
import ServiceTicketsPage from "./modules/technician/pages/ServiceTicketsPage";
import ServiceTicketDetailPage from "./modules/technician/pages/ServiceTicketDetailPage";
import InspectionCreatePage from "./modules/technician/pages/InspectionCreatePage";
import MaintenanceListPage from "./modules/technician/pages/MaintenanceListPage";
import CertificateManagementPage from "./modules/technician/pages/CertificateManagementPage";

// Admin Pages
import AdminDashboard from './modules/admin/pages/DashboardPage';
import UserManagementPage from './modules/admin/pages/UserManagementPage';
import RevenueManagementPage from './modules/admin/pages/RevenueManagementPage';
import ServiceManagementPage from './modules/admin/pages/ServiceManagementPage';
import PartsManagementPage from './modules/admin/pages/PartsManagementPage';

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Context
import { AuthProvider } from "./contexts/AuthContext";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===== Public Routes ===== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking" element={<BookingPage />} />

          {/* ===== Staff Routes (CHỈ STAFF) ===== */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/customers" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="schedules" element={<ScheduleManagementPage />} />
            <Route path="schedules/:id" element={<ScheduleDetailPage />} />
            <Route path="payments" element={<InvoiceManagementPage />} />
            <Route path="checkin" element={<CheckinPage />} />
            <Route path="inventory" element={<PartInventoryPage />} />
            <Route
              path="chat"
              element={
                <div style={{ padding: "2rem" }}>
                  Chat khách hàng - Coming soon
                </div>
              }
            />
          </Route>

          {/* ===== Technician Routes (CHỈ TECHNICIAN) ===== */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TechnicianDashboardPage />} />
            <Route path="assigned-jobs" element={<AssignedJobsPage />} />
            <Route path="service-orders" element={<ServiceTicketsPage />} />
            <Route path="service-orders/:id" element={<ServiceTicketDetailPage />} />
            <Route path="inspection/create" element={<InspectionCreatePage />} />
            <Route path="maintenance" element={<MaintenanceListPage />} />
            <Route path="certificates" element={<CertificateManagementPage />} />
          </Route>

          {/* ===== Admin Routes (CHỈ ADMIN) - KHÔNG CẦN LAYOUT ===== */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/revenue" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RevenueManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/services" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ServiceManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/parts" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PartsManagementPage />
            </ProtectedRoute>
          } />

          {/* Redirect /admin to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ===== 404 Not Found ===== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;