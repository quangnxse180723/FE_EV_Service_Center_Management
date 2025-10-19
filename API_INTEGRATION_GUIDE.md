# Hướng Dẫn Tích Hợp API Backend với Frontend

## 📋 Tổng Quan

Dự án đã được tích hợp với Backend API để quản lý đặt lịch bảo dưỡng xe điện.

## 🔧 Cấu Hình

### 1. Cập nhật Base URL

Mở file `src/api/axiosClient.js` và thay đổi `baseURL` theo địa chỉ Backend của bạn:

```javascript
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay đổi URL này
  // ...
});
```

### 2. Xác Thực (Authentication)

Token được lưu trong `localStorage` và tự động thêm vào header của mọi request:

```javascript
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

## 📡 API Endpoints

### Schedule API (`src/api/scheduleApi.js`)

#### 1. Đặt Lịch Mới
```javascript
POST /api/customer/schedules/book
```

**Request Body:**
```json
{
  "customerId": 1,
  "vehicleId": 1,
  "centerId": 1,
  "serviceIds": [1, 2],
  "scheduledDate": "2025-10-20",
  "scheduledTime": "08:00",
  "notes": "Ghi chú của khách hàng"
}
```

**Sử dụng trong Component:**
```javascript
import scheduleApi from '../../../api/scheduleApi';

const handleSubmit = async () => {
  try {
    const bookingData = {
      customerId: 1,
      vehicleId: selectedVehicle?.id,
      centerId: selectedCenter?.id,
      serviceIds: [selectedService?.id],
      scheduledDate: bookingDate,
      scheduledTime: selectedTimeSlot,
      notes: customerNote,
    };
    
    const response = await scheduleApi.bookSchedule(bookingData);
    console.log('Success:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 2. Lấy Lịch Sử Đặt Lịch
```javascript
GET /api/customer/schedules/{customerId}
```

**Sử dụng trong Component:**
```javascript
import { useEffect, useState } from 'react';
import scheduleApi from '../../../api/scheduleApi';

const [bookingHistory, setBookingHistory] = useState([]);

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const response = await scheduleApi.getByCustomer(customerId);
      setBookingHistory(response);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  fetchHistory();
}, [customerId]);
```

## 🎯 Pages Đã Tích Hợp

### 1. BookingPage.jsx
- ✅ Gọi API `POST /api/customer/schedules/book` để đặt lịch
- ✅ Xử lý loading và error states
- ✅ Chuyển hướng sau khi đặt lịch thành công

### 2. BookingHistoryPage.jsx
- ✅ Gọi API `GET /api/customer/schedules/{customerId}` để lấy lịch sử
- ✅ Hiển thị loading state khi đang tải dữ liệu
- ✅ Hiển thị error state khi có lỗi
- ✅ Hiển thị empty state khi chưa có dữ liệu
- ✅ Retry functionality

## 🔄 Data Transformation

Backend response cần được transform sang format phù hợp với Frontend:

```javascript
const transformedData = response.map(item => ({
  id: item.id || item.scheduleId,
  vehicle: item.vehicleName || 'N/A',
  licensePlate: item.vehiclePlate || 'N/A',
  service: item.serviceName || item.services?.join('\n') || 'N/A',
  center: item.centerName || 'N/A',
  date: item.scheduledDate || 'N/A',
  time: item.scheduledTime || 'N/A',
  status: item.status || 'Chờ xử lý'
}));
```

## 🛡️ Error Handling

Axios interceptor tự động xử lý các lỗi:

- **401 Unauthorized**: Tự động xóa token và redirect đến login
- **Network Error**: Hiển thị thông báo "Không thể kết nối đến server"
- **Other Errors**: Trả về error message từ backend

## 📝 Cấu Trúc Dữ Liệu Backend (Tham Khảo)

### BookingRequest (Backend)
```java
class BookingRequest {
  Integer customerId;
  Integer vehicleId;
  Integer centerId;
  List<Integer> serviceIds;
  String scheduledDate;
  String scheduledTime;
  String notes;
}
```

### ScheduleResponse (Backend)
```java
class ScheduleResponse {
  Integer id;
  String vehicleName;
  String vehiclePlate;
  String serviceName;
  String centerName;
  String scheduledDate;
  String scheduledTime;
  String status;
}
```

## 🚀 Khởi Chạy

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Khởi Động Backend
Đảm bảo Backend đang chạy trên `http://localhost:8080`

### 3. Khởi Động Frontend
```bash
npm run dev
```

## 🧪 Testing API

### Sử dụng Console Log
Mở Browser DevTools (F12) để xem log:
- Request data được gửi
- Response data nhận được
- Error messages (nếu có)

### Test Flow
1. Truy cập `/booking`
2. Chọn xe, trung tâm, thời gian
3. Đặt lịch và kiểm tra console
4. Truy cập `/booking-history` để xem lịch sử

## 📌 Lưu Ý Quan Trọng

1. **CORS**: Đảm bảo Backend đã cấu hình CORS cho phép Frontend gọi API
2. **Authentication**: Hiện tại đang dùng mock customerId, cần tích hợp với AuthContext thực
3. **Environment Variables**: Nên dùng `.env` để quản lý API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
4. **Data Validation**: Frontend cần validate dữ liệu trước khi gửi lên Backend

## 🔐 Security

- Token được lưu trong localStorage (có thể cải thiện bằng httpOnly cookies)
- Tất cả requests đều tự động thêm Authorization header
- Timeout được set 10 seconds để tránh hang

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend có đang chạy không?
2. CORS đã được cấu hình chưa?
3. API endpoints có đúng không?
4. Token có hợp lệ không?
5. Network tab trong DevTools để xem request/response
