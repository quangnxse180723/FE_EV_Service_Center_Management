# ✅ CHECKLIST - Booking với Time Slots

## 📋 Frontend (Đã hoàn thành)

### BookingPage.jsx
- [x] Fetch time slots từ API khi vào Step 3
- [x] Hiển thị time slots theo sáng/chiều
- [x] Cho phép chọn time slot
- [x] Gửi đầy đủ thông tin khi submit:
  ```javascript
  {
    customerId: number,
    vehicleId: number,
    centerId: number,
    slotId: number,        // ← Quan trọng!
    scheduledDate: string, // "2025-10-28"
    scheduledTime: string, // "09:00"
    serviceId: number | null,
    notes: string
  }
  ```

### scheduleApi.js
- [x] `getAvailableTimeSlots(centerId, date)` - Fetch slots
- [x] `bookSchedule(bookingData)` - Submit booking

## 🔧 Backend (Bạn đã fix)

### BookScheduleRequest.java
```java
public class BookScheduleRequest {
    private Integer customerId;
    private Integer vehicleId;
    private Integer centerId;
    private Integer slotId;        // ✅ Field này
    private String scheduledDate;  // "2025-10-28"
    private String scheduledTime;  // "09:00"
    private Integer serviceId;
    private String notes;
    // getters/setters...
}
```

### Service/Repository
- [ ] Map `slotId` từ request vào entity
- [ ] Insert vào database với slot_id

## 🧪 Test Steps

### 1. Test Time Slots API
```javascript
// Copy từ file quick-test-timeslots.js
// Paste vào Console tại http://localhost:5173/booking
```

**Expected:**
```
✅ Response Received!
📦 Data Summary:
  ├─ Total Slots: 19
  ├─ ☀️ Morning: 8 slots
  ├─ 🌙 Afternoon: 11 slots
```

### 2. Test Booking Flow

**Step 1: Chọn xe**
- [ ] Hiển thị danh sách xe của customer
- [ ] Có thể chọn xe
- [ ] Click "Tiếp tục" → Step 2

**Step 2: Chọn trung tâm**
- [ ] Hiển thị danh sách trung tâm
- [ ] Có thể search trung tâm
- [ ] Chọn trung tâm
- [ ] Click "Tiếp tục" → Step 3

**Step 3: Chọn ngày & giờ**
- [ ] Date picker hiển thị (default = today)
- [ ] Khi chọn ngày → Tự động fetch time slots
- [ ] Hiển thị time slots sáng/chiều
- [ ] Time slots có màu sắc:
  - Xanh lá = Available (available > 3)
  - Cam = Few (available 1-3)
  - Đỏ = Full (available = 0, disabled)
- [ ] Chọn time slot → Highlight màu xanh dương
- [ ] Click "Tiếp tục" → Step 4

**Step 4: Xác nhận**
- [ ] Hiển thị thông tin khách hàng
- [ ] Hiển thị thông tin booking (xe, trung tâm, ngày, giờ)
- [ ] Có nút "Chỉnh sửa thông tin"
- [ ] Click "Xác nhận" → Gọi API

### 3. Kiểm tra Console Logs

Khi click "Xác nhận" ở Step 4:

```javascript
📤 Sending booking data: {
  "customerId": 1,
  "vehicleId": 1,
  "centerId": 1,
  "slotId": 3,              // ✅ Phải có
  "scheduledDate": "2025-10-28",
  "scheduledTime": "09:00",
  "serviceId": null,
  "notes": ""
}

📅 Validation: {
  customerId: 1,
  vehicleId: 1,
  centerId: 1,
  slotId: 3,               // ✅ Phải có
  scheduledDate: "2025-10-28",
  scheduledTime: "09:00",
  serviceId: null
}

✅ Booking response: {
  scheduleId: 123,
  status: "PENDING",
  ...
}
```

### 4. Kiểm tra Database

```sql
SELECT * FROM maintenance_schedule 
WHERE customer_id = 1 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected columns:**
- `slot_id` ✅ NOT NULL (có giá trị)
- `scheduled_date` = "2025-10-28"
- `vehicle_id` = 1
- `center_id` = 1
- `customer_id` = 1
- `status` = "PENDING"
- `notes` = ""

## ❌ Troubleshooting

### Lỗi: "slot_id cannot be null"
- [ ] Backend có nhận `slotId` từ request không?
- [ ] Service có map `request.getSlotId()` vào entity không?
- [ ] Database constraint có yêu cầu NOT NULL không?

### Lỗi: Time slots không hiển thị
- [ ] Backend API `/available-slots` đã implement?
- [ ] CORS cho phép localhost:5173?
- [ ] Response format đúng: `[{slotId, time, available, total}]`?

### Lỗi: Không chọn được time slot
- [ ] Console có lỗi không?
- [ ] State `selectedTimeSlot` có được update không?
- [ ] Button có class "selected" không?

## 🎯 Success Criteria

✅ Booking thành công khi:
1. Không có lỗi SQL "slot_id cannot be null"
2. Alert hiển thị "Đặt lịch thành công!"
3. Redirect về `/booking-history`
4. Database có record mới với đầy đủ thông tin
5. Time slots hiển thị từ API thực (không phải mock data)

## 📞 Support

Nếu vẫn còn lỗi, cung cấp:
1. Screenshot lỗi alert
2. Console log (📤 Sending booking data...)
3. Backend log (nếu có)
4. Database schema của table `maintenance_schedule`
