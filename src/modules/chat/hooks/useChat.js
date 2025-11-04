import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import chatApi from '../services/chatApi';

/**
 * Custom hook để quản lý chat logic
 * Xử lý: conversations, messages, loading states, errors
 */
export const useChat = () => {
  const navigate = useNavigate();
  
  // State quản lý conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  // State quản lý messages
  const [messages, setMessages] = useState([]);
  
  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Error states
  const [error, setError] = useState(null);

  /**
   * Lấy danh sách conversations khi component mount
   */
  useEffect(() => {
    fetchConversations();
  }, []);

  /**
   * Fetch danh sách conversations từ API
   */
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError(null);
      
      const response = await chatApi.getConversations();
      setConversations(response.data || []);
      
      console.log('✅ Đã tải conversations:', response.data);
    } catch (err) {
      console.error('❌ Lỗi tải conversations:', err);
      handleError(err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  /**
   * Fetch messages của một conversation
   */
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    try {
      setLoadingMessages(true);
      setError(null);
      
      const response = await chatApi.getMessages(conversationId);
      setMessages(response.data || []);
      
      console.log('✅ Đã tải messages:', response.data);
      
      // Đánh dấu đã đọc
      await chatApi.markAsRead(conversationId);
      
    } catch (err) {
      console.error('❌ Lỗi tải messages:', err);
      handleError(err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  /**
   * Chọn một conversation
   */
  const selectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    if (conversation) {
      fetchMessages(conversation.id);
    }
  }, [fetchMessages]);

  /**
   * Thêm tin nhắn mới vào danh sách (khi nhận từ WebSocket)
   */
  const addMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => {
      // Kiểm tra tin nhắn đã tồn tại chưa (tránh duplicate)
      const exists = prevMessages.some(msg => msg.id === newMessage.id);
      if (exists) return prevMessages;
      
      return [...prevMessages, newMessage];
    });

    // Cập nhật conversation list (đưa conversation có tin nhắn mới lên đầu)
    setConversations((prevConvs) => {
      const updated = prevConvs.map(conv => {
        if (conv.id === newMessage.conversationId) {
          return {
            ...conv,
            lastMessage: newMessage.content,
            lastMessageTime: newMessage.timestamp,
            unreadCount: conv.unreadCount + 1,
          };
        }
        return conv;
      });
      
      // Sắp xếp: conversation mới nhất lên đầu
      return updated.sort((a, b) => 
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
    });
  }, []);

  /**
   * Gửi tin nhắn (fallback HTTP nếu WebSocket không hoạt động)
   */
  const sendMessageHTTP = useCallback(async (receiverId, content) => {
    try {
      setSendingMessage(true);
      setError(null);
      
      const response = await chatApi.sendMessage({ receiverId, content });
      
      // Thêm message vào UI ngay lập tức
      addMessage(response.data);
      
      console.log('✅ Đã gửi tin nhắn qua HTTP:', response.data);
      return response.data;
      
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
      handleError(err);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [addMessage]);

  /**
   * Tạo conversation mới
   */
  const createConversation = useCallback(async (userId) => {
    try {
      setLoadingConversations(true);
      setError(null);
      
      const response = await chatApi.createConversation(userId);
      const newConv = response.data;
      
      // Thêm vào danh sách
      setConversations((prev) => [newConv, ...prev]);
      
      // Tự động chọn conversation mới
      selectConversation(newConv);
      
      console.log('✅ Đã tạo conversation:', newConv);
      return newConv;
      
    } catch (err) {
      console.error('❌ Lỗi tạo conversation:', err);
      handleError(err);
      throw err;
    } finally {
      setLoadingConversations(false);
    }
  }, [selectConversation]);

  /**
   * Xử lý lỗi (kiểm tra JWT expire, redirect nếu cần)
   */
  const handleError = (err) => {
    // Nếu lỗi 401 Unauthorized hoặc token hết hạn
    if (err.response?.status === 401) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Xóa token và redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } else if (err.response?.status === 403) {
      setError('Bạn không có quyền truy cập. Vui lòng kiểm tra lại.');
      
    } else if (err.response?.status === 500) {
      setError('Lỗi server. Vui lòng thử lại sau.');
      
    } else if (err.message === 'Network Error') {
      setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet.');
      
    } else {
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi không xác định.');
    }
  };

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    conversations,
    selectedConversation,
    messages,
    
    // Loading states
    loadingConversations,
    loadingMessages,
    sendingMessage,
    
    // Error
    error,
    clearError,
    
    // Actions
    fetchConversations,
    fetchMessages,
    selectConversation,
    addMessage,
    sendMessageHTTP,
    createConversation,
  };
};
