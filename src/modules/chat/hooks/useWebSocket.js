import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

/**
 * Custom hook để quản lý WebSocket connection
 * Xử lý: connect, disconnect, subscribe, send message realtime
 */
export const useWebSocket = (conversationId) => {
  // Connection status
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref để lưu callback và tránh re-subscription
  const messageCallbackRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  /**
   * Kết nối WebSocket khi component mount
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ Không có token, bỏ qua WebSocket connection');
      setError('Vui lòng đăng nhập để sử dụng chat realtime');
      return;
    }

    // Nếu đã kết nối rồi thì không kết nối lại
    if (websocketService.isConnected()) {
      console.log('✅ WebSocket đã kết nối sẵn');
      setConnected(true);
      return;
    }

    // Bắt đầu kết nối
    setConnecting(true);
    setError(null);

    websocketService.connect(
      token,
      // onConnected callback
      () => {
        console.log('✅ WebSocket connected successfully');
        setConnected(true);
        setConnecting(false);
        setError(null);
      },
      // onError callback
      (err) => {
        console.error('❌ WebSocket connection error:', err);
        setConnected(false);
        setConnecting(false);
        setError('Lỗi kết nối WebSocket. Tin nhắn sẽ gửi qua HTTP.');
      }
    );

    // Cleanup khi component unmount
    return () => {
      // Chỉ disconnect khi thực sự cần (ví dụ: user logout)
      // Thông thường giữ connection để tái sử dụng
      console.log('🔄 Component unmount - giữ WebSocket connection');
    };
  }, []); // Chỉ chạy 1 lần khi mount

  /**
   * Subscribe/Unsubscribe khi conversationId thay đổi
   */
  useEffect(() => {
    if (!connected || !conversationId) return;

    console.log(`📡 Subscribing to conversation: ${conversationId}`);
    
    // Subscribe với callback từ ref
    websocketService.subscribeToConversation(
      conversationId,
      (message) => {
        console.log('📩 Nhận tin nhắn realtime:', message);
        
        // Gọi callback nếu có
        if (messageCallbackRef.current) {
          messageCallbackRef.current(message);
        }
      }
    );

    // Cleanup: Unsubscribe khi conversation thay đổi hoặc unmount
    return () => {
      console.log(`🔌 Unsubscribing from conversation: ${conversationId}`);
      websocketService.unsubscribeFromConversation(conversationId);
    };
  }, [connected, conversationId]);

  /**
   * Update conversationId ref khi prop thay đổi
   */
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  /**
   * Gửi tin nhắn qua WebSocket
   */
  const sendMessage = useCallback(async (receiverId, content) => {
    if (!connected) {
      throw new Error('WebSocket chưa kết nối. Vui lòng thử lại.');
    }

    try {
      const message = {
        receiverId,
        content,
        timestamp: new Date().toISOString(),
      };

      console.log('📤 Gửi tin nhắn qua WebSocket:', message);
      websocketService.sendMessage(message);
      
      return message;
      
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn WebSocket:', err);
      throw err;
    }
  }, [connected]);

  /**
   * Đăng ký callback để nhận tin nhắn mới
   */
  const onMessage = useCallback((callback) => {
    messageCallbackRef.current = callback;
  }, []);

  /**
   * Manually disconnect (dùng khi logout)
   */
  const disconnect = useCallback(() => {
    console.log('🔌 Manually disconnecting WebSocket');
    websocketService.disconnect();
    setConnected(false);
    setConnecting(false);
  }, []);

  /**
   * Retry connection nếu bị mất kết nối
   */
  const reconnect = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Không có token để kết nối lại');
      return;
    }

    console.log('🔄 Thử kết nối lại WebSocket...');
    setConnecting(true);
    setError(null);

    // Disconnect trước khi reconnect
    websocketService.disconnect();

    // Connect lại
    websocketService.connect(
      token,
      () => {
        console.log('✅ Reconnected successfully');
        setConnected(true);
        setConnecting(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Reconnection failed:', err);
        setConnected(false);
        setConnecting(false);
        setError('Không thể kết nối lại. Vui lòng refresh trang.');
      }
    );
  }, []);

  return {
    // Connection status
    connected,
    connecting,
    error,
    
    // Actions
    sendMessage,
    onMessage,
    disconnect,
    reconnect,
  };
};
