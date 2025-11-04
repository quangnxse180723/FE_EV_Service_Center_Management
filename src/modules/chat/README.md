# Chat Module - Hệ thống chat realtime

## 📌 Tổng quan

Module chat cung cấp tính năng nhắn tin 1:1 giữa **Customer** và **Staff/Admin** với WebSocket realtime.

## 🏗️ Cấu trúc

```
src/modules/chat/
├── components/          # UI Components
│   ├── ConversationList.jsx    # Danh sách cuộc trò chuyện
│   ├── ChatHeader.jsx          # Header hiển thị người chat
│   ├── MessageList.jsx         # Danh sách tin nhắn
│   └── MessageInput.jsx        # Input nhập tin nhắn + emoji
├── hooks/              # Custom React Hooks
│   ├── useChat.js              # Logic quản lý chat (conversations, messages)
│   └── useWebSocket.js         # Logic quản lý WebSocket connection
├── pages/              # Trang chính
│   ├── CustomerChatPage.jsx   # Trang chat cho CUSTOMER
│   └── StaffChatPage.jsx      # Trang chat cho STAFF
├── services/           # API Services
│   ├── chatApi.js             # HTTP API calls
│   └── websocketService.js    # WebSocket connection service
├── styles/             # CSS Styling
│   └── Chat.css               # Tất cả styles cho chat
└── index.js            # Export module
```

## 🚀 Các tính năng

### ✅ Đã hoàn thành

1. **WebSocket Realtime**
   - Kết nối qua SockJS + STOMP protocol
   - Auto-reconnect khi mất kết nối
   - JWT authentication via Bearer token
   - Heartbeat để giữ connection alive

2. **Chat UI**
   - Sidebar: Danh sách conversations với avatar, online status, unread badge
   - Main chat: Tin nhắn với bubble style, timestamp, read status
   - Input: Textarea tự động resize, emoji picker, send button
   - Header: Hiển thị tên người chat, online status, actions

3. **Dual Mode**
   - **Customer**: Chỉ chat với staff/admin (1 conversation)
   - **Staff**: Chat với nhiều customers (nhiều conversations)

4. **Tính năng nâng cao**
   - Optimistic updates (hiển thị tin nhắn ngay khi gửi)
   - Fallback HTTP nếu WebSocket offline
   - Date divider (phân cách theo ngày)
   - Auto scroll to bottom khi có tin nhắn mới
   - Mobile responsive với sidebar toggle

## 📡 API Endpoints

### HTTP REST API

```javascript
// Lấy danh sách conversations
GET /api/chat/conversations
Response: [
  {
    id: 1,
    participantId: 2,
    participantName: "Nguyễn Văn A",
    participantAvatar: "url",
    lastMessage: "Xin chào",
    lastMessageTime: "2024-11-04T10:30:00",
    unreadCount: 2,
    isOnline: true
  }
]

// Lấy messages của 1 conversation
GET /api/chat/conversation/{conversationId}/messages
Response: [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: "Xin chào",
    timestamp: "2024-11-04T10:30:00",
    status: "read", // sent, delivered, read
    conversationId: 1
  }
]

// Gửi tin nhắn (fallback HTTP)
POST /api/chat/send
Body: { receiverId: 2, content: "Hello" }

// Đánh dấu đã đọc
PUT /api/chat/conversation/{conversationId}/read

// Tạo conversation mới
POST /api/chat/conversation
Body: { userId: 2 }

// Lấy thông tin user
GET /api/users/{userId}
```

### WebSocket

```javascript
// Endpoint
ws://localhost:8080/ws

// Kết nối với JWT
connectHeaders: {
  Authorization: "Bearer {token}"
}

// Subscribe to conversation
/topic/conversation/{conversationId}

// Publish message
/app/chat.send
Body: {
  receiverId: 2,
  content: "Hello",
  timestamp: "2024-11-04T10:30:00"
}
```

## 🛠️ Sử dụng

### 1. Import components

```javascript
import { CustomerChatPage, StaffChatPage } from '@/modules/chat';
```

### 2. Routing (đã thêm vào App.jsx)

```javascript
// Customer chat
<Route path="/customer/chat" element={
  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
    <CustomerChatPage />
  </ProtectedRoute>
} />

// Staff chat
<Route path="/staff/chat" element={<StaffChatPage />} />
```

### 3. Custom hooks usage

```javascript
import { useChat, useWebSocket } from '@/modules/chat';

function MyComponent() {
  // Chat logic
  const {
    conversations,
    messages,
    selectConversation,
    addMessage,
    sendMessageHTTP
  } = useChat();

  // WebSocket
  const {
    connected,
    sendMessage,
    onMessage
  } = useWebSocket(conversationId);

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    onMessage((newMessage) => {
      console.log('New message:', newMessage);
      addMessage(newMessage);
    });
  }, [onMessage, addMessage]);
}
```

## 📦 Dependencies

```json
{
  "sockjs-client": "^1.6.1",
  "@stomp/stompjs": "^7.0.0",
  "date-fns": "^3.0.0"
}
```

## 🔧 Cấu hình Backend (Backend cần implement)

### 1. WebSocket Configuration (Spring Boot)

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
    }
}
```

### 2. JWT Authentication Interceptor

```java
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authToken = accessor.getFirstNativeHeader("Authorization");
            // Validate JWT and set user
        }
        
        return message;
    }
}
```

### 3. Chat Controller

```java
@Controller
public class ChatController {
    
    @MessageMapping("/chat.send")
    @SendTo("/topic/conversation/{conversationId}")
    public ChatMessage sendMessage(@Payload ChatMessage message) {
        // Save to database
        // Broadcast to conversation
        return message;
    }
}
```

## 🎨 CSS Variables (có thể customize)

```css
/* Colors */
--chat-primary: #667eea;
--chat-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--chat-bg: #fafafa;
--chat-bubble-sent: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--chat-bubble-received: white;

/* Sizes */
--sidebar-width: 320px;
--message-max-width: 60%;
```

## 📱 Responsive

- Desktop (>768px): Sidebar cố định bên trái
- Mobile (<=768px): Sidebar overlay, toggle button

## 🐛 Known Issues & Limitations

1. **Emoji Picker**: Chỉ có 12 emoji phổ biến, chưa có full emoji library
2. **File Upload**: Chưa hỗ trợ gửi ảnh/file đính kèm
3. **Typing Indicator**: Chưa có hiển thị "đang nhập..."
4. **Voice/Video Call**: Chưa hỗ trợ
5. **Message Search**: Chưa có tìm kiếm tin nhắn
6. **Message Reactions**: Chưa có react emoji vào tin nhắn

## 🔮 Roadmap

- [ ] Full emoji picker library
- [ ] File/Image upload
- [ ] Typing indicator
- [ ] Voice messages
- [ ] Video call integration
- [ ] Message search
- [ ] Message reactions
- [ ] Group chat
- [ ] Read receipts improvement
- [ ] Push notifications

## 📝 Notes

- WebSocket endpoint: `ws://localhost:8080/ws`
- JWT token lấy từ `localStorage.getItem('token')`
- User info lấy từ `useAuth()` hook
- Auto-reconnect delay: 5000ms
- Heartbeat: 4000ms incoming/outgoing

## 🤝 Contributing

Khi thêm tính năng mới:
1. Cập nhật components trong `components/`
2. Thêm logic vào hooks nếu cần
3. Update CSS trong `styles/Chat.css`
4. Thêm export vào `index.js`
5. Cập nhật README này

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2024  
**Author**: GitHub Copilot
