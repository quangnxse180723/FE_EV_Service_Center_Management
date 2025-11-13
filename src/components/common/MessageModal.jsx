import React from 'react';
import './MessageModal.css';

const MessageModal = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'success':
        return 'icon-success';
      case 'error':
        return 'icon-error';
      case 'warning':
        return 'icon-warning';
      case 'info':
      default:
        return 'icon-info';
    }
  };

  return (
    <div className="message-modal-overlay" onClick={onClose}>
      <div className="message-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`message-icon ${getIconClass()}`}>
          {getIcon()}
        </div>
        
        {title && <h3 className="message-title">{title}</h3>}
        
        <p className="message-text">{message}</p>
        
        <div className="message-actions">
          <button className="btn-confirm" onClick={handleConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
