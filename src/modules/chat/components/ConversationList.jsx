import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Component hiển thị danh sách conversations (sidebar)
 * Props:
 * - conversations: Array of conversation objects
 * - selectedConversation: Currently selected conversation
 * - onSelectConversation: Callback khi chọn conversation
 * - loading: Loading state
 */
const ConversationList = ({ 
  conversations = [], 
  selectedConversation, 
  onSelectConversation,
  loading = false 
}) => {
  /**
   * Format thời gian tin nhắn cuối cùng
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (err) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="conversation-list">
        <div className="conversation-list-header">
          <h3>Tin nhắn</h3>
        </div>
        <div className="conversation-list-loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list">
        <div className="conversation-list-header">
          <h3>Tin nhắn</h3>
        </div>
        <div className="conversation-list-empty">
          <p>Chưa có cuộc trò chuyện nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h3>Tin nhắn</h3>
        {conversations.length > 0 && (
          <span className="conversation-count">{conversations.length}</span>
        )}
      </div>
      
      <div className="conversation-list-items">
        {conversations.map((conversation) => {
          const isSelected = selectedConversation?.id === conversation.id;
          const hasUnread = conversation.unreadCount > 0;
          
          return (
            <div
              key={conversation.id}
              className={`conversation-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
              onClick={() => onSelectConversation(conversation)}
            >
              {/* Avatar */}
              <div className="conversation-avatar">
                {conversation.participantAvatar ? (
                  <img src={conversation.participantAvatar} alt={conversation.participantName} />
                ) : (
                  <div className="avatar-placeholder">
                    {conversation.participantName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                
                {/* Online indicator */}
                {conversation.isOnline && (
                  <span className="online-indicator"></span>
                )}
              </div>

              {/* Info */}
              <div className="conversation-info">
                <div className="conversation-header-row">
                  <h4 className="conversation-name">
                    {conversation.participantName || 'Unknown User'}
                  </h4>
                  <span className="conversation-time">
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
                
                <div className="conversation-last-message">
                  <p className={hasUnread ? 'unread-text' : ''}>
                    {conversation.lastMessage || 'Chưa có tin nhắn'}
                  </p>
                  
                  {hasUnread && (
                    <span className="unread-badge">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
