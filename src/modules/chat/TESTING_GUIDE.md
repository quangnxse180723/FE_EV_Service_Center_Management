# Chat Module - Testing Guide

## 🧪 Hướng dẫn Test Chat Feature

### Chuẩn bị

#### 1. Cài đặt dependencies
```bash
npm install sockjs-client @stomp/stompjs date-fns
```

#### 2. Đảm bảo Backend đang chạy
- Backend server: `http://localhost:8080`
- WebSocket endpoint: `ws://localhost:8080/ws`

#### 3. Đảm bảo có dữ liệu test
- Ít nhất 1 user CUSTOMER
- Ít nhất 1 user STAFF
- Token JWT hợp lệ

---

## 📋 Test Cases

### Test 1: WebSocket Connection

**Mục đích**: Kiểm tra WebSocket kết nối thành công

**Steps**:
1. Login với role CUSTOMER hoặc STAFF
2. Navigate đến `/customer/chat` hoặc `/staff/chat`
3. Mở Browser DevTools > Console
4. Kiểm tra logs

**Expected**:
```
✅ WebSocket connected successfully
📡 Subscribing to conversation: 1
```

**Failure cases**:
- ❌ Không có log "WebSocket connected" → Backend chưa chạy hoặc endpoint sai
- ⚠️ Log "WebSocket connection error" → JWT invalid hoặc backend từ chối

---

### Test 2: Load Conversations

**Mục đích**: Kiểm tra load danh sách conversations

**Steps**:
1. Login với role STAFF (có nhiều conversations)
2. Navigate đến `/staff/chat`
3. Kiểm tra sidebar bên trái

**Expected**:
- Hiển thị danh sách conversations
- Mỗi conversation có:
  - Avatar (hoặc placeholder với chữ cái đầu)
  - Tên người chat
  - Tin nhắn cuối cùng
  - Thời gian (vd: "5 phút trước")
  - Unread badge nếu có tin nhắn chưa đọc

**Failure cases**:
- Spinner quay mãi → API `/api/chat/conversations` lỗi
- "Chưa có cuộc trò chuyện nào" → Chưa có data trong DB

---

### Test 3: Load Messages

**Mục đích**: Kiểm tra load lịch sử tin nhắn

**Steps**:
1. Click vào 1 conversation trong sidebar
2. Kiểm tra main chat area

**Expected**:
- Hiển thị danh sách messages
- Messages được phân biệt:
  - Tin nhắn gửi: Bên phải, màu gradient purple
  - Tin nhắn nhận: Bên trái, màu trắng
- Date divider (vd: "Hôm nay", "Hôm qua")
- Auto scroll to bottom

**Failure cases**:
- Spinner quay mãi → API `/api/chat/conversation/{id}/messages` lỗi
- Tin nhắn không đúng thứ tự → Backend sort sai

---

### Test 4: Send Message via WebSocket

**Mục đích**: Kiểm tra gửi tin nhắn realtime

**Steps**:
1. Mở 2 browser windows:
   - Window 1: Login CUSTOMER → `/customer/chat`
   - Window 2: Login STAFF → `/staff/chat` → Chọn conversation với customer trên
2. Ở Window 1, gửi tin nhắn: "Hello from customer"
3. Kiểm tra Window 2

**Expected**:
- Window 1: Tin nhắn hiện ngay ở bên phải (sent)
- Window 2: Tin nhắn hiện ngay ở bên trái (received)
- Không cần refresh trang

**Failure cases**:
- Tin nhắn không hiện ở Window 2 → WebSocket subscription không hoạt động
- Tin nhắn bị duplicate → Logic addMessage bị gọi 2 lần

---

### Test 5: Send Message via HTTP (Fallback)

**Mục đích**: Kiểm tra fallback khi WebSocket offline

**Steps**:
1. Mở DevTools > Console
2. Chạy: `websocketService.disconnect()`
3. Gửi tin nhắn

**Expected**:
- Console log: `⚠️ WebSocket not connected, fallback to HTTP`
- Tin nhắn vẫn gửi thành công qua API
- Message hiển thị trong chat

**Failure cases**:
- Error "Cannot send message" → API `/api/chat/send` lỗi

---

### Test 6: Emoji Picker

**Mục đích**: Kiểm tra thêm emoji vào tin nhắn

**Steps**:
1. Click vào icon mặt cười (😊) ở input
2. Click vào emoji bất kỳ
3. Gửi tin nhắn

**Expected**:
- Emoji picker hiện lên
- Click emoji → emoji được thêm vào input
- Emoji hiển thị đúng trong tin nhắn

---

### Test 7: Mobile Responsive

**Mục đích**: Kiểm tra giao diện mobile

**Steps**:
1. Mở DevTools > Toggle device toolbar
2. Chọn iPhone/Android view
3. Kiểm tra UI

**Expected**:
- Sidebar ẩn mặc định
- Button toggle (☰) hiện ở góc trên trái
- Click toggle → Sidebar slide vào
- Chọn conversation → Sidebar tự đóng

---

### Test 8: Auto-Reconnect

**Mục đích**: Kiểm tra tự động kết nối lại khi mất kết nối

**Steps**:
1. Kết nối WebSocket thành công
2. Stop backend server
3. Đợi 5-10 giây
4. Start lại backend server
5. Kiểm tra console

**Expected**:
- Log "WebSocket disconnected"
- Log "Attempting to reconnect in 5000ms..."
- Sau 5s: Log "WebSocket connected successfully"

---

### Test 9: JWT Expiration

**Mục đích**: Kiểm tra xử lý khi token hết hạn

**Steps**:
1. Mock token expire bằng cách sửa token trong localStorage
2. Refresh trang
3. Gửi tin nhắn

**Expected**:
- Error banner hiện: "Phiên đăng nhập đã hết hạn"
- Sau 2s auto redirect về `/login`

---

### Test 10: Unread Badge

**Mục đích**: Kiểm tra unread count

**Steps**:
1. Mở 2 windows: Customer + Staff
2. Staff gửi tin nhắn cho Customer
3. Kiểm tra sidebar Customer

**Expected**:
- Conversation có unread badge (số đỏ)
- Click vào conversation → Badge mất
- API `/api/chat/conversation/{id}/read` được gọi

---

## 🔍 Debug Checklist

### WebSocket không kết nối

```javascript
// 1. Kiểm tra backend URL
console.log('WebSocket URL:', 'http://localhost:8080/ws');

// 2. Kiểm tra JWT token
console.log('Token:', localStorage.getItem('token'));

// 3. Kiểm tra CORS
// Backend cần allow origin: http://localhost:5173

// 4. Kiểm tra network tab
// WS connection status: 101 Switching Protocols
```

### Tin nhắn không realtime

```javascript
// 1. Kiểm tra subscription
console.log('Subscribed to:', `/topic/conversation/${conversationId}`);

// 2. Kiểm tra publish endpoint
console.log('Publishing to:', '/app/chat.send');

// 3. Kiểm tra backend broadcast
// Backend phải broadcast đến đúng topic
```

### Tin nhắn bị duplicate

```javascript
// Nguyên nhân: addMessage được gọi 2 lần
// - 1 lần từ optimistic update (khi gửi)
// - 1 lần từ WebSocket (khi nhận broadcast)

// Fix: Check exists before add
const exists = prevMessages.some(msg => msg.id === newMessage.id);
if (exists) return prevMessages;
```

---

## 🛠️ Mock Data Testing

Nếu backend chưa sẵn sàng, tạo mock data:

```javascript
// src/modules/chat/services/chatApi.js

export const chatApi = {
  getConversations: () => Promise.resolve({
    data: [
      {
        id: 1,
        participantId: 2,
        participantName: "Nguyễn Văn A",
        lastMessage: "Xin chào",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 2,
        isOnline: true
      }
    ]
  }),
  
  getMessages: (id) => Promise.resolve({
    data: [
      {
        id: 1,
        senderId: 1,
        receiverId: 2,
        content: "Hello",
        timestamp: new Date().toISOString(),
        status: "read",
        conversationId: id
      }
    ]
  }),
  
  // ... other methods
};
```

---

## 📊 Performance Testing

### Metrics to check:

1. **WebSocket connection time**: < 500ms
2. **Load conversations**: < 1s
3. **Load messages**: < 1s
4. **Send message latency**: < 200ms
5. **Message received latency**: < 500ms

### Tools:

```javascript
// Measure connection time
console.time('WebSocket Connect');
websocketService.connect(token, () => {
  console.timeEnd('WebSocket Connect');
});

// Measure API time
console.time('Load Conversations');
await chatApi.getConversations();
console.timeEnd('Load Conversations');
```

---

## ✅ Test Completion Checklist

- [ ] WebSocket connection thành công
- [ ] Load conversations hiển thị đúng
- [ ] Load messages hiển thị đúng
- [ ] Send message realtime hoạt động
- [ ] Fallback HTTP hoạt động khi WS offline
- [ ] Emoji picker hoạt động
- [ ] Mobile responsive đúng
- [ ] Auto-reconnect hoạt động
- [ ] JWT expiration redirect về login
- [ ] Unread badge update đúng
- [ ] Date divider hiển thị đúng
- [ ] Auto scroll to bottom hoạt động
- [ ] Online status hiển thị
- [ ] Tin nhắn không bị duplicate

---

**Happy Testing! 🎉**
