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

// Layouts
import StaffLayout from "./modules/staff/layout/StaffLayout";
import TechnicianLayout from './modules/technician/layouts/TechnicianLayout.jsx';

// Staff Pages
import CustomerManagement from "./modules/staff/CustomerManagement/CustomerManagement";
import StaffDashboard from "./modules/staff/pages/DashboardPage"; // ✅ Đổi tên
import CheckinPage from "./modules/staff/pages/CheckinPage";
import ScheduleManagementPage from "./modules/staff/ScheduleManagement/ScheduleManagementPage";
import PartInventoryPage from "./modules/staff/pages/PartInventoryPage";
import InvoiceManagementPage from "./modules/staff/pages/InvoiceManagemetPage";
import VehicleManagement from "./modules/staff/pages/VehicleManagement";
import VehicleDetailPage from "./modules/staff/pages/VehicleDetailPage";
import ScheduleDetailPage from "./modules/staff/pages/ScheduleDetail/ScheduleDetailPage";

// Technician Pages
import TechnicianDashboard from './modules/technician/pages/DashboardPage.jsx'; // ✅ Đổi tên
import AssignedJobsPage from './modules/technician/pages/AssignedJobsPage.jsx';
import InspectionPage from './modules/technician/pages/InspectionPage.jsx';

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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Staff Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} /> {/* ✅ Dùng tên mới */}
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="schedules" element={<ScheduleManagementPage />} />
            <Route path="schedules/:id" element={<ScheduleDetailPage />} />
            <Route path="payments" element={<InvoiceManagementPage />} />
            <Route
              path="chat"
              element={
                <div style={{ padding: "2rem" }}>
                  Chat khách hàng - Coming soon
                </div>
              }
            />
            <Route path="checkin" element={<CheckinPage />} />
            <Route path="inventory" element={<PartInventoryPage />} />
          </Route>

          {/* Protected Technician Routes */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN", "ADMIN"]}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TechnicianDashboard />} /> {/* ✅ Dùng tên mới */}
            <Route path="assigned-jobs" element={<AssignedJobsPage />} />
            <Route path="inspection" element={<InspectionPage />} />
            <Route path="inspection/:recordId" element={<InspectionPage />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
