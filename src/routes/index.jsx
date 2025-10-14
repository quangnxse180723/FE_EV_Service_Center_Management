// src/routes/index.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';

import TechnicianLayout from '@/modules/technician/layouts/TechnicianLayout.jsx';
import DashboardPage     from '@/modules/technician/pages/DashboardPage.jsx';
import AssignedJobsPage  from '@/modules/technician/pages/AssignedJobsPage.jsx';
import InspectionPage    from '@/modules/technician/pages/InspectionPage.jsx';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Nhóm route dành cho Technician dùng chung 1 layout */}
      <Route path="/technician" element={<TechnicianLayout />}>
        <Route index element={<DashboardPage />} />          {/* /đặt dashboard làm trang mặc định */}
        <Route path="assigned-jobs" element={<AssignedJobsPage />} />
        <Route path="inspection" element={<InspectionPage />} />
        <Route path="inspection/:recordId" element={<InspectionPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;