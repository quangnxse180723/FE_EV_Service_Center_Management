# Test Time Slots API Integration

## ✅ Đã hoàn thành

### 1. Frontend Changes

#### `scheduleApi.js`
```javascript
getAvailableTimeSlots: (centerId, date) => {
  return axiosClient.get('/customer/schedules/available-slots', {
    params: { centerId, date }
  });
}
```

#### `BookingPage.jsx`
- ✅ Thêm state `timeSlots` và `loadingSlots`
- ✅ Xóa hardcoded `morningSlots` và `afternoonSlots`
- ✅ Thêm function `fetchTimeSlots()` để gọi API
- ✅ Auto-fetch khi thay đổi `selectedCenter` hoặc `bookingDate`
- ✅ Tự động set ngày mặc định là hôm nay khi vào Step 3
- ✅ Clear selected time slot khi thay đổi ngày/trung tâm
- ✅ Hiển thị loading state và error messages
- ✅ Tự động phân chia sáng/chiều dựa trên giờ
- ✅ Tự động xác định status (available/few/full)

### 2. Backend API (Đã có sẵn)

**Endpoint:** `GET /api/customer/schedules/available-slots`

**Query Parameters:**
- `centerId` (Integer) - ID của trung tâm bảo dưỡng
- `date` (String) - Ngày đặt lịch (format: YYYY-MM-DD, ví dụ: "2025-10-28")

**Expected Response:**
```json
[
  {
    "slotId": 1,
    "time": "08:00",
    "available": 8,
    "total": 12
  },
  {
    "slotId": 2,
    "time": "08:30",
    "available": 5,
    "total": 12
  },
  {
    "slotId": 3,
    "time": "09:00",
    "available": 0,
    "total": 12
  }
]
```

## 🧪 Cách Test

### Test trên UI:
1. Mở http://localhost:5174/booking
2. Chọn xe (Step 1) → Next
3. Chọn trung tâm (Step 2) → Next
4. Ở Step 3:
   - Ngày sẽ tự động set là hôm nay
   - Kiểm tra console log để xem API call
   - Quan sát time slots hiển thị từ database
   - Thử thay đổi ngày để xem slots cập nhật

### Test với Console:
```javascript
// Mở DevTools Console (F12) và chạy:

// 1. Kiểm tra API được gọi
// Xem logs: 🔍 Fetching time slots for: {centerId: 1, date: "2025-10-28"}

// 2. Kiểm tra response
// Xem logs: ✅ Time slots response: [...]

// 3. Kiểm tra data transform
// Xem logs: ✅ Time slots loaded: {morning: 8, afternoon: 11, total: 19}
```

### Test Error Handling:
1. **Không chọn trung tâm**: Hiển thị "Vui lòng chọn ngày để xem các khung giờ có sẵn"
2. **API lỗi**: Alert hiển thị error message
3. **Không có slots**: Hiển thị "Không có khung giờ nào khả dụng cho ngày này"
4. **Backend chưa sẵn sàng**: Console log error + alert

## 📊 UI States

### Loading State
```
┌──────────────────────────────────┐
│  Đang tải danh sách thời gian... │
└──────────────────────────────────┘
```

### No Date Selected
```
┌────────────────────────────────────────────────┐
│  Vui lòng chọn ngày để xem các khung giờ có   │
│  sẵn                                           │
└────────────────────────────────────────────────┘
```

### No Slots Available
```
┌────────────────────────────────────────────────┐
│  Không có khung giờ nào khả dụng cho ngày này │
└────────────────────────────────────────────────┘
```

### Success State
```
Sáng
┌──────┬──────┬──────┬──────┐
│ 08:00│ 08:30│ 09:00│ 09:30│
│(0/12)│(8/12)│(0/12)│(5/12)│
└──────┴──────┴──────┴──────┘

Chiều
┌──────┬──────┬──────┬──────┐
│ 12:00│ 12:30│ 13:00│ 13:30│
│(9/12)│(8/12)│(3/12)│(0/12)│
└──────┴──────┴──────┴──────┘
```

## 🎨 Status Colors

- **Green** (available): available > 3
- **Orange** (few): available 1-3
- **Red** (full): available = 0 (disabled)
- **Blue** (selected): Currently selected slot

## 🔍 Console Logs để Debug

```
⏭️ Skipping time slots fetch - missing center or date
🔍 Fetching time slots for: {centerId: 1, date: "2025-10-28"}
✅ Time slots response: [{slotId: 1, time: "08:00", ...}]
✅ Time slots loaded: {morning: 8, afternoon: 11, total: 19}
❌ Error fetching time slots: AxiosError {...}
```

## 📝 Notes

1. **Auto Set Today**: Khi vào Step 3, ngày tự động được set là hôm nay
2. **Auto Clear Selection**: Khi đổi ngày/trung tâm, time slot đã chọn sẽ bị clear
3. **Responsive**: Time slots grid tự động điều chỉnh theo screen size
4. **Disabled State**: Slots full (available=0) không thể click được
5. **Real-time Update**: Mỗi lần đổi ngày hoặc trung tâm, API sẽ được gọi lại

## ⚠️ Lưu ý Backend

Backend cần implement method `getAvailableSlots(centerId, date)` trong `MaintenanceScheduleManagementService`.

Logic đề xuất:
1. Query tất cả schedules cho `centerId` và `date`
2. Tính số lượng schedules cho mỗi time slot
3. Trả về danh sách slots với `available = maxCapacity - bookedCount`
4. Sort theo thời gian tăng dần

Example Service Logic:
```java
public List<TimeSlotDTO> getAvailableSlots(Integer centerId, String date) {
    // 1. Get all time slots for the center
    // 2. Count bookings for each slot on that date
    // 3. Calculate available = total - booked
    // 4. Return list of TimeSlotDTO
}
```
