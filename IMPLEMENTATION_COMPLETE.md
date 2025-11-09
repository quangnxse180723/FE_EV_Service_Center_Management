# ✅ MAINTENANCE NOTIFICATION SYSTEM - HOÀN TẤT

## 🎯 TỔNG QUAN

Hệ thống thông báo bảo dưỡng tự động đã được implement hoàn chỉnh và sẵn sàng hoạt động với **DỮ LIỆU THỰC** từ xe của customer.

---

## 📦 CÁC FILE ĐÃ TẠO/CẬP NHẬT

### 1. **Hook chính** (Tự động kiểm tra)
📁 `src/hooks/useMaintenanceNotification.js`
- Logic kiểm tra xe cần bảo dưỡng
- Tự động gọi API lấy danh sách xe thực
- Tạo thông báo khi cần

### 2. **API Integration**
📁 `src/api/notificationApi.js`
- `createMaintenanceNotification()` - Tạo thông báo mới
- `checkNotificationExists()` - Kiểm tra trùng lặp

### 3. **UI Components**
📁 `src/components/shared/NotificationModal.jsx`
- Hiển thị thông báo với icon động (🔔/🚨)
- Phân loại theo priority (warning/urgent)
- Click vào thông báo → Chuyển đến trang đặt lịch

📁 `src/components/shared/NotificationModal.css`
- Styling cho notification-warning (màu vàng)
- Styling cho notification-urgent (màu đỏ + animation pulse)

### 4. **Integration**
📁 `src/App.jsx`
- Tích hợp `useMaintenanceNotification(customerId)`
- Tự động chạy khi customer đăng nhập

---

## 🔄 CÁCH HOẠT ĐỘNG

### Quy Trình Tự Động:

```
1. Customer đăng nhập
      ↓
2. App.jsx tự động kích hoạt useMaintenanceNotification
      ↓
3. Delay 2 giây → Gọi API GET /vehicles/customer/{customerId}
      ↓
4. Nhận danh sách xe THỰC từ database:
   [
     {
       vehicleId: 1,
       licensePlate: "29A-111.11",
       model: "VinFast Feliz S",
       currentMileage: 980,           ← Số km thực từ DB
       lastServiceDate: "2024-06-01"  ← Ngày bảo dưỡng cuối từ DB
     },
     ...
   ]
      ↓
5. Với MỖI xe, tính toán:
   - Level by KM: Math.floor(currentMileage / 1000)
   - Level by Time: Math.floor(monthsSince / 3)
   - Maintenance Level: Max của 2 số trên
      ↓
6. Nếu xe CẦN BẢO DƯỠNG:
   - Tạo message phù hợp (sắp đến hạn / quá hạn)
   - Gọi API POST /notifications/maintenance
      ↓
7. Thông báo xuất hiện trong NotificationModal
   Customer click → Navigate to /booking
```

---

## 📊 TIÊU CHÍ BẢO DƯỠNG

### 🔔 Sắp đến hạn (Warning)
- Còn ≤ 100km đến mốc 1000km
- HOẶC còn ≤ 7 ngày đến mốc 3 tháng

**Ví dụ thực tế:**
- Xe đã chạy 950km → Thông báo "🔔 Còn 50km"
- Xe bảo dưỡng 83 ngày trước → Thông báo "🔔 Còn 7 ngày"

### 🚨 Quá hạn (Urgent)
- Đã vượt mốc 1000km
- HOẶC đã vượt mốc 3 tháng

**Ví dụ thực tế:**
- Xe đã chạy 1200km → Thông báo "🚨 Quá 200km"
- Xe bảo dưỡng 4 tháng trước → Thông báo "🚨 Quá 1 tháng"

---

## ⚙️ BACKEND CẦN IMPLEMENT

### API Endpoint Cần Tạo:

#### 1. **POST /api/notifications/maintenance**

**Request Body:**
```json
{
  "accountId": 123,
  "message": "🔔 Xe 29A-123.45 (VinFast Feliz S) sắp đến kỳ bảo dưỡng (còn 50 km). Hãy đặt lịch sớm!",
  "type": "MAINTENANCE_DUE",
  "priority": "warning",
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

**Logic Backend nên có:**
- ✅ Kiểm tra duplicate: Không tạo nếu đã có thông báo tương tự trong 24h
- ✅ Lưu vào database
- ✅ (Tùy chọn) Gửi email/SMS nếu priority = "urgent"

#### 2. **GET /api/notifications/check**

**Query Params:**
```
?accountId=123&vehicleId=456&type=MAINTENANCE_DUE
```

**Response:**
```json
{
  "exists": true,
  "notification": { ... }
}
```

### Database Schema:

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
  
  FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
  
  INDEX idx_account_unread (account_id, is_read),
  INDEX idx_vehicle_type (vehicle_id, type),
  INDEX idx_created_at (created_at)
);
```

---

## 🧪 CÁCH TEST

### Bước 1: Chuẩn bị dữ liệu test

Thêm xe vào database với các trường hợp:

```sql
-- Case 1: Sắp đến hạn (còn 50km)
INSERT INTO vehicles (customer_id, license_plate, model, current_mileage, last_service_date)
VALUES (1, '29A-111.11', 'VinFast Feliz S', 950, '2024-06-01');

-- Case 2: Quá hạn (1200km và 5 tháng)
INSERT INTO vehicles (customer_id, license_plate, model, current_mileage, last_service_date)
VALUES (1, '29A-222.22', 'VinFast Klara S', 1200, '2024-06-01');

-- Case 3: Xe mới (không cần bảo dưỡng)
INSERT INTO vehicles (customer_id, license_plate, model, current_mileage, last_service_date)
VALUES (1, '29A-333.33', 'Yadea Ulike', 500, '2024-10-01');
```

### Bước 2: Test Frontend

1. Đăng nhập với tài khoản customer có xe trên
2. Chờ 2 giây
3. Kiểm tra Console:
   ```
   🔍 Checking maintenance for vehicles: 3
   ⚠️ Maintenance needed: { licensePlate: '29A-111.11', ... }
   ⚠️ Maintenance needed: { licensePlate: '29A-222.22', ... }
   ✅ Notification created for: 29A-111.11
   ✅ Notification created for: 29A-222.22
   ✅ Maintenance check completed: 2 notifications processed
   ```
4. Click icon chuông 🔔 → Xem 2 thông báo
5. Click vào thông báo → Chuyển đến trang đặt lịch

### Bước 3: Verify Database

```sql
SELECT * FROM notifications 
WHERE account_id = 1 
AND type IN ('MAINTENANCE_DUE', 'MAINTENANCE_OVERDUE')
ORDER BY created_at DESC;
```

---

## 🎨 GIAO DIỆN

### Thông báo sắp đến hạn (Warning):
```
┌─────────────────────────────────────────────┐
│ 🔔  Xe 29A-111.11 (VinFast Feliz S)        │
│     sắp đến kỳ bảo dưỡng (còn 50 km).      │
│     Hãy đặt lịch sớm!                       │
│                                             │
│     09/11/2025, 10:30:00                    │
└─────────────────────────────────────────────┘
Background: #fff3e0 (vàng nhạt)
Border-left: 4px solid #ff9800
```

### Thông báo quá hạn (Urgent):
```
┌─────────────────────────────────────────────┐
│ 🚨  Xe 29A-222.22 (VinFast Klara S)        │
│     đã quá hạn bảo dưỡng!                   │
│     Quá 2 tháng và 200 km.                  │
│     Vui lòng đặt lịch ngay!                 │
│                                             │
│     09/11/2025, 10:30:00                    │
└─────────────────────────────────────────────┘
Background: #ffebee (đỏ nhạt)
Border-left: 4px solid #f44336
Animation: Pulse (nhấp nháy nhẹ)
```

---

## 🐛 TROUBLESHOOTING

### Không thấy thông báo?

**Kiểm tra:**
1. Console có log `🔍 Checking maintenance for vehicles`?
   - ❌ Không → customerId không hợp lệ
   - ✅ Có → Tiếp tục

2. Console có log `⚠️ Maintenance needed`?
   - ❌ Không → Xe chưa đến kỳ bảo dưỡng
   - ✅ Có → Backend chưa implement API

3. Console có log `✅ Notification created`?
   - ❌ Không → Backend API lỗi
   - ✅ Có → Notification đã được tạo

4. Click icon chuông → Có thông báo không?
   - ❌ Không → API GET /notifications lỗi
   - ✅ Có → Thành công!

### API Error 404?

Backend chưa implement endpoint. Cần tạo:
- `POST /api/notifications/maintenance`
- `GET /api/notifications/check`

---

## 📝 CHECKLIST

### Frontend (✅ Hoàn thành):
- [x] Hook useMaintenanceNotification
- [x] API integration
- [x] UI NotificationModal
- [x] Styling cho warning/urgent
- [x] Tích hợp vào App.jsx
- [x] Logic tính toán bảo dưỡng
- [x] Kiểm tra duplicate
- [x] Navigate to booking page

### Backend (⏳ Cần implement):
- [ ] Endpoint POST /api/notifications/maintenance
- [ ] Endpoint GET /api/notifications/check
- [ ] Database table notifications
- [ ] Logic check duplicate (24h)
- [ ] (Optional) Email/SMS alert cho urgent

---

## 📞 LƯU Ý QUAN TRỌNG

### Dữ liệu xe PHẢI CÓ:
```javascript
{
  vehicleId: number,          // ID xe
  licensePlate: string,        // Biển số
  model: string,               // Model xe
  currentMileage: number,      // ⚠️ BẮT BUỘC: Số km hiện tại
  lastServiceDate: string      // ⚠️ BẮT BUỘC: "YYYY-MM-DD"
}
```

**Nếu thiếu currentMileage hoặc lastServiceDate:**
- Hệ thống sẽ bỏ qua xe đó
- KHÔNG tạo thông báo

### Tránh Spam:
- Chỉ kiểm tra khi customer đăng nhập (không liên tục)
- Backend check duplicate trong 24h
- Nếu đã có thông báo chưa đọc → Không tạo mới

---

## 🚀 NEXT STEPS

1. **Backend team**: Implement 2 API endpoints
2. **Test**: Thêm dữ liệu xe test vào database
3. **Verify**: Đăng nhập và kiểm tra thông báo
4. **Production**: Deploy khi test thành công

---

**Hệ thống đã sẵn sàng! Chỉ cần Backend implement API là có thể hoạt động ngay.** 🎉
