# 🔧 Cập nhật CORS cho Port 5173

## ⚠️ Vấn đề
Backend Controller hiện tại chỉ cho phép CORS từ `http://localhost:5173`:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

Nhưng đôi khi Vite chạy trên port khác (5174, 5175...) nên cần update.

## ✅ Giải pháp

### Option 1: Cho phép nhiều ports (Recommended)
```java
@RestController
@RequestMapping("/api/customer/schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class CustomerScheduleController {
    // ... code
}
```

### Option 2: Cho phép tất cả origins (Chỉ dùng cho Development)
```java
@CrossOrigin(origins = "*")
```

### Option 3: Global CORS Config (Best Practice)
Tạo file `WebConfig.java`:

```java
package swp.group4.be_ev_service_center_management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://localhost:5175"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 🧪 Test sau khi update

1. Restart backend
2. Mở http://localhost:5173/booking
3. Mở Console (F12)
4. Copy và paste nội dung file `quick-test-timeslots.js`
5. Xem kết quả

## 📝 Current Status

✅ Frontend đã sẵn sàng:
- scheduleApi.getAvailableTimeSlots() đã được implement
- BookingPage.jsx tự động fetch khi vào Step 3
- UI hiển thị time slots từ API

⏳ Backend cần kiểm tra:
- [ ] CORS config cho port 5173
- [ ] Endpoint GET /api/customer/schedules/available-slots
- [ ] Method getAvailableSlots(centerId, date) trong Service
- [ ] Response format đúng: Array<{slotId, time, available, total}>

## 🔍 Debug Commands

### Kiểm tra backend có chạy không:
```bash
curl http://localhost:8080/api/customer/schedules/available-slots?centerId=1&date=2025-10-28
```

### Kiểm tra CORS:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/customer/schedules/available-slots
```

Nếu response có header `Access-Control-Allow-Origin: http://localhost:5173` → CORS OK ✅
