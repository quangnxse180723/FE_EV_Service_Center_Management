# Chat Widget - Floating Customer Support

## 📌 Tổng quan

**Chat Widget** là một component nổi (floating) hiển thị ở góc dưới phải màn hình, cho phép customer chat trực tiếp với staff/support team.

## ✨ Tính năng

### 🎯 Core Features
- ✅ **Floating Icon**: Icon chat cố định ở góc dưới phải, luôn hiển thị
- ✅ **Unread Badge**: Hiển thị số tin nhắn chưa đọc trên icon
- ✅ **Click to Open**: Click icon → mở popup chat
- ✅ **WebSocket Realtime**: Tin nhắn realtime qua WebSocket
- ✅ **Auto-scroll**: Tự động scroll xuống cuối khi có tin nhắn mới
- ✅ **Independent**: Hoạt động độc lập, không ảnh hưởng trang khác

### 🔧 Technical Features
- ✅ JWT Authentication qua WebSocket header
- ✅ Auto-reconnect khi mất kết nối
- ✅ Optimistic updates (hiển thị ngay khi gửi)
- ✅ Error handling với error banner
- ✅ Loading states cho mọi action
- ✅ Connection status indicator

## 🏗️ Cấu trúc

```
src/components/chat-widget/
├── ChatWidget.jsx       # Main component
└── ChatWidget.css       # Styling
```

## 📱 UI Components

### 1. Floating Icon
- **Vị trí**: Fixed bottom-right (20px từ bottom và right)
- **Size**: 60x60px, circular
- **Style**: Purple gradient với shadow
- **Badge**: Số tin nhắn chưa đọc (nếu có)

### 2. Chat Popup
- **Kích thước**: 380x550px
- **Vị trí**: Above icon (80px từ bottom)
- **Animation**: Slide up khi mở

#### Popup Structure:
```
┌─────────────────────────────┐
│ Header (Customer Support)    │ ← Gradient purple
├─────────────────────────────┤
│ Error Banner (if any)        │ ← Red background
├─────────────────────────────┤
│                              │
│  Messages Area               │ ← Scrollable
│  (Load history + realtime)   │
│                              │
├─────────────────────────────┤
│ Input + Send Button          │ ← Fixed bottom
└─────────────────────────────┘
```

## 🔌 API Integration

### HTTP Endpoints

```javascript
// 1. Load conversations
GET /api/chat/conversations
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, participantId, participantName, ... }]

// 2. Load messages
GET /api/chat/conversation/{conversationId}/messages
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, senderId, receiverId, content, timestamp, ... }]

// 3. Mark as read
PUT /api/chat/conversation/{conversationId}/read
Headers: { Authorization: "Bearer {token}" }

// 4. Create conversation (if not exists)
POST /api/chat/conversation
Headers: { Authorization: "Bearer {token}" }
Body: { userId: STAFF_USER_ID }
```

### WebSocket

```javascript
// Endpoint
URL: ws://localhost:8080/ws

// Connect with JWT
connectHeaders: {
  Authorization: "Bearer {token}"
}

// Subscribe to conversation
Topic: /topic/conversation/{conversationId}

// Send message
Destination: /app/chat.send
Body: {
  receiverId: STAFF_USER_ID,
  content: "Hello",
  timestamp: "2024-11-04T10:30:00"
}
```

## 🚀 Usage

### Integration in App.jsx

```javascript
import ChatWidget from "./components/chat-widget/ChatWidget";
import { useAuth } from "./hooks/useAuth";

function AppContent() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <>
      <Routes>
        {/* ... all routes ... */}
      </Routes>

      {/* Widget chỉ hiển thị cho CUSTOMER */}
      {isCustomer && <ChatWidget user={user} />}
    </>
  );
}
```

### Props

```javascript
<ChatWidget 
  user={user}  // Required: User object với { id, name, role }
/>
```

## 📊 State Management

### Component State

```javascript
// UI State
const [isOpen, setIsOpen] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

// Chat State
const [messages, setMessages] = useState([]);
const [inputMessage, setInputMessage] = useState('');
const [conversationId, setConversationId] = useState(null);

// Connection State
const [connected, setConnected] = useState(false);
const [connecting, setConnecting] = useState(false);

// Loading State
const [loadingMessages, setLoadingMessages] = useState(false);
const [sendingMessage, setSendingMessage] = useState(false);

// Error State
const [error, setError] = useState(null);
```

### Lifecycle

```javascript
1. Component Mount
   → Không làm gì (widget đóng)

2. User Click Icon
   → setIsOpen(true)
   → loadMessages() - Load từ API
   → connectWebSocket() - Kết nối WS
   → setUnreadCount(0) - Reset badge

3. WebSocket Connected
   → subscribeToConversation() - Listen realtime

4. User Send Message
   → sendMessage() via WebSocket
   → Optimistic update: Thêm vào UI ngay
   → Backend broadcast → Nhận lại qua subscription

5. User Close Popup
   → setIsOpen(false)
   → disconnectWebSocket()
   → Clean up subscriptions

6. Component Unmount
   → disconnectWebSocket()
   → Cleanup all resources
```

## 🎨 Styling

### CSS Variables (Customizable)

```css
/* Colors */
--widget-primary: #667eea;
--widget-secondary: #764ba2;
--widget-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Sizes */
--widget-icon-size: 60px;
--widget-popup-width: 380px;
--widget-popup-height: 550px;

/* Positions */
--widget-bottom: 20px;
--widget-right: 20px;
```

### Key Classes

```css
.chat-widget                 /* Main container */
.chat-widget-icon            /* Floating icon button */
.chat-widget-badge           /* Unread count badge */
.chat-widget-popup           /* Chat popup window */
.chat-widget-header          /* Popup header */
.chat-widget-error           /* Error banner */
.chat-widget-messages        /* Messages area */
.chat-message                /* Individual message */
.chat-message.sent           /* Message sent by user */
.chat-message.received       /* Message received */
.chat-widget-input           /* Input area */
.chat-widget-send            /* Send button */
```

## 🔄 Message Flow

### Sending Message

```
User Input
    ↓
Click Send / Press Enter
    ↓
Validate (not empty, connected)
    ↓
Publish to /app/chat.send
    ↓
Optimistic Update (add to UI immediately)
    ↓
Backend Process
    ↓
Backend Broadcast to /topic/conversation/{id}
    ↓
Receive in subscription
    ↓
Update UI (check duplicate before add)
```

### Receiving Message

```
Staff sends message
    ↓
Backend Broadcast to /topic/conversation/{id}
    ↓
Widget subscription receives
    ↓
Parse JSON message
    ↓
Add to messages array
    ↓
If widget closed → Increment unreadCount
    ↓
Auto scroll to bottom
```

## 🐛 Error Handling

### Scenarios

1. **No Token**
   ```
   → Show error: "Chưa đăng nhập"
   → Don't connect WebSocket
   ```

2. **WebSocket Connection Failed**
   ```
   → Show error: "Mất kết nối với server"
   → Auto-reconnect after 5s
   ```

3. **API Error (Load Messages)**
   ```
   → Show error: "Không thể tải tin nhắn"
   → Retry button available
   ```

4. **Send Message Failed**
   ```
   → Show error: "Không thể gửi tin nhắn"
   → Message stays in input
   → User can retry
   ```

## 📱 Responsive Design

### Desktop (>480px)
- Icon: 60x60px
- Popup: 380x550px
- Position: 20px from bottom/right

### Mobile (≤480px)
- Icon: 50x50px
- Popup: Full width - 20px margins
- Popup height: 100vh - 100px
- Position: 10px from bottom/right

## ♿ Accessibility

- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels for icon and buttons
- ✅ High contrast mode support
- ✅ Reduced motion support

## 🧪 Testing

### Manual Test Cases

1. **Widget Icon**
   - [ ] Icon hiển thị ở góc dưới phải
   - [ ] Badge hiển thị unread count
   - [ ] Click icon → Mở popup

2. **Load Messages**
   - [ ] Loading spinner hiển thị khi load
   - [ ] Messages hiển thị đúng (sent/received)
   - [ ] Empty state nếu chưa có tin nhắn

3. **WebSocket**
   - [ ] Connection status indicator
   - [ ] Send message thành công
   - [ ] Receive message realtime

4. **Error Handling**
   - [ ] Error banner hiển thị khi có lỗi
   - [ ] Close error button hoạt động
   - [ ] Retry mechanism

5. **Mobile**
   - [ ] Popup responsive trên mobile
   - [ ] Touch interactions hoạt động

## 🔮 Future Enhancements

- [ ] Typing indicator
- [ ] File/Image upload
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Voice messages
- [ ] Read receipts
- [ ] Push notifications
- [ ] Offline message queue

## 📝 Notes

### Constants

```javascript
const WS_URL = 'http://localhost:8080/ws';
const STAFF_USER_ID = 999; // Hardcoded, should fetch from backend
```

### Dependencies

```json
{
  "@stomp/stompjs": "^7.0.0",
  "sockjs-client": "^1.6.1"
}
```

### Files Modified

- `src/App.jsx` - Added ChatWidget integration
- `src/vite.config.js` - Added `global: 'globalThis'` for SockJS

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2024  
**Author**: GitHub Copilot  
**Status**: ✅ Ready for Testing
