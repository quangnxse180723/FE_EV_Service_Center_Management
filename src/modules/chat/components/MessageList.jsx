import React, { useEffect, useRef } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Component hiển thị danh sách messages
 * Props:
 * - messages: Array of message objects
 * - currentUserId: ID của user hiện tại (để phân biệt sent/received)
 * - loading: Loading state
 */
const MessageList = ({ messages = [], currentUserId, loading = false }) => {
  const messagesEndRef = useRef(null);

  /**
   * Auto scroll to bottom khi có tin nhắn mới
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Format thời gian hiển thị
   */
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: vi });
      } else if (isYesterday(date)) {
        return 'Hôm qua ' + format(date, 'HH:mm', { locale: vi });
      } else {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
      }
    } catch (err) {
      console.error('Error formatting time:', err);
      return '';
    }
  };

  /**
   * Format ngày phân cách (date divider)
   */
  const formatDateDivider = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      
      if (isToday(date)) {
        return 'Hôm nay';
      } else if (isYesterday(date)) {
        return 'Hôm qua';
      } else {
        return format(date, 'dd/MM/yyyy', { locale: vi });
      }
    } catch (err) {
      return '';
    }
  };

  /**
   * Kiểm tra xem có cần hiển thị date divider không
   */
  const shouldShowDateDivider = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  if (loading) {
    return (
      <div className="message-list">
        <div className="message-list-loading">
          <div className="spinner"></div>
          <p>Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="message-list-empty">
          <i className="fas fa-comments"></i>
          <p>Chưa có tin nhắn nào</p>
          <span>Hãy gửi tin nhắn đầu tiên!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="message-list-content">
        {messages.map((message, index) => {
          const isSentByMe = message.senderId === currentUserId;
          const showDateDivider = shouldShowDateDivider(message, messages[index - 1]);
          
          return (
            <React.Fragment key={message.id || index}>
              {/* Date divider */}
              {showDateDivider && (
                <div className="date-divider">
                  <span>{formatDateDivider(message.timestamp)}</span>
                </div>
              )}

              {/* Message bubble */}
              <div className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                <div className="message-bubble">
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-meta">
                    <span className="message-time">
                      {formatMessageTime(message.timestamp)}
                    </span>
                    
                    {/* Status indicator (chỉ cho tin nhắn đã gửi) */}
                    {isSentByMe && (
                      <span className="message-status">
                        {message.status === 'sent' && (
                          <i className="fas fa-check"></i>
                        )}
                        {message.status === 'delivered' && (
                          <i className="fas fa-check-double"></i>
                        )}
                        {message.status === 'read' && (
                          <i className="fas fa-check-double read"></i>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        {/* Auto scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
