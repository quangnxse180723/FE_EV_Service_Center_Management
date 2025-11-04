import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * WebSocket Service sử dụng SockJS và STOMP
 * Quản lý kết nối WebSocket real-time cho chat
 */

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map(); // Lưu trữ các subscription
  }

  /**
   * Kết nối đến WebSocket server
   * @param {string} token - JWT token để authenticate
   * @param {function} onConnected - Callback khi kết nối thành công
   * @param {function} onError - Callback khi có lỗi
   */
  connect(token, onConnected, onError) {
    // Tạo SockJS socket
    const socket = new SockJS('http://localhost:8080/ws');

    // Khởi tạo STOMP client
    this.client = new Client({
      webSocketFactory: () => socket,
      
      // Headers để authenticate với JWT
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Callback khi kết nối thành công
      onConnect: (frame) => {
        console.log('✅ WebSocket connected:', frame);
        this.connected = true;
        if (onConnected) onConnected(frame);
      },

      // Callback khi có lỗi
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },

      // Callback khi WebSocket bị disconnect
      onWebSocketClose: () => {
        console.log('🔌 WebSocket closed');
        this.connected = false;
      },

      // Tự động reconnect khi mất kết nối
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // Debug mode (tắt trong production)
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📡 STOMP:', str);
        }
      },
    });

    // Activate connection
    this.client.activate();
  }

  /**
   * Subscribe vào một topic để nhận tin nhắn real-time
   * @param {string} conversationId - ID của cuộc hội thoại
   * @param {function} callback - Callback xử lý khi nhận message
   */
  subscribeToConversation(conversationId, callback) {
    if (!this.client || !this.connected) {
      console.error('❌ WebSocket chưa kết nối!');
      return null;
    }

    const destination = `/topic/conversation/${conversationId}`;

    // Subscribe và lưu subscription
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log('📨 Nhận tin nhắn mới:', parsedMessage);
        callback(parsedMessage);
      } catch (error) {
        console.error('❌ Lỗi parse message:', error);
      }
    });

    // Lưu subscription để có thể unsubscribe sau
    this.subscriptions.set(conversationId, subscription);
    console.log(`✅ Subscribed to conversation ${conversationId}`);

    return subscription;
  }

  /**
   * Unsubscribe khỏi một conversation
   * @param {string} conversationId - ID của cuộc hội thoại
   */
  unsubscribeFromConversation(conversationId) {
    const subscription = this.subscriptions.get(conversationId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(conversationId);
      console.log(`✅ Unsubscribed from conversation ${conversationId}`);
    }
  }

  /**
   * Gửi tin nhắn qua WebSocket
   * @param {object} message - {receiverId, content}
   */
  sendMessage(message) {
    if (!this.client || !this.connected) {
      console.error('❌ WebSocket chưa kết nối!');
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });
      console.log('✅ Gửi tin nhắn:', message);
      return true;
    } catch (error) {
      console.error('❌ Lỗi gửi tin nhắn:', error);
      return false;
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe tất cả
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Deactivate client
      this.client.deactivate();
      this.connected = false;
      console.log('🔌 Đã ngắt kết nối WebSocket');
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.connected && this.client && this.client.connected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
