import React from 'react';

/**
 * Component hiển thị header của chat conversation
 * Props:
 * - conversation: Current conversation object
 * - onBack: Callback để quay lại (mobile view)
 */
const ChatHeader = ({ conversation, onBack }) => {
  if (!conversation) {
    return (
      <div className="chat-header empty">
        <h3>Chọn một cuộc trò chuyện để bắt đầu</h3>
      </div>
    );
  }

  return (
    <div className="chat-header">
      {/* Back button (mobile only) */}
      {onBack && (
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
      )}

      {/* Participant info */}
      <div className="chat-header-info">
        <div className="chat-avatar">
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

        <div className="chat-participant-details">
          <h3>{conversation.participantName || 'Unknown User'}</h3>
          <p className="status-text">
            {conversation.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="chat-header-actions">
        {/* Có thể thêm các action như search, call, video call */}
        <button className="header-action-btn" title="Tìm kiếm">
          <i className="fas fa-search"></i>
        </button>
        <button className="header-action-btn" title="Thêm tùy chọn">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
