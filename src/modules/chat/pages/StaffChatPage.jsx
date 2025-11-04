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
 * Trang chat dành cho STAFF/ADMIN
 * - Staff có thể có nhiều conversations với nhiều customers
 * - Có danh sách conversations ở sidebar
 */
const StaffChatPage = () => {
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
    fetchConversations,
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
   * Lắng nghe tin nhắn realtime từ WebSocket
   */
  useEffect(() => {
    if (wsConnected) {
      onWebSocketMessage((newMessage) => {
        console.log('📩 Nhận tin nhắn mới từ WebSocket:', newMessage);
        addMessage(newMessage);
        
        // Nếu tin nhắn đến từ conversation khác, refresh danh sách
        if (newMessage.conversationId !== selectedConversation?.id) {
          fetchConversations();
        }
      });
    }
  }, [wsConnected, onWebSocketMessage, addMessage, selectedConversation, fetchConversations]);

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
   * Xử lý refresh conversations
   */
  const handleRefreshConversations = () => {
    fetchConversations();
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

  /**
   * Render connection status
   */
  const renderConnectionStatus = () => {
    return (
      <div className="connection-status-bar">
        <div className="status-item">
          <span className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {wsConnected ? 'Đang kết nối' : wsConnecting ? 'Đang kết nối...' : 'Mất kết nối'}
          </span>
        </div>
        
        <button 
          className="refresh-btn"
          onClick={handleRefreshConversations}
          disabled={loadingConversations}
        >
          <i className={`fas fa-sync ${loadingConversations ? 'fa-spin' : ''}`}></i>
        </button>
      </div>
    );
  };

  return (
    <div className="chat-page staff-chat">
      <div className="chat-container">
        {/* Error banner */}
        {renderError()}

        {/* Connection status */}
        {renderConnectionStatus()}

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
          {selectedConversation ? (
            <>
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
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={wsConnecting || sendingMessage}
                placeholder={
                  wsConnected
                    ? 'Nhập tin nhắn...'
                    : 'Đang kết nối...'
                }
              />
            </>
          ) : (
            <div className="chat-main-empty">
              <i className="fas fa-comments"></i>
              <h3>Chọn một cuộc trò chuyện</h3>
              <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        >
          <i className={`fas ${showMobileSidebar ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default StaffChatPage;
