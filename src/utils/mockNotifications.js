// Mock data thông báo dùng chung cho toàn bộ ứng dụng
export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'parts_proposal',
    title: 'Đề xuất thay thế phụ tùng',
    message: 'Kỹ thuật viên đề xuất thay thế 3 phụ tùng cho xe VinFast Feliz S (29A-123.45). Nhấn để xem chi tiết.',
    vehicleLicense: '29A-123.45',
    isRead: false,
    createdAt: '2024-11-01T10:30:00Z',
    priority: 'high',
    proposedParts: [
      { id: 1, tenLinhKien: 'Phanh tay', giaLinhKien: 200000, giaCongTho: 50000, quantity: 2 },
      { id: 6, tenLinhKien: 'Ắc quy Li-on', giaLinhKien: 1000000, giaCongTho: 80000, quantity: 1 },
      { id: 10, tenLinhKien: 'Vành xe trước', giaLinhKien: 300000, giaCongTho: 80000, quantity: 1 }
    ]
  },
  {
    id: 2,
    type: 'maintenance_due',
    title: 'Lịch bảo dưỡng định kỳ',
    message: 'Xe VinFast Feliz S (29A-123.45) sắp đến hạn bảo dưỡng định kỳ vào ngày 15/11/2024',
    vehicleLicense: '29A-123.45',
    dueDate: '2024-11-15',
    isRead: false,
    createdAt: '2024-10-18T10:00:00Z',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'maintenance_overdue',
    title: 'Quá hạn bảo dưỡng',
    message: 'Xe Yadea Ulike (30B-456.78) đã quá hạn bảo dưỡng từ ngày 10/10/2024. Vui lòng đặt lịch ngay!',
    vehicleLicense: '30B-456.78',
    dueDate: '2024-10-10',
    isRead: false,
    createdAt: '2024-10-17T14:30:00Z',
    priority: 'urgent'
  },
  {
    id: 4,
    type: 'maintenance_reminder',
    title: 'Nhắc nhở bảo dưỡng',
    message: 'Xe VinFast Feliz S (29A-123.45) sẽ đến hạn bảo dưỡng trong 7 ngày tới',
    vehicleLicense: '29A-123.45',
    dueDate: '2024-11-15',
    isRead: true,
    createdAt: '2024-10-16T09:15:00Z',
    priority: 'medium'
  },
  {
    id: 5,
    type: 'service_completed',
    title: 'Hoàn thành bảo dưỡng',
    message: 'Xe VinFast Feliz S (29A-123.45) đã hoàn thành bảo dưỡng định kỳ. Lần bảo dưỡng tiếp theo: 15/05/2025',
    vehicleLicense: '29A-123.45',
    dueDate: '2025-05-15',
    isRead: true,
    createdAt: '2024-10-15T16:45:00Z',
    priority: 'low'
  },
  {
    id: 6,
    type: 'appointment_confirmed',
    title: 'Xác nhận lịch hẹn',
    message: 'Lịch hẹn bảo dưỡng xe Yadea Ulike (30B-456.78) đã được xác nhận vào 20/10/2024 lúc 9:00',
    vehicleLicense: '30B-456.78',
    dueDate: '2024-10-20',
    isRead: false,
    createdAt: '2024-10-14T11:20:00Z',
    priority: 'medium'
  }
];

// Hàm đếm số thông báo chưa đọc
export const getUnreadCount = (notifications = MOCK_NOTIFICATIONS) => {
  return notifications.filter(n => !n.isRead).length;
};
