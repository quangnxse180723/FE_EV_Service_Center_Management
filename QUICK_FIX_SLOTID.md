# 🔥 GIẢI PHÁP NHANH - Hardcode slotId để test

## Vấn đề
Backend insert slot_id = NULL mặc dù frontend đã gửi slotId.

## Nguyên nhân có thể
1. Backend BookScheduleRequest không có field `slotId`
2. Backend không có getter/setter cho field này
3. Field name không khớp (slotId vs slot_id)

## Giải pháp tạm thời (Test)

### Option 1: Hardcode slotId trong Frontend

Trong `BookingPage.jsx`, thay đổi:

```javascript
const bookingData = {
  customerId: parseInt(customerId),
  vehicleId: parseInt(vehicleId),
  centerId: parseInt(centerId),
  slotId: 1, // HARDCODE để test
  scheduledDate: dateToUse,
  scheduledTime: timeFormatted,
  serviceId: selectedService?.serviceId || null,
  notes: customerNote || ''
};
```

**Nếu hardcode = 1 mà vẫn lỗi** → Backend KHÔNG có field `slotId`

### Option 2: Sửa Backend BookScheduleRequest

```java
package swp.group4.be_ev_service_center_management.dto.request;

import lombok.Data;

@Data
public class BookScheduleRequest {
    private Integer customerId;
    private Integer vehicleId;
    private Integer centerId;
    private Integer slotId;        // ← PHẢI CÓ field này
    private String scheduledDate;
    private String scheduledTime;
    private Integer serviceId;
    private String notes;
    
    // Lombok @Data sẽ tự generate getter/setter
}
```

### Option 3: Sửa Service Implementation

Trong `MaintenanceScheduleManagementServiceImpl.java`:

```java
@Override
public MaintenanceScheduleResponse bookSchedule(BookScheduleRequest request, Integer customerId) {
    MaintenanceSchedule schedule = new MaintenanceSchedule();
    
    schedule.setCustomerId(customerId);
    schedule.setVehicleId(request.getVehicleId());
    schedule.setCenterId(request.getCenterId());
    schedule.setSlotId(request.getSlotId()); // ← PHẢI CÓ dòng này
    schedule.setScheduledDate(LocalDate.parse(request.getScheduledDate()));
    schedule.setScheduledTime(LocalTime.parse(request.getScheduledTime()));
    schedule.setBookingDate(LocalDate.now());
    schedule.setNotes(request.getNotes());
    schedule.setStatus("PENDING");
    
    // Save...
    return maintenanceScheduleRepository.save(schedule);
}
```

## Test Steps

1. **Test với hardcode:**
   - Set `slotId: 1` trong frontend
   - Nếu thành công → Backend CÓ nhận được
   - Nếu vẫn lỗi → Backend KHÔNG có field

2. **Kiểm tra Backend logs:**
   ```
   System.out.println("Request slotId: " + request.getSlotId());
   ```
   
3. **Kiểm tra database:**
   ```sql
   SELECT slot_id FROM maintenance_schedule 
   ORDER BY created_at DESC LIMIT 1;
   ```

## Backend Checklist

- [ ] BookScheduleRequest có field `private Integer slotId;`
- [ ] Có getter: `public Integer getSlotId() { return slotId; }`
- [ ] Có setter: `public void setSlotId(Integer slotId) { this.slotId = slotId; }`
- [ ] Service method có: `schedule.setSlotId(request.getSlotId());`
- [ ] Entity class có field `slot_id` với annotation `@Column(name = "slot_id")`
