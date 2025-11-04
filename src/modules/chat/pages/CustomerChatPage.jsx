import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useWebSocket } from '../hooks/useWebSocket';
import ConversationList from '../components/ConversationList';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import '../styles/Chat.css';

/**
 * Trang chat dành cho CUSTOMER
 * - Customer chỉ có 1 conversation với Staff/Admin
 * - Không có danh sách nhiều conversations
 */
const CustomerChatPage = () => {
  const { user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Chat logic
  const {
    conversations,
    selectedConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    error,
    clearError,
    selectConversation,
    addMessage,
    sendMessageHTTP,
  } = useChat();

  // WebSocket connection
  const {
    connected: wsConnected,
    connecting: wsConnecting,
    error: wsError,
    sendMessage: sendMessageWS,
    onMessage: onWebSocketMessage,
  } = useWebSocket(selectedConversation?.id);

  /**
   * Auto-select conversation đầu tiên (hoặc tạo mới nếu chưa có)
   */
  useEffect(() => {
    if (!loadingConversations && conversations.length > 0 && !selectedConversation) {
      selectConversation(conversations[0]);
    }
  }, [conversations, loadingConversations, selectedConversation, selectConversation]);

  /**
   * Lắng nghe tin nhắn realtime từ WebSocket
   */
  useEffect(() => {
    if (wsConnected) {
      onWebSocketMessage((newMessage) => {
        console.log('📩 Nhận tin nhắn mới từ WebSocket:', newMessage);
        addMessage(newMessage);
      });
    }
  }, [wsConnected, onWebSocketMessage, addMessage]);

  /**
   * Xử lý gửi tin nhắn
   */
  const handleSendMessage = async (content) => {
    if (!selectedConversation) {
      alert('Vui lòng chọn cuộc trò chuyện');
      return;
    }

    try {
      const receiverId = selectedConversation.participantId;

      // Ưu tiên gửi qua WebSocket
      if (wsConnected) {
        await sendMessageWS(receiverId, content);
        
        // Tạo tin nhắn tạm thời để hiển thị ngay (optimistic update)
        const tempMessage = {
          id: Date.now(), // Temporary ID
          senderId: user.id,
          receiverId,
          content,
          timestamp: new Date().toISOString(),
          status: 'sent',
          conversationId: selectedConversation.id,
        };
        
        addMessage(tempMessage);
        
      } else {
        // Fallback: Gửi qua HTTP nếu WebSocket không hoạt động
        console.warn('⚠️ WebSocket not connected, fallback to HTTP');
        await sendMessageHTTP(receiverId, content);
      }
      
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  /**
   * Render error message
   */
  const renderError = () => {
    if (!error && !wsError) return null;

    return (
      <div className="chat-error-banner">
        <i className="fas fa-exclamation-triangle"></i>
        <span>{error || wsError}</span>
        <button onClick={clearError}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Error banner */}
        {renderError()}

        {/* Sidebar - Conversation List */}
        <div className={`chat-sidebar ${showMobileSidebar ? 'mobile-show' : ''}`}>
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={(conv) => {
              selectConversation(conv);
              setShowMobileSidebar(false); // Close sidebar on mobile
            }}
            loading={loadingConversations}
          />
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Header */}
          <ChatHeader
            conversation={selectedConversation}
            onBack={() => setShowMobileSidebar(true)}
          />

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={user?.id}
            loading={loadingMessages}
          />

          {/* Input */}
          {selectedConversation && (
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={wsConnecting || sendingMessage}
              placeholder={
                wsConnected
                  ? 'Nhập tin nhắn...'
                  : 'Đang kết nối...'
              }
            />
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </div>
  );
};

export default CustomerChatPage;
