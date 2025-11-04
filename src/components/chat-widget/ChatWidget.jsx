import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './ChatWidget.css';

/**
 * FLOATING CHAT WIDGET
 * Widget chat nổi ở góc phải màn hình cho customer
 * - Icon cố định ở góc dưới phải
 * - Click icon → mở popup chat
 * - WebSocket realtime messaging
 * - Tự động reconnect khi mất kết nối
 */
const ChatWidget = ({ user }) => {
  // ==================== STATE MANAGEMENT ====================
  
  // UI State
  const [isOpen, setIsOpen] = useState(false); // Popup mở/đóng
  const [unreadCount, setUnreadCount] = useState(0); // Số tin nhắn chưa đọc
  
  // Chat State
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [inputMessage, setInputMessage] = useState(''); // Tin nhắn đang nhập
  const [conversationId, setConversationId] = useState(null); // ID cuộc trò chuyện
  const [staffId, setStaffId] = useState(null); // ID của staff được phân công
  
  // Connection State
  const [connected, setConnected] = useState(false); // WebSocket connected
  const [connecting, setConnecting] = useState(false); // Đang kết nối
  
  // Loading State
  const [loadingMessages, setLoadingMessages] = useState(false); // Đang load tin nhắn
  const [sendingMessage, setSendingMessage] = useState(false); // Đang gửi tin nhắn
  
  // Error State
  const [error, setError] = useState(null); // Lỗi hiện tại
  
  // Menu State - Cho chức năng sửa/xóa tin nhắn
  const [openMenuId, setOpenMenuId] = useState(null); // ID tin nhắn đang mở menu
  const [editingMessage, setEditingMessage] = useState(null); // Tin nhắn đang sửa {id, content}
  
  // ==================== REFS ====================
  const stompClientRef = useRef(null); // WebSocket client
  const messagesEndRef = useRef(null); // Ref để auto scroll
  const subscriptionRef = useRef(null); // WebSocket subscription
  
  // ==================== CONSTANTS ====================
  const WS_URL = 'http://localhost:8080/ws';

  // ==================== AUTO SCROLL ====================
  
  /**
   * Tự động scroll xuống cuối khi có tin nhắn mới
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // ==================== LOAD MESSAGES FROM API ====================
  
  /**
   * Khởi tạo conversation - Gọi API để backend tự động phân công staff
   */
  const startConversation = async () => {
    console.log('🔵 ===== BẮT ĐẦU KHỞI TẠO CONVERSATION =====');
    
    try {
      setLoadingMessages(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }

      console.log('📞 Gọi API: POST /api/chat/conversation/start');
      console.log('🔑 JWT Token: ✅ Có');

      // Gọi API để backend tự động phân công staff và tạo conversation
      const response = await fetch('http://localhost:8080/api/chat/conversation/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      console.log('✅ Backend response:', responseData);
      
      // Backend trả về: {data: {...}, success: true, message: '...'}
      // Lấy conversationId và staffAccountId từ responseData.data
      const conversationData = responseData.data || responseData;
      const convId = conversationData.conversationId || conversationData.conversation_id;
      
      // ⚠️ QUAN TRỌNG: Phải dùng staffAccountId (account_id), KHÔNG phải staffId (staff_id)
      // Backend tìm receiver trong bảng account, nên cần account_id
      const staffAccountId = conversationData.staffAccountId || conversationData.staff_account_id;
      
      console.log('📦 Full conversation data:', conversationData);
      console.log('✅ Backend đã tạo conversation và phân công staff');
      console.log('💬 Conversation ID:', convId);
      console.log('👤 Staff ID (staff table):', conversationData.staffId);
      console.log('👤 Staff Account ID (account table):', staffAccountId, '← Đây là receiverId!');
      console.log('👤 Staff Name:', conversationData.staffName || 'N/A');

      if (!convId) {
        throw new Error('Backend không trả về conversationId. Response: ' + JSON.stringify(responseData));
      }

      if (!staffAccountId) {
        console.error('❌ Backend không trả về staffAccountId!');
        console.error('Available fields:', Object.keys(conversationData));
        throw new Error('Backend không trả về staffAccountId. Cần field này để gửi tin nhắn!');
      }

      // Lưu conversation ID và staff ACCOUNT ID (để làm receiverId)
      setConversationId(convId);
      setStaffId(staffAccountId);  // Lưu staffAccountId vào state, sẽ dùng làm receiverId

      // Load lịch sử tin nhắn của conversation này
      await loadMessages(convId);

      console.log('🔵 ===== KẾT THÚC KHỞI TẠO CONVERSATION =====\n');

    } catch (err) {
      console.error('❌ ===== LỖI KHỞI TẠO CONVERSATION =====');
      console.error('Error:', err.message);
      setError('Không thể kết nối với hỗ trợ. Vui lòng thử lại sau.');
      console.log('💡 Kiểm tra: Backend có đang chạy không? API /api/chat/conversation/start đã implement chưa?');
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * Load lịch sử tin nhắn từ API
   */
  const loadMessages = async (convId) => {
    if (!convId) {
      console.warn('⚠️ Không có conversationId, bỏ qua load messages');
      return;
    }

    console.log('🔵 ===== BẮT ĐẦU LOAD LỊCH SỬ TIN NHẮN =====');
    console.log('💬 Conversation ID:', convId);

    try {
      setLoadingMessages(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      console.log('📞 Gọi API: GET /api/chat/conversation/' + convId + '/messages');
      console.log('🔑 JWT Token: Bearer ' + token?.substring(0, 20) + '...');

      const response = await fetch(`http://localhost:8080/api/chat/conversation/${convId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Backend có thể trả về {data: [...]} hoặc trực tiếp [...]
      const messagesData = responseData.data || responseData;
      const messagesArray = Array.isArray(messagesData) ? messagesData : [];
      
      console.log('✅ Đã load lịch sử tin nhắn:', messagesArray.length, 'tin nhắn');
      setMessages(messagesArray);
      
      // Đánh dấu đã đọc (Backend chưa implement endpoint này, comment tạm)
      // await markAsRead(convId);

      console.log('🔵 ===== KẾT THÚC LOAD LỊCH SỬ =====\n');

    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
      console.log('💡 API /api/chat/conversation/{id}/messages có hoạt động không?');
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * Đánh dấu đã đọc tin nhắn
   */
  const markAsRead = async (convId) => {
    if (!convId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8080/api/chat/conversation/${convId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setUnreadCount(0);
      console.log('✅ Đã đánh dấu conversation đã đọc');

    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  // ==================== WEBSOCKET CONNECTION ====================
  
  /**
   * Kết nối WebSocket khi mở widget
   */
  const connectWebSocket = () => {
    console.log('🔵 ===== BẮT ĐẦU KẾT NỐI WEBSOCKET =====');
    
    if (stompClientRef.current?.connected) {
      console.log('✅ WebSocket đã kết nối sẵn rồi!');
      console.log('🔵 ===== KẾT THÚC KẾT NỐI =====\n');
      return;
    }

    setConnecting(true);
    setError(null);

    const token = localStorage.getItem('token');
    
    console.log('🔑 Token:', token ? '✅ Có (length: ' + token.length + ')' : '❌ Không có');
    
    if (!token) {
      const errorMsg = 'Chưa đăng nhập. Vui lòng đăng nhập lại.';
      setError(errorMsg);
      setConnecting(false);
      console.error('❌', errorMsg);
      console.log('💡 Hướng dẫn: Login tại /login để có token');
      console.log('🔵 ===== KẾT THÚC KẾT NỐI =====\n');
      return;
    }

    console.log('🔗 WebSocket URL:', WS_URL);
    console.log('🎯 Conversation ID:', conversationId);

    // Tạo STOMP client với SockJS
    const client = new Client({
      webSocketFactory: () => {
        console.log('🏭 Tạo SockJS factory...');
        return new SockJS(WS_URL);
      },
      
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      debug: (str) => {
        console.log('🔵 STOMP:', str);
      },

      reconnectDelay: 5000, // Auto reconnect sau 5s
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ ===== WEBSOCKET KẾT NỐI THÀNH CÔNG! =====');
        setConnected(true);
        setConnecting(false);
        setError(null);

        // Subscribe to conversation topic
        if (conversationId) {
          console.log('📡 Đang subscribe vào topic...');
          subscribeToConversation(client);
        } else {
          console.warn('⚠️ Chưa có conversationId, chưa thể subscribe');
        }
        
        console.log('🔵 ===== KẾT THÚC KẾT NỐI =====\n');
      },

      onStompError: (frame) => {
        console.error('❌ ===== STOMP ERROR =====');
        console.error('Frame:', frame);
        setConnected(false);
        setConnecting(false);
        setError('Mất kết nối với server. Đang thử kết nối lại...');
        console.log('💡 Kiểm tra: Backend có đang chạy tại ' + WS_URL + ' không?');
        console.log('🔵 ===== KẾT THÚC =====\n');
      },

      onWebSocketClose: () => {
        console.warn('⚠️ WebSocket đã đóng');
        setConnected(false);
      },
    });

    console.log('🚀 Đang activate STOMP client...');
    client.activate();
    stompClientRef.current = client;
  };

  /**
   * Subscribe vào conversation topic để nhận tin nhắn realtime
   */
  const subscribeToConversation = (client) => {
    if (!conversationId) {
      console.warn('⚠️ Không có conversationId, bỏ qua subscribe');
      return;
    }

    const topic = `/topic/conversation/${conversationId}`;
    console.log('📡 ===== ĐANG SUBSCRIBE =====');
    console.log('📡 Topic:', topic);

    const subscription = client.subscribe(
      topic,
      (message) => {
        try {
          console.log('📩 ===== NHẬN TIN NHẮN MỚI =====');
          console.log('📩 Raw message:', message);
          
          const newMessage = JSON.parse(message.body);
          console.log('📩 Parsed message:', newMessage);
          console.log('👤 Sender ID:', newMessage.senderId);
          console.log('👤 Current User ID:', user?.id);

          // Thêm tin nhắn mới vào danh sách
          setMessages((prev) => {
            // Kiểm tra duplicate
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('⚠️ Tin nhắn đã tồn tại, bỏ qua (tránh duplicate)');
              return prev;
            }
            
            console.log('✅ Thêm tin nhắn mới vào UI');
            return [...prev, newMessage];
          });

          // Nếu widget đang đóng, tăng unread count
          if (!isOpen) {
            console.log('🔔 Widget đang đóng, tăng unread count');
            setUnreadCount((prev) => prev + 1);
          }
          
          console.log('📩 ===== KẾT THÚC NHẬN TIN NHẮN =====\n');

        } catch (err) {
          console.error('❌ Error parsing message:', err);
        }
      }
    );

    subscriptionRef.current = subscription;
    console.log('✅ Đã subscribe thành công!');
    console.log('⏳ Đang lắng nghe tin nhắn từ topic:', topic);
    console.log('📡 ===== KẾT THÚC SUBSCRIBE =====\n');
  };

  /**
   * Ngắt kết nối WebSocket khi đóng widget
   */
  const disconnectWebSocket = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    setConnected(false);
    console.log('🔌 WebSocket disconnected');
  };

  // ==================== SEND MESSAGE ====================
  
  /**
   * Xóa tin nhắn
   */
  const deleteMessage = async (messageId) => {
    console.log('🗑️ ===== BẮT ĐẦU XÓA TIN NHẮN =====');
    console.log('🗑️ Message ID:', messageId);

    try {
      // Xóa khỏi UI ngay lập tức (optimistic delete)
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== messageId);
        console.log('✅ Đã xóa khỏi UI, số tin nhắn còn lại:', filtered.length);
        return filtered;
      });

      // Gọi API để xóa trên server (nếu backend hỗ trợ)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`http://localhost:8080/api/chat/message/${messageId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('✅ Đã xóa trên server');
        } catch (err) {
          console.warn('⚠️ Không thể xóa trên server (có thể backend chưa implement):', err.message);
        }
      }

      console.log('🗑️ ===== KẾT THÚC XÓA TIN NHẮN =====\n');

    } catch (err) {
      console.error('❌ Lỗi xóa tin nhắn:', err);
      setError('Không thể xóa tin nhắn');
    }
  };
  
  /**
   * Sửa tin nhắn
   */
  const updateMessage = async (messageId, newContent) => {
    console.log('✏️ ===== BẮT ĐẦU SỬA TIN NHẮN =====');
    console.log('✏️ Message ID:', messageId);
    console.log('✏️ New content:', newContent);

    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent, edited: true }
            : msg
        )
      );

      // Clear input và editing state
      setInputMessage('');
      setEditingMessage(null);

      // Gọi API để cập nhật trên server (nếu backend hỗ trợ)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`http://localhost:8080/api/chat/message/${messageId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: newContent }),
          });

          if (response.ok) {
            console.log('✅ Đã cập nhật trên server');
          } else {
            console.warn('⚠️ Không thể cập nhật trên server:', response.status);
          }
        } catch (err) {
          console.warn('⚠️ Không thể cập nhật trên server (có thể backend chưa implement):', err.message);
        }
      }

      console.log('✏️ ===== KẾT THÚC SỬA TIN NHẮN =====\n');

    } catch (err) {
      console.error('❌ Lỗi sửa tin nhắn:', err);
      setError('Không thể sửa tin nhắn');
    }
  };
  
  /**
   * Hủy chế độ sửa tin nhắn
   */
  const cancelEdit = () => {
    setEditingMessage(null);
    setInputMessage('');
  };
  
  /**
   * Gửi tin nhắn qua WebSocket (hoặc sửa tin nhắn)
   */
  const sendMessage = async () => {
    const content = inputMessage.trim();
    
    if (!content) return;
    
    // Nếu đang sửa tin nhắn
    if (editingMessage) {
      await updateMessage(editingMessage.id, content);
      return;
    }
    
    console.log('🔵 ===== BẮT ĐẦU GỬI TIN NHẮN =====');
    console.log('📝 Nội dung:', content);
    console.log('🔌 WebSocket connected:', connected);
    console.log('💬 Conversation ID:', conversationId);
    console.log('👤 Receiver (Staff) ID:', staffId);
    console.log('👤 Sender (User) Object:', user);
    console.log('👤 Sender (User) ID:', user?.id || user?.accountId || user?.userId);
    console.log('👤 Sender (User) Email:', user?.email);
    
    if (!conversationId) {
      const errorMsg = 'Chưa có conversationId. Vui lòng đóng và mở lại widget.';
      setError(errorMsg);
      console.error('❌', errorMsg);
      return;
    }
    
    if (!staffId) {
      const errorMsg = 'Chưa có staffId. Vui lòng đóng và mở lại widget.';
      setError(errorMsg);
      console.error('❌', errorMsg);
      return;
    }
    
    if (!connected) {
      const errorMsg = 'Chưa kết nối WebSocket. Vui lòng thử lại.';
      setError(errorMsg);
      console.error('❌', errorMsg);
      console.log('💡 Lý do: Backend chưa chạy hoặc WebSocket endpoint chưa sẵn sàng');
      return;
    }

    try {
      setSendingMessage(true);
      setError(null);

      const messageData = {
        receiverId: staffId,  // ← QUAN TRỌNG: Gửi cho staff
        content: content,
        timestamp: new Date().toISOString(),
      };

      console.log('📤 Đang gửi qua WebSocket:', messageData);
      console.log('🔗 Destination: /app/chat.send');

      // Gửi qua WebSocket
      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData),
      });

      console.log('✅ Đã gửi qua WebSocket thành công!');

      // Optimistic update: Thêm tin nhắn ngay vào UI
      const userId = user?.id || user?.accountId || user?.userId;
      const tempMessage = {
        id: Date.now(), // Temporary ID
        senderId: userId,
        receiverId: staffId,
        content: content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        conversationId: conversationId,
      };

      console.log('🎨 Optimistic update - Hiển thị tin nhắn ngay:', tempMessage);
      setMessages((prev) => [...prev, tempMessage]);
      setInputMessage(''); // Clear input

      console.log('⏳ Chờ backend broadcast về qua /topic/conversation/' + conversationId);
      console.log('🔵 ===== KẾT THÚC GỬI TIN NHẮN =====\n');

    } catch (err) {
      console.error('❌ ===== LỖI GỬI TIN NHẮN =====');
      console.error('❌ Error:', err);
      console.error('❌ Stack:', err.stack);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      console.log('💡 Kiểm tra: Backend có đang chạy không? WebSocket có kết nối không?');
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Xử lý nhấn Enter để gửi tin nhắn
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==================== WIDGET LIFECYCLE ====================
  
  /**
   * Khi mở widget: Khởi tạo conversation và connect WebSocket
   */
  useEffect(() => {
    if (isOpen) {
      // Nếu chưa có conversationId, gọi API /start để khởi tạo
      if (!conversationId) {
        startConversation();
      } else {
        // Nếu đã có conversationId (đã mở trước đó), chỉ cần load messages
        loadMessages(conversationId);
      }
      
      connectWebSocket();
      setUnreadCount(0); // Reset unread count khi mở
    }
  }, [isOpen]);

  /**
   * Khi có conversationId: Subscribe to topic
   */
  useEffect(() => {
    if (conversationId && connected && stompClientRef.current) {
      subscribeToConversation(stompClientRef.current);
    }
  }, [conversationId, connected]);

  /**
   * Cleanup khi unmount - XÓA HẾT DỮ LIỆU CHAT
   */
  useEffect(() => {
    return () => {
      console.log('🧹 Cleanup: Đang xóa dữ liệu chat...');
      
      // Ngắt kết nối WebSocket
      disconnectWebSocket();
      
      // Xóa hết state
      setMessages([]);
      setConversationId(null);
      setStaffId(null);
      setInputMessage('');
      setEditingMessage(null);
      setOpenMenuId(null);
      setUnreadCount(0);
      setError(null);
      
      // Xóa localStorage (nếu có lưu)
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('conversationId');
      
      console.log('✅ Đã xóa hết dữ liệu chat khi logout');
    };
  }, []);

  /**
   * Reset chat khi user logout (user thay đổi thành null)
   */
  useEffect(() => {
    if (!user) {
      console.log('👤 User logout detected - Resetting chat...');
      
      // Đóng widget
      setIsOpen(false);
      
      // Ngắt kết nối
      disconnectWebSocket();
      
      // Xóa hết state
      setMessages([]);
      setConversationId(null);
      setStaffId(null);
      setInputMessage('');
      setEditingMessage(null);
      setOpenMenuId(null);
      setUnreadCount(0);
      setError(null);
      
      console.log('✅ Chat reset hoàn tất');
    }
  }, [user]);

  // ==================== UI HELPERS ====================
  
  /**
   * Format thời gian tin nhắn
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  /**
   * Đóng error banner
   */
  const closeError = () => {
    setError(null);
  };

  // ==================== RENDER ====================
  
  return (
    <div className="chat-widget">
      {/* FLOATING ICON - Luôn hiển thị */}
      <button
        className="chat-widget-icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Hỗ trợ khách hàng"
      >
        {/* Icon CSKH với headset */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.75 2.45 15.4 3.24 16.84L2 22L7.16 20.76C8.6 21.55 10.25 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white" fillOpacity="0.2"/>
          <path d="M8.5 10C7.67 10 7 10.67 7 11.5V14.5C7 15.33 7.67 16 8.5 16C9.33 16 10 15.33 10 14.5V11.5C10 10.67 9.33 10 8.5 10Z" fill="white"/>
          <path d="M15.5 10C14.67 10 14 10.67 14 11.5V14.5C14 15.33 14.67 16 15.5 16C16.33 16 17 15.33 17 14.5V11.5C17 10.67 16.33 10 15.5 10Z" fill="white"/>
          <path d="M12 18C14.21 18 16 16.21 16 14H8C8 16.21 9.79 18 12 18Z" fill="white"/>
        </svg>
        
        {/* Text CSKH */}
        <span className="chat-widget-icon-text">CSKH</span>
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="chat-widget-badge">{unreadCount}</span>
        )}
      </button>

      {/* CHAT POPUP - Hiện khi click icon */}
      {isOpen && (
        <div className="chat-widget-popup">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-widget-title">
              <i className="fas fa-headset"></i>
              <span>Customer Support</span>
              {connected && (
                <span className="connection-dot connected"></span>
              )}
            </div>
            <button
              className="chat-widget-close"
              onClick={() => setIsOpen(false)}
              title="Đóng"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="chat-widget-error">
              <span>{error}</span>
              <button onClick={closeError}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="chat-widget-messages">
            {loadingMessages ? (
              <div className="chat-widget-loading">
                <div className="spinner"></div>
                <p>Đang tải tin nhắn...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-widget-empty">
                <i className="fas fa-comments"></i>
                <p>Chưa có tin nhắn</p>
                <span>Hãy gửi tin nhắn đầu tiên!</span>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isSentByMe = msg.senderId === user?.id || msg.senderId === user?.accountId;
                  
                  return (
                    <div
                      key={msg.id || index}
                      className={`chat-message ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      <div className="chat-message-bubble">
                        <p>{msg.content}</p>
                        <span className="chat-message-time">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      
                      {/* Menu 3 chấm - chỉ hiện với tin nhắn của mình - BÊN PHẢI */}
                      {isSentByMe && (
                        <div className="chat-message-menu">
                          <button
                            className="chat-message-menu-btn"
                            onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                            title="Tùy chọn"
                          >
                            ⋮
                          </button>
                          
                          {/* Dropdown menu */}
                          {openMenuId === msg.id && (
                            <div className="chat-message-dropdown">
                              <button
                                onClick={() => {
                                  setEditingMessage({ id: msg.id, content: msg.content });
                                  setInputMessage(msg.content);
                                  setOpenMenuId(null);
                                }}
                              >
                                <i className="fas fa-edit"></i>
                                <span>Sửa</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
                                    deleteMessage(msg.id);
                                  }
                                  setOpenMenuId(null);
                                }}
                                className="delete-btn"
                              >
                                <i className="fas fa-trash-alt"></i>
                                <span>Xóa</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="chat-widget-input">
            {/* Editing indicator */}
            {editingMessage && (
              <div className="chat-editing-indicator">
                <span>
                  <i className="fas fa-edit"></i>
                  Đang sửa tin nhắn
                </span>
                <button onClick={cancelEdit} title="Hủy">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            
            <div className="chat-input-row">
              <input
                type="text"
                placeholder={
                  editingMessage
                    ? "Nhập nội dung mới..."
                    : connected 
                    ? "Nhập tin nhắn..." 
                    : "Đang kết nối..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!connected || sendingMessage}
              />
              <button
                className="chat-widget-send"
                onClick={sendMessage}
                disabled={!connected || !inputMessage.trim() || sendingMessage}
                title={editingMessage ? "Lưu" : "Gửi"}
              >
                {sendingMessage ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang gửi...</span>
                  </>
                ) : editingMessage ? (
                  <>
                    <i className="fas fa-check"></i>
                    <span>Lưu</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span>Gửi</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {connecting && (
            <div className="chat-widget-status">
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Đang kết nối...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
