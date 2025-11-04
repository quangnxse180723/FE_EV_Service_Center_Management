import React, { useState, useRef } from 'react';

/**
 * Component nhập tin nhắn với emoji picker
 * Props:
 * - onSendMessage: Callback khi gửi tin nhắn (content)
 * - disabled: Disable input khi đang gửi hoặc chưa kết nối
 * - placeholder: Placeholder text
 */
const MessageInput = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Nhập tin nhắn...' 
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  /**
   * Xử lý gửi tin nhắn
   */
  const handleSend = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled) return;
    
    // Gọi callback
    onSendMessage(trimmedMessage);
    
    // Clear input
    setMessage('');
    
    // Focus lại input
    inputRef.current?.focus();
  };

  /**
   * Xử lý nhấn Enter
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Thêm emoji vào input
   */
  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Emoji phổ biến
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '😢', '😍', '🎉', '👏', '🔥', '💯', '✨'];

  return (
    <div className="message-input-container">
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <span>Emoji</span>
            <button 
              className="close-emoji-picker"
              onClick={() => setShowEmojiPicker(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="emoji-list">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-btn"
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="message-input">
        {/* Action buttons - left */}
        <div className="input-actions-left">
          <button
            className="input-action-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Thêm emoji"
            disabled={disabled}
          >
            <i className="fas fa-smile"></i>
          </button>
          
          {/* Có thể thêm attach file */}
          {/* <button
            className="input-action-btn"
            onClick={() => {}}
            title="Đính kèm file"
            disabled={disabled}
          >
            <i className="fas fa-paperclip"></i>
          </button> */}
        </div>

        {/* Text input */}
        <textarea
          ref={inputRef}
          className="message-textarea"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          rows={1}
          style={{
            resize: 'none',
            overflow: 'hidden',
            minHeight: '40px',
            maxHeight: '120px',
          }}
          onInput={(e) => {
            // Auto-resize textarea
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* Send button */}
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          title="Gửi tin nhắn"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>

      {/* Connection status */}
      {disabled && (
        <div className="connection-status">
          <i className="fas fa-exclamation-circle"></i>
          <span>Đang kết nối...</span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
