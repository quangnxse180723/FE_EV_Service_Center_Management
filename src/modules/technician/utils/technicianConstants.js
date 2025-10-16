export const TECH_ACTIONS = ["Thay thế", "Kiểm tra", "Bôi trơn"];

export const TECH_STATUS = {
  APPROVED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  PROCESSING: "Đang xử lý",
  DONE: "Hoàn tất",
};

export const TECH_ROUTES = {
  ROOT: "/technician",
  ASSIGNED: "/technician/assigned-jobs",
  SERVICE_LIST: "/technician/service-orders",
  INSPECTION_CREATE: "/technician/inspection/create",
  MAINTENANCE: "/technician/maintenance",
  CERTS: "/technician/certificates",
};

export const TECH_PAGE_TITLES = {
  [TECH_ROUTES.ROOT]: "Dashboard",
  [TECH_ROUTES.ASSIGNED]: "Xe được phân công",
  [TECH_ROUTES.SERVICE_LIST]: "Phiếu dịch vụ",
  [TECH_ROUTES.INSPECTION_CREATE]: "Biên bản kiểm tra",
  [TECH_ROUTES.MAINTENANCE]: "Danh sách bảo dưỡng",
  [TECH_ROUTES.CERTS]: "Quản lý chứng chỉ",
};
