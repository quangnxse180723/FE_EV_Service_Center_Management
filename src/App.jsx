import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ===== Contexts =====
import { AuthProvider } from "./contexts/AuthContext";

// ===== Components =====
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/chat-widget/ChatWidget";

// ===== Public Pages =====
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// ===== Auth Pages =====
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";

// ===== Customer Pages =====
import BookingPage from "./modules/customer/pages/BookingPage";
import BookingHistoryPage from "./modules/customer/pages/BookingHistoryPage";
import MyVehiclesPage from "./modules/customer/pages/MyVehiclesPage";
import PaymentHistoryPage from "./modules/customer/pages/PaymentHistoryPage";
import CustomerProfilePage from "./modules/customer/pages/CustomerProfilePage";

// ===== Staff Layout & Pages =====
import StaffLayout from "./modules/staff/layout/StaffLayout";
import StaffDashboard from "./modules/staff/pages/DashboardPage";
import CustomerManagement from "./modules/staff/CustomerManagement/CustomerManagement";
import VehicleManagement from "./modules/staff/pages/VehicleManagement";
import VehicleDetailPage from "./modules/staff/pages/VehicleDetailPage";
import ScheduleManagementPage from "./modules/staff/ScheduleManagement/ScheduleManagementPage";
import ScheduleDetailPage from "./modules/staff/pages/ScheduleDetail/ScheduleDetailPage";
import PaymentManagementPage from "./modules/staff/pages/PaymentManagementPage";
import InvoiceDetailPage from "./modules/staff/pages/InvoiceDetailPage";
import CheckinPage from "./modules/staff/pages/CheckinPage";
import PartInventoryPage from "./modules/staff/pages/PartInventoryPage";

// ===== Admin Pages =====
import AdminDashboard from "./modules/admin/pages/DashboardPage";
import UserManagementPage from "./modules/admin/pages/UserManagementPage";
import RevenueManagementPage from "./modules/admin/pages/RevenueManagementPage";
import ServiceManagementPage from "./modules/admin/pages/ServiceManagementPage";
import PartsManagementPage from "./modules/admin/pages/PartsManagementPage";
import VehicleManagementPage from "./modules/admin/pages/VehicleManagementPage";
import SystemSettingsPage from "./modules/admin/pages/SystemSettingsPage";

// ===== Technician Layout & Pages =====
import TechnicianLayout from "./modules/technician/layouts/TechnicianLayout";
import TechnicianDashboardPage from "./modules/technician/pages/DashboardPage";
import AssignedJobsPage from "./modules/technician/pages/AssignedJobsPage";
import InspectionPage from "./modules/technician/pages/InspectionPage";
import ServiceTicketsPage from "./modules/technician/pages/ServiceTicketsPage";
import ServiceTicketDetailPage from "./modules/technician/pages/ServiceTicketDetailPage";

// ===== Chat Pages =====
import CustomerChatPage from "./modules/chat/pages/CustomerChatPage";
import StaffChatPage from "./modules/chat/pages/StaffChatPage";

// ===== Styles =====
import "./App.css";
import { useAuth } from "./hooks/useAuth";

/**
 * AppContent component với ChatWidget
 */
function AppContent() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <>
      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ===== Customer Routes ===== */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-history" element={<BookingHistoryPage />} />
        <Route path="/my-vehicles" element={<MyVehiclesPage />} />
        <Route path="/payment-history" element={<PaymentHistoryPage />} />
        <Route path="/customer-profile" element={<CustomerProfilePage />} />
          <Route path="/customer/chat" element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerChatPage />
            </ProtectedRoute>
          } />

          {/* ===== Staff Routes ===== */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="schedules" element={<ScheduleManagementPage />} />
            <Route path="schedules/:scheduleId" element={<ScheduleDetailPage />} />
            <Route path="payments" element={<PaymentManagementPage />} />
            <Route path="payments/:scheduleId" element={<InvoiceDetailPage />} />
            <Route path="checkin" element={<CheckinPage />} />
            <Route path="inventory" element={<PartInventoryPage />} />
            <Route path="chat" element={<StaffChatPage />} />
          </Route>

          {/* ===== Admin Routes ===== */}
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
          
          <Route path="/admin/vehicles" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <VehicleManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SystemSettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ===== Technician Routes ===== */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TechnicianDashboardPage />} />
            <Route path="dashboard" element={<TechnicianDashboardPage />} />
            <Route path="assigned-jobs" element={<AssignedJobsPage />} />
            <Route path="inspection" element={<InspectionPage />} />
            <Route path="inspection/:recordId" element={<InspectionPage />} />
            <Route path="services" element={<ServiceTicketsPage />} />
            <Route path="services/:ticketId" element={<ServiceTicketDetailPage />} />
            <Route path="maintenance-list" element={<div style={{ padding: '2rem' }}>Danh sách bảo dưỡng - Coming soon</div>} />
          </Route>

          {/* ===== 404 Not Found ===== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Chat Widget - Chỉ hiện cho CUSTOMER */}
        {isCustomer && <ChatWidget user={user} />}
      </>
    );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;