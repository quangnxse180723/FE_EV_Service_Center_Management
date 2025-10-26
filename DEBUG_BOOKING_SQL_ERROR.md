# 🐛 DEBUG - SQL Error khi Book Schedule

## ❌ Lỗi hiện tại

```sql
could not execute statement [Column 'slot_id' cannot be null] [insert 
into maintenance_schedule 
(booking_date,created_at,customer_id,package_id,notes,scheduled_date,center_id,
status,technician_id,dot_id,vehicle_id) 
values (?,?,?,?,?,?,?,?,?,?,?)] 
[n.b. Sql: insert into maintenance_schedule 
(booking_date,re, package_id notes,scheduled_date...) 
id,dot_id,vehicle_id,status,technician_id,slot_id values (?,?,?,?,?,?,?); 
constraint [null]
```

## 🔍 Phân tích lỗi

Database table `maintenance_schedule` có các cột:
- `slot_id` - **NOT NULL** (bắt buộc)
- `booking_date`
- `created_at`
- `customer_id`
- `package_id`
- `notes`
- `scheduled_date`
- `center_id`
- `status`
- `technician_id`
- `dot_id`
- `vehicle_id`

**Vấn đề:** Backend đang cố insert mà không có `slot_id` → NULL constraint violation

## 🔧 Giải pháp

### Option 1: Gửi slotId (Nếu backend hỗ trợ)

Frontend đã thử gửi `slotId` nhưng backend không nhận được. Có thể do:
1. Backend BookScheduleRequest không có field `slotId`
2. Field mapping không đúng (camelCase vs snake_case)

**Frontend cần gửi:**
```javascript
const bookingData = {
  customerId: parseInt(customerId),
  vehicleId: parseInt(vehicleId),
  centerId: parseInt(centerId),
  slotId: parseInt(slotId), // ← Cần field này
  scheduledDate: "2025-10-28", // Date only
  scheduledTime: "09:00", // Time only  
  notes: customerNote || ''
};
```

### Option 2: Backend cần fix

**Backend BookScheduleRequest.java cần có:**
```java
public class BookScheduleRequest {
    private Integer customerId;
    private Integer vehicleId;
    private Integer centerId;
    private Integer slotId; // ← Field này bắt buộc!
    private String scheduledDate; // "2025-10-28"
    private String scheduledTime; // "09:00"
    private String notes;
    // getters/setters...
}
```

**Backend Service cần:**
```java
public MaintenanceScheduleResponse bookSchedule(BookScheduleRequest request, Integer customerId) {
    MaintenanceSchedule schedule = new MaintenanceSchedule();
    
    // Map fields
    schedule.setCustomerId(customerId);
    schedule.setVehicleId(request.getVehicleId());
    schedule.setCenterId(request.getCenterId());
    schedule.setSlotId(request.getSlotId()); // ← Cần map field này!
    schedule.setScheduledDate(LocalDate.parse(request.getScheduledDate()));
    schedule.setBookingDate(LocalDate.now());
    schedule.setNotes(request.getNotes());
    schedule.setStatus("PENDING");
    
    // Save...
    return scheduleRepository.save(schedule);
}
```

### Option 3: Database schema cần sửa

Nếu `slot_id` không bắt buộc, thay đổi database:

```sql
ALTER TABLE maintenance_schedule 
MODIFY COLUMN slot_id INT NULL;
```

## 🧪 Test để verify

Thử gửi request với đầy đủ fields:

```javascript
const testBooking = {
  customerId: 1,
  vehicleId: 1,
  centerId: 1,
  slotId: 2, // ID của time slot (từ bảng time_slots hoặc hardcode)
  scheduledDate: "2025-10-28",
  scheduledTime: "09:00",
  notes: "Test booking"
};

// Test API
fetch('http://localhost:8080/api/customer/schedules/book', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(testBooking)
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

## 📋 Checklist để fix

Backend cần:
- [ ] BookScheduleRequest có field `slotId` (Integer)
- [ ] Service method map `slotId` vào entity
- [ ] Hoặc: Database cho phép `slot_id` NULL
- [ ] Hoặc: Backend tự generate slotId từ scheduledDate + scheduledTime

Frontend đã:
- [x] Gửi `slotId` trong request body
- [x] Format date/time đúng
- [x] Gửi customerId

## 💡 Temporary Workaround

Nếu backend chưa fix được ngay, có thể:

1. **Hardcode slotId tạm:**
```javascript
slotId: 1, // Hardcode tạm để test
```

2. **Hoặc tính slotId từ time:**
```javascript
// Map time to slotId (assuming slots start from 1 at 08:00)
const timeToSlotId = {
  "08:00": 1, "08:30": 2, "09:00": 3, "09:30": 4,
  "10:00": 5, "10:30": 6, "11:00": 7, "11:30": 8,
  "12:00": 9, "12:30": 10, "13:00": 11, // ...
};
slotId: timeToSlotId[timeFormatted] || 1,
```

## ⚠️ Lưu ý

Lỗi này là **BACKEND ISSUE**, không phải frontend! 
Frontend đã gửi đúng data, backend cần:
1. Nhận slotId từ request
2. Map vào database entity
3. Insert vào database
