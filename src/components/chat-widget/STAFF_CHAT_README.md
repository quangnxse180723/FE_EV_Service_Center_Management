# Staff Chat Widget

Widget chat nổi dành cho **STAFF** để hỗ trợ khách hàng realtime.

## 🎯 Tính năng

### 1. **Messenger-style UI**
- ✅ Sidebar bên trái: Danh sách khách hàng đã chat
- ✅ Panel bên phải: Tin nhắn với khách hàng được chọn
- ✅ Floating icon ở góc dưới phải (hiện số tin nhắn chưa đọc)

### 2. **Quản lý Conversations**
- ✅ Load danh sách khách hàng từ `/api/chat/conversations`
- ✅ Hiển thị: Avatar, tên, preview tin nhắn cuối, thời gian
- ✅ Unread count cho mỗi conversation
- ✅ Highlight conversation đang chọn

### 3. **Chat Realtime**
- ✅ WebSocket với SockJS + STOMP
- ✅ Subscribe `/topic/conversation/{id}` để nhận tin nhắn
- ✅ Gửi tin nhắn qua `/app/chat.send`
- ✅ Auto scroll đến tin nhắn mới

### 4. **Authentication**
- ✅ JWT trong header WebSocket
- ✅ JWT trong API calls
- ✅ Auto cleanup khi logout

## 📁 Cấu trúc Files

```
src/components/chat-widget/
├── ChatWidget.jsx           # Customer widget
├── ChatWidget.css
├── StaffChatWidget.jsx      # Staff widget ⭐
├── StaffChatWidget.css      # ⭐
├── index.js
└── README.md
```

## 🚀 Sử dụng

### **1. Tích hợp vào App.jsx**

```jsx
import StaffChatWidget from "./components/chat-widget/StaffChatWidget";

function AppContent() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';

  return (
    <>
      <Routes>
        {/* ... routes */}
      </Routes>

      {/* Staff Chat Widget - Chỉ hiện cho STAFF */}
      {isStaff && <StaffChatWidget user={user} />}
    </>
  );
}
```

### **2. User object**

Widget cần `user` object với:

```javascript
{
  id: 1,              // hoặc accountId
  role: 'STAFF',
  email: 'staff@example.com',
  name: 'John Staff'
}
```

### **3. JWT Token**

Token phải được lưu trong `localStorage`:

```javascript
localStorage.setItem('token', 'your-jwt-token');
```

## 🔌 Backend APIs

### **1. GET /api/chat/conversations**

Lấy danh sách conversations của staff.

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Response:**
```json
[
  {
    "conversationId": 1,
    "customerId": 3,
    "customerName": "Customer Name",
    "customerEmail": "customer@example.com",
    "customerAccountId": 17,
    "lastMessage": "Last message content",
    "lastMessageTime": "2025-11-04T10:30:00",
    "unreadCount": 2
  }
]
```

### **2. GET /api/chat/conversation/{id}/messages**

Lấy lịch sử tin nhắn.

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Response:**
```json
[
  {
    "id": 1,
    "conversationId": 1,
    "senderId": 17,
    "receiverId": 15,
    "content": "Hello",
    "timestamp": "2025-11-04T10:30:00"
  }
]
```

### **3. WebSocket /ws**

**Connect:**
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect(
  { Authorization: 'Bearer ' + token },
  onConnect,
  onError
);
```

**Subscribe:**
```javascript
stompClient.subscribe('/topic/conversation/1', (message) => {
  const data = JSON.parse(message.body);
  // Handle new message
});
```

**Send:**
```javascript
stompClient.send('/app/chat.send', {}, JSON.stringify({
  receiverId: 17,  // Customer account ID
  content: 'Hello customer!',
  timestamp: new Date().toISOString()
}));
```

## 🎨 Giao diện

### **Icon - Góc dưới phải**
```
┌─────────────────────────────┐
│                             │
│                             │
│                        [💬]←│ Badge: số unread
└─────────────────────────────┘
```

### **Popup - Messenger style**
```
┌──────────────────────────────────────┐
│  🗨️ Hỗ trợ khách hàng       🟢    ✕  │ Header
├──────────────┬───────────────────────┤
│              │                       │
│ Khách hàng   │  Chat with Customer   │
│ ┌──────────┐ │  ┌─────────────────┐ │
│ │👤 John   │ │  │ Tin nhắn...     │ │
│ │  Hi...   │ │  └─────────────────┘ │
│ └──────────┘ │                       │
│              │  ┌─────────────────┐ │
│ 👤 Mary      │  │ Reply...        │ │
│   Hello...   │  └─────────────────┘ │
│              │                       │
│              │  [Input] [Send 📤]   │
└──────────────┴───────────────────────┘
  Sidebar          Chat Panel
```

## 💡 Workflow

1. **Staff login** → Widget hiện icon ở góc dưới phải
2. **Click icon** → Mở popup
3. **Auto load** danh sách conversations
4. **Auto connect** WebSocket
5. **Click customer** → Load tin nhắn + Subscribe topic
6. **Nhận tin nhắn mới** → Cập nhật UI realtime
7. **Gửi tin nhắn** → Qua WebSocket → Optimistic update UI
8. **Logout** → Cleanup (disconnect WebSocket, clear state)

## 🔧 Customization

### **Thay đổi màu sắc**

Sửa trong `StaffChatWidget.css`:

```css
.staff-chat-icon {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### **Thay đổi kích thước popup**

```css
.staff-chat-popup {
  width: 900px;  /* Chiều rộng */
  height: 600px; /* Chiều cao */
}
```

### **Thay đổi vị trí icon**

```css
.staff-chat-icon {
  bottom: 20px;  /* Khoảng cách từ đáy */
  right: 20px;   /* Khoảng cách từ phải */
}
```

## 🐛 Debugging

### **Console Logs**

Widget có comprehensive logging:

```javascript
🔵 ===== BẮT ĐẦU KẾT NỐI WEBSOCKET =====
🔑 Token: ✅ Có
✅ ===== WEBSOCKET KẾT NỐI THÀNH CÔNG! =====
📋 ===== BẮT ĐẦU LOAD CONVERSATIONS =====
✅ Loaded conversations: 5
📩 ===== NHẬN TIN NHẮN MỚI =====
```

### **Check WebSocket**

F12 → Network → WS → Kiểm tra:
- ✅ Status 101 (Switching Protocols)
- ✅ CONNECT frame
- ✅ SUBSCRIBE frame
- ✅ MESSAGE frame

### **Common Issues**

**1. "Chưa đăng nhập"**
- ✅ Kiểm tra `localStorage.getItem('token')`
- ✅ Token phải valid và chưa expired

**2. "Lỗi kết nối WebSocket"**
- ✅ Backend WebSocket endpoint phải chạy
- ✅ CORS phải cho phép credentials

**3. "Không thể tải danh sách khách hàng"**
- ✅ API `/api/chat/conversations` phải return đúng format
- ✅ Check network tab: status 200?

## 📦 Dependencies

```json
{
  "@stomp/stompjs": "^7.0.0",
  "sockjs-client": "^1.6.1",
  "react": "^18.0.0"
}
```

## ✅ Testing Checklist

- [ ] Icon hiện ở góc dưới phải khi login STAFF
- [ ] Click icon → Popup mở
- [ ] Sidebar load danh sách khách hàng
- [ ] Click khách hàng → Load tin nhắn
- [ ] Gửi tin nhắn → Hiện trong UI ngay
- [ ] Nhận tin nhắn realtime từ customer
- [ ] Unread count cập nhật đúng
- [ ] Logout → Widget biến mất, WebSocket disconnect

## 🎯 Next Steps

- [ ] Add typing indicator
- [ ] Add file upload
- [ ] Add emoji picker
- [ ] Add message reactions
- [ ] Add search conversations
- [ ] Add mark as unread
- [ ] Add conversation archive
- [ ] Add staff notes

---

**Built with ❤️ for EV Service Center Management**
