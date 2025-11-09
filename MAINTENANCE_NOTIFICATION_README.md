# 🔔 Hệ Thống Thông Báo Bảo Dưỡng Tự Động

## 📋 Tổng Quan

Hệ thống **TỰ ĐỘNG** kiểm tra xe thực của customer và tạo thông báo khi xe sắp đến hoặc quá hạn bảo dưỡng định kỳ.

**🎯 Cách hoạt động:**
1. Customer đăng nhập vào hệ thống
2. Frontend tự động lấy danh sách xe thực từ database
3. Kiểm tra từng xe theo tiêu chí km và thời gian
4. Tạo thông báo tự động cho những xe cần bảo dưỡng
5. Hiển thị trong NotificationModal (icon chuông 🔔)

## 🎯 Tiêu Chí Bảo Dưỡng

## 🎯 Tiêu Chí Bảo Dưỡng

### Xe cần bảo dưỡng khi:
- **Theo km**: Mỗi 1000km
- **Theo thời gian**: Mỗi 3 tháng kể từ lần bảo dưỡng cuối

### Mức Độ Cảnh Báo:

#### 🔔 **Sắp đến hạn** (Warning - Màu vàng)
- Còn **≤ 100km** nữa đến mốc 1000km
- Hoặc còn **≤ 7 ngày** đến mốc 3 tháng

**Ví dụ:**
- Xe đã chạy 950km → Thông báo "Còn 50km"
- Xe bảo dưỡng cuối 83 ngày trước → Thông báo "Còn 7 ngày"

#### 🚨 **Quá hạn** (Urgent - Màu đỏ)
- Đã vượt mốc 1000km
- Hoặc đã vượt mốc 3 tháng

**Ví dụ:**
- Xe đã chạy 1200km → Thông báo "Quá 200km"
- Xe bảo dưỡng cuối 4 tháng trước → Thông báo "Quá 1 tháng"

## 🔄 Quy Trình Hoạt Động (Tự Động)

## 🔄 Quy Trình Hoạt Động (Tự Động)

```
1. Customer đăng nhập
   ↓
2. App.jsx kích hoạt useMaintenanceNotification(customerId)
   ↓
3. Hook delay 2 giây, sau đó gọi API lấy tất cả xe của customer
   ↓
4. Duyệt qua từng xe, kiểm tra:
   - vehicle.currentMileage (số km hiện tại)
   - vehicle.lastServiceDate (ngày bảo dưỡng cuối)
   ↓
5. Tính toán:
   levelByKm = Math.floor(currentMileage / 1000)
   levelByTime = Math.floor(monthsSince / 3)
   maintenanceLevel = Math.max(levelByKm, levelByTime)
   ↓
6. Nếu cần bảo dưỡng:
   - Kiểm tra duplicate (tránh spam)
   - Gọi API POST /notifications/maintenance
   - Tạo thông báo với message phù hợp
   ↓
7. Thông báo hiển thị trong NotificationModal
   Customer click → Navigate to /booking
```

## 📊 Dữ Liệu Thực Từ Database

### Dữ liệu xe customer cần có:

```javascript
{
  vehicleId: 123,
  licensePlate: "29A-123.45",
  model: "VinFast Feliz S",
  currentMileage: 1200,        // ⚠️ BẮT BUỘC: Số km hiện tại
  lastServiceDate: "2024-08-15" // ⚠️ BẮT BUỘC: Ngày bảo dưỡng cuối (YYYY-MM-DD)
}
```

**❗ Lưu ý quan trọng:**
- Nếu `currentMileage = 0` hoặc `null` → Chỉ kiểm tra theo thời gian
- Nếu `lastServiceDate = null` → Chỉ kiểm tra theo km
- Nếu cả 2 đều `null` → Không tạo thông báo

## 💡 Ví Dụ Thực Tế

### Case 1: Sắp đến hạn theo KM
```javascript
{
  licensePlate: "29A-111.11",
  currentMileage: 980,
  lastServiceDate: "2024-06-01" // 5 tháng trước
}
→ Level by KM: 0 (chưa đến 1000km)
→ Level by Time: 1 (đã 5 tháng > 3 tháng)
→ Maintenance Level: 1
→ 🔔 "Sắp đến kỳ bảo dưỡng (còn 20 km)"
```

### Case 2: Quá hạn cả 2
```javascript
{
  licensePlate: "29A-222.22",
  currentMileage: 2150,
  lastServiceDate: "2024-03-01" // 8 tháng trước
}
→ Level by KM: 2 (đã 2150km)
→ Level by Time: 2 (đã 8 tháng)
→ Maintenance Level: 2
→ 🚨 "Đã quá hạn! Quá 2 tháng và 150 km"
```

### Case 3: Xe mới chưa cần bảo dưỡng
```javascript
{
  licensePlate: "29A-333.33",
  currentMileage: 500,
  lastServiceDate: "2024-10-01" // 1 tháng trước
}
→ Level by KM: 0
→ Level by Time: 0
→ Maintenance Level: 0
→ ✅ Không tạo thông báo
```

## 🎨 Giao Diện Thông Báo

### Trong NotificationModal:

#### Files Đã Tạo/Cập Nhật:

1. **`src/hooks/useMaintenanceNotification.js`**
   - Hook tự động kiểm tra xe và tạo thông báo
   - Export: `useMaintenanceNotification(customerId)`

2. **`src/api/notificationApi.js`**
   - Thêm methods:
     - `createMaintenanceNotification(notificationData)`
     - `checkNotificationExists(accountId, vehicleId, type)`

3. **`src/components/shared/NotificationModal.jsx`**
   - Cải thiện UI với icon động
   - Phân loại theo type và priority

4. **`src/components/shared/NotificationModal.css`**
   - Styling cho notification-urgent và notification-warning
   - Animation pulse cho urgent notifications

5. **`src/App.jsx`**
   - Tích hợp hook vào AppContent
   - Tự động chạy khi customer đăng nhập

### Backend (Cần Implement)

#### 1. API Endpoint Cần Tạo

##### **POST `/api/notifications/maintenance`**

**Request Body:**
```json
{
  "accountId": 123,
  "message": "🔔 Xe 29A-123.45 (VinFast Feliz S) sắp đến kỳ bảo dưỡng...",
  "type": "MAINTENANCE_DUE", // hoặc "MAINTENANCE_OVERDUE"
  "priority": "warning", // hoặc "urgent"
  "vehicleId": 456,
  "link": "/booking"
}
```

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": 789,
    "accountId": 123,
    "message": "...",
    "type": "MAINTENANCE_DUE",
    "priority": "warning",
    "vehicleId": 456,
    "link": "/booking",
    "isRead": false,
    "createdAt": "2025-11-09T10:30:00Z"
  }
}
```

**Logic Backend Nên Xử Lý:**
- Kiểm tra duplicate: Không tạo thông báo mới nếu đã có thông báo tương tự trong vòng 24h
- Lưu vào database với các fields:
  - `notification_id` (PK)
  - `account_id` (FK)
  - `vehicle_id` (FK)
  - `message` (TEXT)
  - `type` (ENUM: 'MAINTENANCE_DUE', 'MAINTENANCE_OVERDUE', 'PAYMENT', 'SCHEDULE')
  - `priority` (ENUM: 'info', 'warning', 'urgent')
  - `link` (VARCHAR)
  - `is_read` (BOOLEAN, default: false)
  - `created_at` (TIMESTAMP)

##### **GET `/api/notifications/check`**

**Query Params:**
- `accountId`: ID tài khoản
- `vehicleId`: ID xe
- `type`: Loại thông báo

**Response:**
```json
{
  "exists": true,
  "notification": { ... } // Nếu tồn tại
}
```

#### 2. Database Schema

```sql
CREATE TABLE notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  vehicle_id INT NULL,
  message TEXT NOT NULL,
  type ENUM('MAINTENANCE_DUE', 'MAINTENANCE_OVERDUE', 'PAYMENT', 'SCHEDULE') NOT NULL,
  priority ENUM('info', 'warning', 'urgent') DEFAULT 'info',
  link VARCHAR(255) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
  
  INDEX idx_account_unread (account_id, is_read),
  INDEX idx_vehicle_type (vehicle_id, type),
  INDEX idx_created_at (created_at)
);
```

#### 3. Business Logic Backend Nên Có

```java
// Pseudo code
public NotificationResponse createMaintenanceNotification(NotificationRequest request) {
    // 1. Kiểm tra duplicate trong 24h
    Notification existing = notificationRepo.findByAccountAndVehicleAndType(
        request.getAccountId(),
        request.getVehicleId(), 
        request.getType(),
        LocalDateTime.now().minusHours(24)
    );
    
    if (existing != null && !existing.isRead()) {
        // Đã có thông báo tương tự chưa đọc -> không tạo mới
        return new NotificationResponse(false, "Duplicate notification", existing);
    }
    
    // 2. Tạo thông báo mới
    Notification notification = new Notification();
    notification.setAccountId(request.getAccountId());
    notification.setVehicleId(request.getVehicleId());
    notification.setMessage(request.getMessage());
    notification.setType(request.getType());
    notification.setPriority(request.getPriority());
    notification.setLink(request.getLink());
    notification.setIsRead(false);
    
    notificationRepo.save(notification);
    
    // 3. Có thể gửi email/SMS nếu urgent
    if ("urgent".equals(request.getPriority())) {
        emailService.sendMaintenanceAlert(notification);
    }
    
    return new NotificationResponse(true, "Notification created", notification);
}
```

## 📱 User Experience Flow

1. **Customer đăng nhập** → Frontend tự động gọi `useMaintenanceNotification(customerId)`
2. **Hook kiểm tra** → Lấy danh sách xe của customer từ API
3. **Tính toán** → Với mỗi xe, kiểm tra:
   - Số km hiện tại vs mốc 1000km
   - Thời gian kể từ lần bảo dưỡng cuối vs 3 tháng
4. **Tạo thông báo** → Nếu cần, gọi API `POST /notifications/maintenance`
5. **Hiển thị** → Thông báo xuất hiện trong NotificationModal với icon 🔔/🚨

## 🎨 UI Components

### Notification Types:

| Type | Icon | Background | Border | Animation |
|------|------|------------|--------|-----------|
| MAINTENANCE_DUE | 🔔 | #fff3e0 (vàng) | #ff9800 | None |
| MAINTENANCE_OVERDUE | 🚨 | #ffebee (đỏ) | #f44336 | Pulse |
| PAYMENT | 💳 | #e3f2fd (xanh) | #2196f3 | None |
| SCHEDULE | 📅 | #e3f2fd (xanh) | #2196f3 | None |

## 🔄 Testing

### Test Cases:

1. **Xe mới chưa bảo dưỡng lần nào** (0 km, no lastServiceDate)
   - ✅ Không tạo thông báo

2. **Xe đã chạy 950 km** (chưa đến 1000 km)
   - ✅ Tạo thông báo "Còn 50 km"

3. **Xe đã chạy 1200 km** (quá 1000 km)
   - ✅ Tạo thông báo "Quá 200 km"

4. **Xe bảo dưỡng cuối 2.5 tháng trước**
   - ✅ Tạo thông báo "Còn khoảng 15 ngày"

5. **Xe bảo dưỡng cuối 4 tháng trước**
   - ✅ Tạo thông báo "Quá 1 tháng"

6. **Xe vừa quá km VÀ quá thời gian**
   - ✅ Tạo thông báo "Quá X tháng và Y km"

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console log: `🔍 Checking maintenance for vehicles`
2. Kiểm tra API response trong Network tab
3. Verify localStorage có `customerId` không

## 🚀 Future Enhancements

- [ ] Thêm setting để customer tắt/bật thông báo tự động
- [ ] Gửi email/SMS khi quá hạn
- [ ] Thông báo push notification (PWA)
- [ ] Dashboard admin xem thống kê xe cần bảo dưỡng
- [ ] Tự động đề xuất lịch hẹn khả dụng
