import React, { useState, useEffect } from 'react';
import './PartModal.css';

export default function EditPartModal({ isOpen, onClose, onSave, part }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (part) {
      setQuantity(part.quantity || 1);
    }
  }, [part]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...part,
      quantity: parseInt(quantity),
    });
    onClose();
  };

  if (!isOpen || !part) return null;

  return (
    <div className="part-modal-overlay" onClick={onClose}>
      <div className="part-modal" onClick={e => e.stopPropagation()}>
        <div className="part-modal-header">
          <h2>Chỉnh sửa phụ tùng</h2>
          <button className="part-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="part-modal-body">
          <div className="form-group">
            <label>Tên phụ tùng</label>
            <input 
              type="text" 
              value={part.tenLinhKien}
              className="form-input"
              disabled
            />
          </div>

          <div className="form-group">
            <label>Số lượng</label>
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="part-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
