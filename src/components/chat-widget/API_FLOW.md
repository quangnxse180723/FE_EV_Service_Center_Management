# Chat Widget - API Flow Documentation

## Tổng quan

Chat Widget sử dụng API flow tự động phân công staff từ backend. Khi customer mở popup chat, widget sẽ gọi API để backend tự động assign một staff phụ trách.

## Flow hoạt động

### 1. Khởi tạo Conversation (Khi mở widget lần đầu)

```
Customer mở popup
    ↓
Gọi: POST /api/chat/conversation/start
Headers: Authorization: Bearer {JWT_TOKEN}
    ↓
Backend:
  - Tìm staff available
  - Tạo conversation
  - Assign staff vào conversation
    ↓
Response: {
  conversationId: 123,
  staffId: 456,
  staffName: "Nguyễn Văn A",
  staffAvatar: "https://..."
}
    ↓
Frontend lưu conversationId vào state
    ↓
Load lịch sử tin nhắn từ conversation
```

### 2. Load Lịch sử tin nhắn

```
Có conversationId
    ↓
Gọi: GET /api/chat/conversation/{conversationId}/messages
Headers: Authorization: Bearer {JWT_TOKEN}
    ↓
Response: [
  {
    id: 1,
    senderId: 123,
    senderName: "Customer",
    content: "Xin chào",
    timestamp: "2024-01-01T10:00:00Z"
  },
  ...
]
    ↓
Hiển thị tin nhắn trong UI
```

### 3. Kết nối WebSocket

```
Connect to: ws://localhost:8080/ws
Headers: Authorization: Bearer {JWT_TOKEN}
    ↓
STOMP CONNECT
    ↓
Subscribe: /topic/conversation/{conversationId}
    ↓
Lắng nghe tin nhắn realtime
```

### 4. Gửi tin nhắn

```
Customer nhập tin nhắn và nhấn Gửi
    ↓
Hiển thị tin nhắn ngay (Optimistic Update)
    ↓
Publish qua WebSocket:
  Destination: /app/chat.send
  Payload: {
    conversationId: 123,
    content: "Tin nhắn của tôi",
    timestamp: "2024-01-01T10:05:00Z"
  }
    ↓
Backend xử lý và broadcast
    ↓
Nhận lại tin nhắn qua /topic/conversation/123
    ↓
Cập nhật UI với tin nhắn thật từ backend
```

### 5. Nhận tin nhắn từ Staff

```
Staff gửi tin nhắn
    ↓
Backend broadcast qua WebSocket
    ↓
Frontend nhận qua subscription /topic/conversation/123
    ↓
Hiển thị tin nhắn trong UI
    ↓
Tăng unread count (nếu widget đang đóng)
```

### 6. Xóa tin nhắn

```
Customer click nút xóa
    ↓
Confirm dialog
    ↓
Gọi: DELETE /api/chat/message/{messageId}
Headers: Authorization: Bearer {JWT_TOKEN}
    ↓
Backend xóa tin nhắn
    ↓
Response: 200 OK
    ↓
Xóa tin nhắn khỏi UI
```

## API Endpoints

### 1. POST /api/chat/conversation/start
**Mục đích**: Khởi tạo conversation và tự động phân công staff

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body**: Không cần

**Response**:
```json
{
  "conversationId": 123,
  "staffId": 456,
  "staffName": "Nguyễn Văn A",
  "staffAvatar": "https://example.com/avatar.jpg"
}
```

**Error Responses**:
- 401: Chưa đăng nhập
- 503: Không có staff nào available

---

### 2. GET /api/chat/conversation/{conversationId}/messages
**Mục đích**: Lấy lịch sử tin nhắn của conversation

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response**:
```json
[
  {
    "id": 1,
    "conversationId": 123,
    "senderId": 789,
    "senderName": "Customer Name",
    "content": "Xin chào",
    "timestamp": "2024-01-01T10:00:00Z",
    "isRead": true
  },
  {
    "id": 2,
    "conversationId": 123,
    "senderId": 456,
    "senderName": "Staff Name",
    "content": "Chào bạn, tôi có thể giúp gì?",
    "timestamp": "2024-01-01T10:01:00Z",
    "isRead": true
  }
]
```

---

### 3. WebSocket /ws
**Mục đích**: Realtime messaging

**Connect Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Subscribe**:
```
SUBSCRIBE /topic/conversation/{conversationId}
```

**Publish**:
```
SEND /app/chat.send
Body: {
  "conversationId": 123,
  "content": "Nội dung tin nhắn",
  "timestamp": "2024-01-01T10:05:00Z"
}
```

**Receive Message**:
```json
{
  "id": 3,
  "conversationId": 123,
  "senderId": 789,
  "senderName": "Customer Name",
  "content": "Tin nhắn mới",
  "timestamp": "2024-01-01T10:05:00Z",
  "isRead": false
}
```

---

### 4. PUT /api/chat/conversation/{conversationId}/read
**Mục đích**: Đánh dấu conversation đã đọc

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response**: 200 OK

---

### 5. DELETE /api/chat/message/{messageId}
**Mục đích**: Xóa tin nhắn

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response**: 200 OK

## Frontend Implementation

### State Management

```javascript
const [conversationId, setConversationId] = useState(null);
const [messages, setMessages] = useState([]);
const [connected, setConnected] = useState(false);
const [loadingMessages, setLoadingMessages] = useState(false);
const [sendingMessage, setSendingMessage] = useState(false);
```

### Key Functions

#### startConversation()
- Gọi POST /api/chat/conversation/start
- Lưu conversationId vào state
- Load lịch sử tin nhắn

#### loadMessages(conversationId)
- Gọi GET /api/chat/conversation/{id}/messages
- Cập nhật messages state
- Đánh dấu đã đọc

#### connectWebSocket()
- Kết nối SockJS + STOMP
- Subscribe /topic/conversation/{id}
- Lắng nghe tin nhắn realtime

#### sendMessage()
- Validate conversationId
- Optimistic update (hiển thị tin nhắn ngay)
- Publish qua WebSocket /app/chat.send
- Xử lý lỗi nếu gửi thất bại

#### deleteMessage(messageId)
- Show confirm dialog
- Gọi DELETE API
- Xóa khỏi UI

## Error Handling

### Không có conversationId
```
❌ "Chưa kết nối với hỗ trợ viên. Vui lòng đóng và mở lại."
```

### WebSocket chưa kết nối
```
❌ "Chưa kết nối WebSocket. Vui lòng thử lại."
```

### Backend offline
```
❌ "Không thể kết nối với hỗ trợ. Vui lòng thử lại sau."
```

### Gửi tin nhắn thất bại
```
❌ "Không thể gửi tin nhắn. Vui lòng thử lại."
→ Xóa tin nhắn tạm
→ Khôi phục nội dung input
```

## Debug Logging

Widget có comprehensive logging để troubleshoot:

```
🔵 ===== BẮT ĐẦU KHỞI TẠO CONVERSATION =====
📞 Gọi API: POST /api/chat/conversation/start
🔑 JWT Token: ✅ Có
✅ Backend đã tạo conversation và phân công staff: {...}
💬 Conversation ID: 123
👤 Staff được phân công: Nguyễn Văn A
🔵 ===== KẾT THÚC KHỞI TẠO CONVERSATION =====

🔵 ===== BẮT ĐẦU GỬI TIN NHẮN =====
📝 Nội dung: Xin chào
🔌 WebSocket connected: true
💬 Conversation ID: 123
📤 Đang gửi qua WebSocket: {...}
✅ Đã gửi qua WebSocket thành công!
🔵 ===== KẾT THÚC GỬI TIN NHẮN =====

📩 ===== NHẬN TIN NHẮN MỚI =====
📦 Payload: {...}
```

## Testing Checklist

### Backend cần implement:
- [ ] POST /api/chat/conversation/start - Auto assign staff
- [ ] GET /api/chat/conversation/{id}/messages - Load history
- [ ] WebSocket /ws - Connection với JWT auth
- [ ] STOMP /app/chat.send - Publish endpoint
- [ ] STOMP /topic/conversation/{id} - Broadcast channel
- [ ] PUT /api/chat/conversation/{id}/read - Mark as read
- [ ] DELETE /api/chat/message/{id} - Delete message

### Frontend flow:
1. [ ] Login as CUSTOMER
2. [ ] Mở widget → Thấy icon ở góc phải màn hình
3. [ ] Click icon → Popup mở ra
4. [ ] Console log: "BẮT ĐẦU KHỞI TẠO CONVERSATION"
5. [ ] API call: POST /start → Nhận conversationId
6. [ ] Load lịch sử tin nhắn (nếu có)
7. [ ] WebSocket connect → Subscribe
8. [ ] Nhập tin nhắn → Click Gửi
9. [ ] Tin nhắn hiển thị ngay (optimistic)
10. [ ] Nhận tin nhắn từ staff qua WebSocket
11. [ ] Click nút xóa → Confirm → Xóa khỏi UI
12. [ ] Đóng widget → Mở lại → Giữ nguyên conversation

## Khác biệt so với version cũ

### ❌ Old Flow (Hardcoded)
```javascript
const STAFF_USER_ID = 999; // Hardcoded

sendMessage() {
  receiverId: STAFF_USER_ID, // ← Cố định
}
```

### ✅ New Flow (Dynamic)
```javascript
// Không còn hardcode staff ID

startConversation() {
  // Backend tự động assign staff
  const { conversationId, staffId } = await POST /start
}

sendMessage() {
  conversationId: conversationId, // ← Từ backend
}
```

## Notes

- Widget hoạt động **độc lập**, không cần URL navigation
- Conversation ID được **backend quản lý**
- Staff assignment **tự động**, không cần customer chọn
- **Optimistic updates** cho UX mượt mà
- **Graceful error handling** khi backend offline
- **Comprehensive logging** để debug dễ dàng
