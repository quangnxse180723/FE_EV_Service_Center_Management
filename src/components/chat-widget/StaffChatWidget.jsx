import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './StaffChatWidget.css';

/**
 * STAFF CHAT WIDGET
 * Widget chat nổi ở góc phải màn hình cho staff
 * - Icon cố định ở góc dưới phải
 * - Click icon → mở popup chat với sidebar + chat panel
 * - Sidebar: Danh sách customer đã chat
 * - Chat panel: Tin nhắn với customer được chọn
 * - WebSocket realtime messaging
 */
const StaffChatWidget = ({ user }) => {
  // ==================== STATE MANAGEMENT ====================
  
  // UI State
  const [isOpen, setIsOpen] = useState(false); // Popup mở/đóng
  const [unreadCount, setUnreadCount] = useState(0); // Tổng số tin nhắn chưa đọc
  
  // Conversations State
  const [conversations, setConversations] = useState([]); // Danh sách conversation
  const [selectedConversation, setSelectedConversation] = useState(null); // Conversation đang chọn
  const [loadingConversations, setLoadingConversations] = useState(false); // Đang load danh sách
  
  // Messages State
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn của conversation hiện tại
  const [inputMessage, setInputMessage] = useState(''); // Tin nhắn đang nhập
  const [loadingMessages, setLoadingMessages] = useState(false); // Đang load tin nhắn
  const [sendingMessage, setSendingMessage] = useState(false); // Đang gửi tin nhắn
  
  // Edit/Delete State
  const [hoveredMessageId, setHoveredMessageId] = useState(null); // Message đang hover
  const [showMenuId, setShowMenuId] = useState(null); // Message đang hiện menu
  const [editingMessageId, setEditingMessageId] = useState(null); // Message đang edit
  const [editContent, setEditContent] = useState(''); // Nội dung edit
  
  // WebSocket State
  const [connected, setConnected] = useState(false); // WebSocket connected
  const [connecting, setConnecting] = useState(false); // Đang kết nối
  
  // Error State
  const [error, setError] = useState(null); // Lỗi hiện tại
  
  // ==================== REFS ====================
  const stompClientRef = useRef(null); // WebSocket client
  const messagesEndRef = useRef(null); // Ref để auto scroll
  const subscriptionRef = useRef(null); // WebSocket subscription cho conversation hiện tại
  const allMessagesSubscriptionRef = useRef(null); // WebSocket subscription cho tất cả tin nhắn
  
  // ==================== CONSTANTS ====================
  const WS_URL = 'http://localhost:8080/ws';
  const API_BASE_URL = 'http://localhost:8080/api';

  // ==================== AUTO SCROLL ====================
  
  /**
   * Tự động scroll xuống cuối khi có tin nhắn mới
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==================== API CALLS ====================
  
  /**
   * Lấy danh sách conversations từ backend
   */
  const loadConversations = async () => {
    console.log('📋 ===== BẮT ĐẦU LOAD CONVERSATIONS =====');
    setLoadingConversations(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }

      console.log('🔗 Calling API: GET /api/chat/conversations');
      
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      // Backend có thể trả về {data: [...]} hoặc trực tiếp [...]
      const rawList = Array.isArray(data) ? data : (data.data || []);

      // Normalize fields to a consistent shape to avoid brittle code when
      // backend returns snake_case or nested objects.
      const conversationsList = rawList.map((conv) => ({
        conversationId: conv.conversationId || conv.conversation_id || conv.id,
        customerAccountId:
          conv.customerAccountId ||
          conv.customer_account_id ||
          (conv.customer && (conv.customer.accountId || conv.customer.account_id)) ||
          (conv.customerAccount && (conv.customerAccount.accountId || conv.customerAccount.account_id)) ||
          null,
        customerName: conv.customerName || conv.customer_name || (conv.customer && (conv.customer.fullName || conv.customer.full_name)) || null,
        customerEmail: conv.customerEmail || conv.customer_email || (conv.customer && conv.customer.email) || null,
        unreadCount: conv.unreadCount || conv.unread_count || 0,
        lastMessage: conv.lastMessage || conv.last_message || conv.preview || null,
        lastMessageTime: conv.lastMessageTime || conv.last_message_time || conv.updatedAt || conv.updated_at || null,
        __raw: conv,
      }));

      console.log('✅ Loaded conversations:', conversationsList.length);

      setConversations(conversationsList);

      // Tính tổng unread count
      const totalUnread = conversationsList.reduce((sum, conv) => 
        sum + (conv.unreadCount || 0), 0
      );
      setUnreadCount(totalUnread);

      console.log('📋 ===== KẾT THÚC LOAD CONVERSATIONS =====\n');

    } catch (err) {
      console.error('❌ Lỗi load conversations:', err);
      setError('Không thể tải danh sách khách hàng: ' + err.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  /**
   * Lấy lịch sử tin nhắn của 1 conversation
   */
  const loadMessages = async (conversationId) => {
    console.log('💬 ===== BẮT ĐẦU LOAD MESSAGES =====');
    console.log('💬 Conversation ID:', conversationId);
    
    setLoadingMessages(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Chưa đăng nhập');
      }

      console.log(`🔗 Calling API: GET /api/chat/conversation/${conversationId}/messages`);
      
      const response = await fetch(`${API_BASE_URL}/chat/conversation/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      // Backend có thể trả về {data: [...]} hoặc trực tiếp [...]
      const messagesList = Array.isArray(data) ? data : (data.data || []);
      
      console.log('✅ Loaded messages:', messagesList.length);
      
      setMessages(messagesList);

      console.log('💬 ===== KẾT THÚC LOAD MESSAGES =====\n');

    } catch (err) {
      console.error('❌ Lỗi load messages:', err);
      setError('Không thể tải tin nhắn: ' + err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ==================== WEBSOCKET ====================
  
  /**
   * Kết nối WebSocket
   */
  const connectWebSocket = () => {
    console.log('🔵 ===== BẮT ĐẦU KẾT NỐI WEBSOCKET =====');

    if (stompClientRef.current?.active) {
      console.log('⚠️ WebSocket đã connected, bỏ qua');
      return;
    }

    setConnecting(true);
    setError(null);

    const token = localStorage.getItem('token');
    
    console.log('🔑 Token:', token ? '✅ Có' : '❌ Không có');
    
    if (!token) {
      setError('Chưa đăng nhập');
      setConnecting(false);
      return;
    }

    console.log('🔗 WebSocket URL:', WS_URL);

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

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ ===== WEBSOCKET KẾT NỐI THÀNH CÔNG! =====');
        setConnected(true);
        setConnecting(false);
        setError(null);

        // Subscribe to topic chung để nhận tất cả tin nhắn từ customer
        subscribeToAllMessages(client);

        // Subscribe to conversation nếu đã chọn
        if (selectedConversation) {
          subscribeToConversation(client, selectedConversation.conversationId);
        }
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        setError('Lỗi kết nối WebSocket');
        setConnected(false);
        setConnecting(false);
      },

      onWebSocketError: (event) => {
        console.error('❌ WebSocket error:', event);
        setError('Lỗi kết nối mạng');
        setConnected(false);
        setConnecting(false);
      },

      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        setConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  /**
   * Subscribe to topic chung để nhận tất cả tin nhắn từ customer
   */
  const subscribeToAllMessages = (client) => {
    console.log('📡 ===== SUBSCRIBE TO ALL CUSTOMER MESSAGES =====');
    
    const topic = '/topic/staff/all-messages';
    console.log('📡 Topic:', topic);
    console.log('📡 Current staff user:', user);

    const subscription = client.subscribe(
      topic,
      (message) => {
        try {
          console.log('📩 ===== NHẬN TIN NHẮN MỚI TỪ CUSTOMER =====');
          console.log('📩 Raw message:', message);
          
          const newMessage = JSON.parse(message.body);
          console.log('📩 Parsed Message:', newMessage);
          console.log('📩 Conversation ID:', newMessage.conversationId);
          console.log('📩 Sender ID:', newMessage.senderId);
          console.log('📩 Content:', newMessage.content);
          
          // Hiển thị notification để test
          console.log('🔔 STAFF NHẬN ĐƯỢC TIN NHẮN MỚI!');
          
          // Reload conversations để hiển thị tin nhắn mới trong sidebar
          console.log('🔄 Reloading conversations...');
          loadConversations();
          
          // Nếu đang xem conversation này, thêm message vào
          if (selectedConversation && selectedConversation.conversationId === newMessage.conversationId) {
            console.log('✅ Đang xem conversation này, thêm message vào UI');
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('⚠️ Message đã tồn tại, skip');
                return prev;
              }
              console.log('➕ Thêm message mới vào danh sách');
              return [...prev, newMessage];
            });
          } else {
            console.log('ℹ️ Không đang xem conversation này');
          }
          
          // Tăng unread count
          setUnreadCount((prev) => {
            const newCount = prev + 1;
            console.log(`🔔 Unread count: ${prev} -> ${newCount}`);
            return newCount;
          });
          
          console.log('✅ Đã xử lý tin nhắn mới từ customer');
          console.log('📩 ===== KẾT THÚC XỬ LÝ TIN NHẮN =====\n');
          
        } catch (err) {
          console.error('❌ Error parsing message:', err);
          console.error('❌ Stack:', err.stack);
        }
      }
    );

    allMessagesSubscriptionRef.current = subscription;
    console.log('✅ Đã subscribe vào topic chung thành công!');
    console.log('⏳ Đang lắng nghe tin nhắn từ:', topic);
    console.log('📡 ===== KẾT THÚC SUBSCRIBE TO ALL MESSAGES =====\n');
  };

  /**
   * Subscribe to conversation topic để nhận tin nhắn realtime
   */
  const subscribeToConversation = (client, conversationId) => {
    console.log('📡 ===== BẮT ĐẦU SUBSCRIBE =====');
    console.log('📡 Conversation ID:', conversationId);

    // Unsubscribe previous subscription nếu có
    if (subscriptionRef.current) {
      console.log('🔕 Unsubscribing previous topic...');
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    const topic = `/topic/conversation/${conversationId}`;
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
          console.log('👤 Current Staff ID:', user?.id);

          // Thêm tin nhắn mới vào danh sách
          setMessages((prev) => {
            // Kiểm tra duplicate
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('⚠️ Tin nhắn đã tồn tại, bỏ qua');
              return prev;
            }
            
            console.log('✅ Thêm tin nhắn mới vào UI');
            return [...prev, newMessage];
          });

          // Cập nhật unread count nếu tin nhắn từ customer
          if (newMessage.senderId !== user?.id && newMessage.senderId !== user?.accountId) {
            console.log('🔔 Tin nhắn từ customer, tăng unread count');
            setUnreadCount((prev) => prev + 1);
            
            // Reload conversations để cập nhật unread count
            loadConversations();
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
   * Ngắt kết nối WebSocket
   */
  const disconnectWebSocket = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (allMessagesSubscriptionRef.current) {
      allMessagesSubscriptionRef.current.unsubscribe();
      allMessagesSubscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    setConnected(false);
    console.log('🔌 WebSocket disconnected');
  };

  // ==================== MESSAGE ACTIONS ====================
  
  /**
   * Gửi tin nhắn qua WebSocket
   */
  const sendMessage = async () => {
    const content = inputMessage.trim();
    
    if (!content) return;
    
    if (!selectedConversation) {
      setError('Chưa chọn khách hàng');
      return;
    }
    
    console.log('🔵 ===== BẮT ĐẦU GỬI TIN NHẮN (STAFF) =====');
    console.log('📝 Nội dung:', content);

    // Robust extraction of receiver/account id — backend may return different field names
    const receiverId =
      selectedConversation.customerAccountId ||
      selectedConversation.customer_account_id ||
      (selectedConversation.customer && (selectedConversation.customer.accountId || selectedConversation.customer.account_id)) ||
      (selectedConversation.__raw && (selectedConversation.__raw.customerAccountId || selectedConversation.__raw.customer_account_id)) ||
      null;

    const convId = selectedConversation.conversationId || selectedConversation.conversation_id || selectedConversation.id || (selectedConversation.__raw && (selectedConversation.__raw.conversationId || selectedConversation.__raw.conversation_id));

    console.log('💬 Resolved Conversation ID:', convId);
    console.log('👤 Resolved Receiver (Customer) Account ID:', receiverId);

    if (!receiverId) {
      console.error('❌ Không xác định được receiverId cho customer. Raw conversation:', selectedConversation.__raw || selectedConversation);
      setError('Không xác định được khách hàng nhận tin. Vui lòng refresh danh sách.');
      return;
    }

    if (!connected || !stompClientRef.current || !stompClientRef.current.active) {
      setError('Chưa kết nối WebSocket. Vui lòng thử lại.');
      console.warn('⚠️ WS not connected - stompClientRef:', stompClientRef.current);
      return;
    }

    try {
      setSendingMessage(true);
      setError(null);

      const messageData = {
        receiverId: receiverId, // Account ID của customer
        content: content,
        timestamp: new Date().toISOString(),
        conversationId: convId,
      };

      console.log('📤 Đang gửi qua WebSocket (publish):', messageData);

      try {
        stompClientRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(messageData),
        });

        console.log('✅ publish() returned (no exception)');
      } catch (pubErr) {
        console.error('❌ publish() threw error:', pubErr);

        // Fallback: try REST POST /api/chat/message as a backup (if backend exposes it)
        try {
          const token = localStorage.getItem('token');
          if (token) {
            console.warn('🔁 Fallback to REST POST /api/chat/message');
            const resp = await fetch(`${API_BASE_URL}/chat/message`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ conversationId: convId, receiverId, content }),
            });

            if (!resp.ok) {
              console.error('❌ Fallback REST send failed', resp.status, resp.statusText);
              throw new Error('Fallback REST send failed: ' + resp.status);
            }

            console.log('✅ Fallback REST send succeeded');
          }
        } catch (restErr) {
          console.error('❌ Fallback REST also failed:', restErr);
          setError('Không thể gửi tin nhắn qua WebSocket và REST.');
          throw restErr; // rethrow to outer catch
        }
      }

      // Optimistic update: Thêm tin nhắn ngay vào UI
      const userId = user?.id || user?.accountId;
      const tempMessage = {
        id: Date.now(),
        senderId: userId,
        receiverId: receiverId,
        content: content,
        timestamp: new Date().toISOString(),
        conversationId: convId,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Clear input
      setInputMessage('');

      console.log('🔵 ===== KẾT THÚC GỬI TIN NHẮN (STAFF) =====\n');

    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
      setError('Không thể gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Xử lý Enter key để gửi tin nhắn
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==================== EDIT/DELETE MESSAGES ====================
  
  /**
   * Bắt đầu edit tin nhắn
   */
  const startEditMessage = (msg) => {
    setEditingMessageId(msg.messageId || msg.id);
    setEditContent(msg.content);
    setShowMenuId(null);
  };

  /**
   * Hủy edit
   */
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  /**
   * Lưu tin nhắn đã edit
   */
  const saveEditMessage = async (messageId) => {
    const newContent = editContent.trim();
    
    if (!newContent) {
      setError('Tin nhắn không được rỗng');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/chat/message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Không thể sửa tin nhắn');
      }

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          (msg.messageId || msg.id) === messageId
            ? { ...msg, content: newContent }
            : msg
        )
      );

      cancelEdit();
    } catch (err) {
      console.error('❌ Lỗi sửa tin nhắn:', err);
      setError('Không thể sửa tin nhắn');
    }
  };

  /**
   * Xóa tin nhắn
   */
  const deleteMessage = async (messageId) => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa tin nhắn');
      }

      // Remove from local state
      setMessages((prev) =>
        prev.filter((msg) => (msg.messageId || msg.id) !== messageId)
      );

      setShowMenuId(null);
    } catch (err) {
      console.error('❌ Lỗi xóa tin nhắn:', err);
      setError('Không thể xóa tin nhắn');
    }
  };

  /**
   * Toggle menu
   */
  const toggleMenu = (messageId) => {
    setShowMenuId(showMenuId === messageId ? null : messageId);
  };

  // ==================== CONVERSATION SELECTION ====================
  
  /**
   * Chọn conversation để chat
   */
  const selectConversation = async (conversation) => {
    console.log('🎯 Selected conversation:', conversation);
    
    setSelectedConversation(conversation);
    setMessages([]); // Clear old messages
    
    // Load messages
    await loadMessages(conversation.conversationId);
    
    // Subscribe to WebSocket topic
    if (stompClientRef.current?.active) {
      subscribeToConversation(stompClientRef.current, conversation.conversationId);
    }
  };

  // ==================== WIDGET LIFECYCLE ====================
  
  /**
   * Auto-connect WebSocket khi component mount để luôn nhận tin nhắn
   */
  useEffect(() => {
    if (user) {
      console.log('🚀 Staff component mounted, auto-connecting WebSocket...');
      connectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [user]);
  
  /**
   * Khi mở widget: Load conversations
   */
  useEffect(() => {
    if (isOpen) {
      loadConversations();
      // WebSocket đã connect rồi, không cần connect lại
      if (!connected && !connecting) {
        connectWebSocket();
      }
    }
  }, [isOpen]);

  /**
   * Reset khi user logout
   */
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      disconnectWebSocket();
      setConversations([]);
      setMessages([]);
      setSelectedConversation(null);
      setUnreadCount(0);
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
   * Format ngày cho conversation
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const today = new Date();
      
      if (date.toDateString() === today.toDateString()) {
        return formatTime(timestamp);
      } else {
        return date.toLocaleDateString('vi-VN');
      }
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

  /**
   * Đóng context menu khi click ra ngoài
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenuId) {
        setShowMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenuId]);

  // ==================== RENDER ====================
  
  return (
    <div className="staff-chat-widget">
      {/* FLOATING ICON - Luôn hiển thị */}
      <div 
        className={`staff-chat-icon ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat với khách hàng"
      >
        <i className="fas fa-comments"></i>
        <span className="staff-chat-icon-text">CSKH</span>
        {unreadCount > 0 && (
          <span className="staff-chat-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {/* POPUP CHAT WINDOW - Messenger style */}
      {isOpen && (
        <div className="staff-chat-popup">
          {/* Header */}
          <div className="staff-chat-header">
            <div className="staff-chat-title">
              <i className="fas fa-comments"></i>
              <span>Hỗ trợ khách hàng</span>
              {connected && (
                <span className="connection-dot connected"></span>
              )}
            </div>
            <button
              className="staff-chat-close"
              onClick={() => setIsOpen(false)}
              title="Đóng"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="staff-chat-error">
              <span>{error}</span>
              <button onClick={closeError}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Main Content - Messenger Layout */}
          <div className="staff-chat-content">
            {/* LEFT SIDEBAR - Conversations List */}
            <div className="staff-chat-sidebar">
              <div className="sidebar-header">
                <h3>Khách hàng</h3>
                <button 
                  onClick={loadConversations}
                  disabled={loadingConversations}
                  title="Refresh"
                >
                  <i className={`fas fa-sync ${loadingConversations ? 'fa-spin' : ''}`}></i>
                </button>
              </div>

              <div className="conversations-list">
                {loadingConversations ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>Chưa có khách hàng</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.conversationId}
                      className={`conversation-item ${
                        selectedConversation?.conversationId === conv.conversationId ? 'active' : ''
                      }`}
                      onClick={() => selectConversation(conv)}
                    >
                      <div className="conversation-avatar">
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <div className="conversation-info">
                        <div className="conversation-name">
                          {conv.customerName || 'Khách hàng'}
                          {conv.unreadCount > 0 && (
                            <span className="unread-badge">{conv.unreadCount}</span>
                          )}
                        </div>
                        <div className="conversation-preview">
                          {typeof conv.lastMessage === 'object' 
                            ? conv.lastMessage?.content || 'Chưa có tin nhắn'
                            : conv.lastMessage || 'Chưa có tin nhắn'}
                        </div>
                      </div>
                      <div className="conversation-time">
                        {formatDate(conv.lastMessageTime)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT PANEL - Chat Messages */}
            <div className="staff-chat-panel">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-panel-header">
                    <div className="customer-info">
                      <i className="fas fa-user-circle"></i>
                      <div>
                        <h4>{selectedConversation.customerName}</h4>
                        <span>{selectedConversation.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="chat-messages">
                    {loadingMessages ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải tin nhắn...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-comments"></i>
                        <p>Chưa có tin nhắn</p>
                        <span>Bắt đầu cuộc trò chuyện!</span>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, index) => {
                          const isSentByMe = msg.senderId === user?.id || msg.senderId === user?.accountId;
                          const msgId = msg.messageId || msg.id;
                          const isEditing = editingMessageId === msgId;
                          
                          return (
                            <div
                              key={msgId || index}
                              className={`chat-message ${isSentByMe ? 'sent' : 'received'}`}
                              onContextMenu={(e) => {
                                if (isSentByMe && !isEditing) {
                                  e.preventDefault();
                                  setShowMenuId(msgId);
                                  // Set vị trí menu
                                  const menu = document.getElementById(`context-menu-${msgId}`);
                                  if (menu) {
                                    menu.style.top = `${e.clientY}px`;
                                    menu.style.left = `${e.clientX}px`;
                                  }
                                }
                              }}
                            >
                              <div className="message-bubble">
                                {isEditing ? (
                                  <div className="edit-message-form">
                                    <input
                                      type="text"
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') saveEditMessage(msgId);
                                        if (e.key === 'Escape') cancelEdit();
                                      }}
                                      autoFocus
                                    />
                                    <div className="edit-actions">
                                      <button onClick={() => saveEditMessage(msgId)}>✓</button>
                                      <button onClick={cancelEdit}>✕</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p>{msg.content}</p>
                                    <span className="message-time">
                                      {formatTime(msg.timestamp)}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Context Menu - Hiện khi chuột phải */}
                              {isSentByMe && showMenuId === msgId && !isEditing && (
                                <div 
                                  id={`context-menu-${msgId}`}
                                  className="context-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button onClick={() => startEditMessage(msg)}>
                                    <i className="fas fa-edit"></i> Sửa
                                  </button>
                                  <button onClick={() => deleteMessage(msgId)}>
                                    <i className="fas fa-trash"></i> Xóa
                                  </button>
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
                  <div className="chat-input-area">
                    <input
                      type="text"
                      placeholder={
                        connected 
                          ? "Nhập tin nhắn..." 
                          : "Đang kết nối..."
                      }
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!connected || sendingMessage}
                    />
                    <button
                      className="send-button"
                      onClick={sendMessage}
                      disabled={!connected || !inputMessage.trim() || sendingMessage}
                      title="Gửi tin nhắn"
                    >
                      {sendingMessage ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          <span>Gửi</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-conversation-selected">
                  <i className="fas fa-comments"></i>
                  <h3>Chọn khách hàng để bắt đầu chat</h3>
                  <p>Chọn một khách hàng từ danh sách bên trái</p>
                </div>
              )}
            </div>
          </div>

          {/* Connection Status */}
          {connecting && (
            <div className="connection-status">
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Đang kết nối...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffChatWidget;