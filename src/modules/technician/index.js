export { default as TechnicianLayout } from "./layouts/TechnicianLayout";
export { default as DashboardPage }    from "./pages/DashboardPage";
export { default as AssignedJobsPage } from "./pages/AssignedJobsPage";
export { default as InspectionPage }   from "./pages/InspectionPage";
export { useAssignedJobs } from "./hooks/useAssignedJobs";
export { useChecklist } from "./hooks/useChecklist";

// New component exports (wrappers that reuse existing components)
export { default as AssignedJobsTable } from "./components/AssignedJobsTable";
export { default as ServiceTicketTable } from "./components/ServiceTicketTable";
export { default as InspectionForm } from "./components/InspectionForm";

// Utilities
export * as TechnicianConstants from "./utils/technicianConstants";
