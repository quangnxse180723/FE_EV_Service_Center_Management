# Quick Start - Chat Widget

## 🚀 Cách Test Chat Widget

### Bước 1: Login với tài khoản CUSTOMER

1. Mở browser: http://localhost:5175/login
2. Login với role **CUSTOMER** (không phải STAFF/ADMIN)

### Bước 2: Kiểm tra Widget

Sau khi login thành công, bạn sẽ thấy:

✅ **Icon chat tím** ở góc dưới phải màn hình (![Chat Icon](docs/icon.png))

### Bước 3: Mở Chat

1. Click vào icon tím
2. Popup chat sẽ xuất hiện với:
   - Header "Customer Support"
   - Area hiển thị tin nhắn
   - Input để nhập tin nhắn

### Bước 4: Gửi tin nhắn

1. Nhập tin nhắn vào ô input
2. Nhấn **Enter** hoặc click nút **Send** (✈️)
3. Tin nhắn của bạn sẽ hiện bên phải (màu tím)

### Bước 5: Nhận tin nhắn realtime

Nếu backend đang chạy và staff gửi tin nhắn:
- Tin nhắn sẽ tự động hiện bên trái (màu trắng)
- Không cần refresh trang

---

## 🧪 Test Scenarios

### Test 1: Widget hiển thị
**Expected**: Icon tím hiển thị ở góc dưới phải

### Test 2: Open/Close popup
**Expected**: Click icon → popup mở, click X → popup đóng

### Test 3: WebSocket connection
**Expected**: 
- Dot xanh bên cạnh "Customer Support" = Connected
- Console log: "✅ WebSocket connected"

### Test 4: Send message
**Expected**:
- Tin nhắn hiện ngay bên phải
- Input được clear
- Console log: "✅ Message sent"

### Test 5: Unread badge
**Expected**:
- Khi có tin nhắn mới và popup đang đóng
- Badge đỏ hiện trên icon với số lượng

---

## 🐛 Troubleshooting

### Widget không hiển thị
**Nguyên nhân**: Chưa login hoặc role không phải CUSTOMER

**Fix**: Login lại với tài khoản CUSTOMER

### WebSocket không kết nối
**Console log**: "❌ WebSocket connection error"

**Fix**:
1. Kiểm tra backend có chạy không (http://localhost:8080)
2. Kiểm tra token JWT còn hợp lệ
3. Kiểm tra CORS settings ở backend

### Không gửi được tin nhắn
**Error**: "Chưa kết nối WebSocket"

**Fix**:
1. Đợi WebSocket kết nối (dot xanh)
2. Kiểm tra network tab xem có lỗi 401/403 không
3. Refresh trang và thử lại

### Backend chưa sẵn sàng
**Status**: API endpoints chưa implement

**Workaround**: 
- Widget vẫn hiển thị
- Error message: "Không thể tải tin nhắn"
- Chờ backend team implement API

---

## 📸 Screenshots

### Closed State
```
┌──────────┐
│          │
│   Page   │
│  Content │
│          │
└──────────┘
         [💬]  ← Icon ở góc
```

### Open State
```
┌──────────┐
│          │
│   Page   │
│  Content │
│      ┌───────────┐
│      │ Customer  │
│      │ Support   │
│      ├───────────┤
│      │ Messages  │
│      │           │
│      ├───────────┤
│      │ Input     │
│      └───────────┘
│      [💬]
└──────────┘
```

---

## 💡 Tips

1. **Keep widget open while testing**: Để dễ xem tin nhắn realtime

2. **Check console logs**: 
   - "✅ WebSocket connected" = Good
   - "📩 Received message" = Message arrived
   - "❌" = Error occurred

3. **Use DevTools Network tab**: Xem WebSocket connection (WS tab)

4. **Test on mobile**: Resize browser < 480px để xem responsive

---

## 📞 Support

Nếu gặp vấn đề:

1. Check console logs (F12)
2. Check backend logs
3. Xem file `README.md` để biết thêm chi tiết
4. Contact developer team

---

**Happy Testing! 🎉**
